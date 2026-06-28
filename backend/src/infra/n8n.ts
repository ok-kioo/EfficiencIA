import { DOMParser } from "@xmldom/xmldom";
import { z } from "zod";
import { HttpError } from "./errors.js";

const N8N_URL =
  process.env.N8N_WEBHOOK_URL ?? "http://localhost:5678/webhook/assist-bpmn";
const TIMEOUT_MS = Number(process.env.N8N_TIMEOUT_MS ?? 60000);

const DEFAULT_OBJECTIVE =
  "Avaliar possíveis gargalos, erros e inconsistências no processo BPMN";

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function sanitizeString(value: unknown, maxLen = 500): string {
  if (value === null || value === undefined) return "";
  const raw = typeof value === "string" ? value : String(value);
  return raw.replace(CONTROL_CHARS, "").trim().slice(0, maxLen);
}

function sanitizeNumber(value: unknown): number | "" {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "";
  return n;
}

const activityMetadataSchema = z.object({
  id: z.string().min(1),
  responsible: z.unknown().optional(),
  averageTime: z.unknown().optional(),
  monthlyVolume: z.unknown().optional(),
  stageType: z.unknown().optional(),
  cost: z.unknown().optional(),
  area: z.unknown().optional(),
  criticality: z.unknown().optional(),
  observations: z.unknown().optional(),
});

type ActivityMetadataInput = z.infer<typeof activityMetadataSchema>;

export interface AnalysisInput {
  id: string;
  projectId: string;
  projectName: string;
  bpmnXml: string;
  activities: unknown;
}

export interface GraphNode {
  id: string;
  type: string;
  name: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  condition?: string; // só presente quando source é um gateway
}

export interface AnalysisPayload {
  id: string;
  processName: string;
  objective: string;
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface AnalysisResult {
  summary: string;
  bottlenecks: unknown[];
  modelingIssues: unknown[];
  improvementSuggestions: unknown[];
  finalAssessment: { score: number; explanation: string };
}

const GATEWAY_TAGS = new Set([
  "exclusiveGateway",
  "parallelGateway",
  "inclusiveGateway",
  "eventBasedGateway",
  "complexGateway",
]);

const NODE_TAGS = new Set([
  "task",
  "userTask",
  "manualTask",
  "serviceTask",
  "scriptTask",
  "businessRuleTask",
  "sendTask",
  "receiveTask",
  "callActivity",
  "subProcess",
  "startEvent",
  "endEvent",
  "intermediateThrowEvent",
  "intermediateCatchEvent",
  "boundaryEvent",
  ...GATEWAY_TAGS,
]);

function localName(tag: string): string {
  const idx = tag.indexOf(":");
  return idx === -1 ? tag : tag.slice(idx + 1);
}

function buildActivityIndex(
  activities: unknown,
): Map<string, ActivityMetadataInput> {
  const map = new Map<string, ActivityMetadataInput>();
  if (!Array.isArray(activities)) return map;
  for (const raw of activities) {
    const parsed = activityMetadataSchema.safeParse(raw);
    if (!parsed.success) continue;
    map.set(parsed.data.id, parsed.data);
  }
  return map;
}

function buildMetadata(
  act: ActivityMetadataInput | undefined,
): Record<string, unknown> | undefined {
  if (!act) return undefined;
  const meta: Record<string, unknown> = {
    responsible: sanitizeString(act.responsible),
    averageTime: sanitizeNumber(act.averageTime),
    monthlyVolume: sanitizeNumber(act.monthlyVolume),
    stageType: sanitizeString(act.stageType, 100),
    cost: sanitizeNumber(act.cost),
    area: sanitizeString(act.area),
    criticality: sanitizeString(act.criticality, 50),
    observations: sanitizeString(act.observations, 2000),
  };
  const hasValue = Object.values(meta).some((v) => v !== "" && v !== undefined);
  return hasValue ? meta : undefined;
}

export function buildAnalysisPayload(input: AnalysisInput): AnalysisPayload {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const activityIndex = buildActivityIndex(input.activities);
  const nodeTypeById = new Map<string, string>();
  const pendingEdges: Array<{
    id: string;
    source: string;
    target: string;
    name: string;
  }> = [];

  if (input.bpmnXml) {
    const doc = new DOMParser({
      errorHandler: (level, msg) => {
        if (level === "error" || level === "fatalError") {
          throw new HttpError(422, `BPMN inválido: ${msg}`);
        }
      },
    }).parseFromString(input.bpmnXml, "text/xml");

    const visit = (node: ChildNode | null) => {
      if (!node) return;
      // Element node
      if ((node as { nodeType?: number }).nodeType === 1) {
        const el = node as unknown as Element;
        const tag = localName(el.tagName ?? el.nodeName ?? "");
        const id = el.getAttribute?.("id") ?? "";
        const name = sanitizeString(el.getAttribute?.("name") ?? "", 200);

        if (tag === "sequenceFlow" && id) {
          pendingEdges.push({
            id,
            source: el.getAttribute?.("sourceRef") ?? "",
            target: el.getAttribute?.("targetRef") ?? "",
            name,
          });
        } else if (NODE_TAGS.has(tag) && id) {
          const meta = buildMetadata(activityIndex.get(id));
          const graphNode: GraphNode = { id, type: tag, name };
          if (meta) graphNode.metadata = meta;
          nodes.push(graphNode);
          nodeTypeById.set(id, tag);
        }
      }
      const children = (node as { childNodes?: ArrayLike<ChildNode> }).childNodes;
      if (children) {
        for (let i = 0; i < children.length; i++) visit(children[i]);
      }
    };

    visit(doc as unknown as ChildNode);

    // Edges são resolvidos após visitar todos os nós, para sabermos o tipo do source.
    for (const e of pendingEdges) {
      const sourceType = nodeTypeById.get(e.source);
      const isGatewaySource = sourceType ? GATEWAY_TAGS.has(sourceType) : false;
      const edge: GraphEdge = { id: e.id, source: e.source, target: e.target };
      if (isGatewaySource) edge.condition = e.name; // "" quando vazio
      edges.push(edge);
    }
  }

  const payload: AnalysisPayload = {
    id: sanitizeString(input.id, 100),
    processName: sanitizeString(input.projectName, 200) || "Processo sem nome",
    objective: DEFAULT_OBJECTIVE,
    graph: { nodes, edges },
  };

  if (payload.graph.nodes.length === 0) {
    throw new HttpError(422, "O BPMN não contém nós analisáveis.");
  }

  return payload;
}

export async function callAnalysisAgent(input: AnalysisInput): Promise<AnalysisResult> {
  const payload = buildAnalysisPayload(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(
        `Agente respondeu HTTP ${response.status} em ${N8N_URL}: ${bodyText.slice(0, 500)}`,
      );
    }
    const data = (await response.json()) as Partial<AnalysisResult>;
    return {
      summary: data.summary ?? "",
      bottlenecks: Array.isArray(data.bottlenecks) ? data.bottlenecks : [],
      modelingIssues: Array.isArray(data.modelingIssues) ? data.modelingIssues : [],
      improvementSuggestions: Array.isArray(data.improvementSuggestions)
        ? data.improvementSuggestions
        : [],
      finalAssessment: {
        score: Number(data.finalAssessment?.score ?? 0),
        explanation: String(data.finalAssessment?.explanation ?? ""),
      },
    };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    const cause = err instanceof Error ? err : new Error(String(err));
    if (cause.name === "AbortError") {
      throw new Error(
        `Timeout (${TIMEOUT_MS}ms) ao contatar agente em ${N8N_URL}`,
      );
    }
    // TypeError: fetch failed → quase sempre rede (ECONNREFUSED/DNS/socket fechado)
    if (cause.message === "fetch failed" || cause.name === "TypeError") {
      const inner = (cause as { cause?: { code?: string; message?: string } }).cause;
      const detail = inner?.code ?? inner?.message ?? cause.message;
      throw new Error(`Falha ao contatar agente em ${N8N_URL}: ${detail}`);
    }
    throw cause;
  } finally {
    clearTimeout(timeout);
  }
}
