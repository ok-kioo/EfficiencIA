import { DOMParser } from "@xmldom/xmldom";

//todo: metadata deve ser extraída do frontend e não do BPMN, pois o BPMN não possui campos para armazenar essas informações
//todo: sanitizar entradas
//todo: O campo 'condition' no edge note deve ser preeenchido pelo nome da condição do gateway caso o nó seja um gateway, caso contrário, não deve ser preenchido. Se o nome do fluxo de sequência estiver vazio, o campo 'condition' deve ser preenchido com uma string vazia.

const N8N_URL =
  process.env.N8N_WEBHOOK_URL ?? "http://localhost:5678/webhook/assist-bpmn";
const TIMEOUT_MS = Number(process.env.N8N_TIMEOUT_MS ?? 60000);

const DEFAULT_OBJECTIVE =
  "Avaliar possíveis gargalos, erros e inconsistências no processo BPMN";

interface ActivityMetadata {
  id?: string;
  name?: string;
  type?: string;
  responsible?: string;
  resource?: string;
  averageTimeMinutes?: number | string;
  cost?: number | string;
  demandVolume?: number | string;
  criticality?: string;
  observations?: string;
  area?: string;
  stageType?: string;
  monthlyVolume?: number | string;
  averageTime?: number | string;
  [key: string]: unknown;
}

export interface AnalysisInput {
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
  condition?: string;
}

export interface AnalysisPayload {
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
  "exclusiveGateway",
  "parallelGateway",
  "inclusiveGateway",
  "eventBasedGateway",
  "complexGateway",
]);

function localName(tag: string): string {
  const idx = tag.indexOf(":");
  return idx === -1 ? tag : tag.slice(idx + 1);
}

function buildActivityIndex(activities: unknown): Map<string, ActivityMetadata> {
  const map = new Map<string, ActivityMetadata>();
  if (!Array.isArray(activities)) return map;
  for (const raw of activities) {
    if (!raw || typeof raw !== "object") continue;
    const act = raw as ActivityMetadata;
    if (act.id) map.set(String(act.id), act);
  }
  return map;
}

function buildMetadata(act: ActivityMetadata | undefined): Record<string, unknown> | undefined {
  if (!act) return undefined;
  const meta: Record<string, unknown> = {
    responsible: act.responsible ?? "",
    averageTime:
      act.averageTime ??
      (act.averageTimeMinutes !== undefined ? act.averageTimeMinutes : ""),
    monthlyVolume:
      act.monthlyVolume ?? (act.demandVolume !== undefined ? act.demandVolume : ""),
    stageType: act.stageType ?? act.type ?? "",
    cost: act.cost ?? "",
    area: act.area ?? act.resource ?? "",
    criticality: act.criticality ?? "",
    observations: act.observations ?? "",
  };
  const hasValue = Object.values(meta).some(
    (v) => v !== "" && v !== undefined && v !== null,
  );
  return hasValue ? meta : undefined;
}

export function buildAnalysisPayload(input: AnalysisInput): AnalysisPayload {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const activityIndex = buildActivityIndex(input.activities);

  if (input.bpmnXml) {
    const doc = new DOMParser({
      errorHandler: () => {console.log("Error parsing BPMN XML")},
    }).parseFromString(input.bpmnXml, "text/xml");

    const visit = (node: ChildNode | null) => {
      if (!node) return;
      // Element node
      if ((node as { nodeType?: number }).nodeType === 1) {
        const el = node as unknown as Element;
        const tag = localName(el.tagName ?? el.nodeName ?? "");
        const id = el.getAttribute?.("id") ?? "";
        const name = el.getAttribute?.("name") ?? "";

        if (tag === "sequenceFlow" && id) {
          edges.push({
            id,
            source: el.getAttribute?.("sourceRef") ?? "",
            target: el.getAttribute?.("targetRef") ?? "",
            ...(name ? { condition: name } : {}),
          });
        } else if (NODE_TAGS.has(tag) && id) {
          const meta = buildMetadata(activityIndex.get(id));
          const graphNode: GraphNode = { id, type: tag, name };
          if (meta) graphNode.metadata = meta;
          nodes.push(graphNode);
        }
      }
      const children = (node as { childNodes?: ArrayLike<ChildNode> }).childNodes;
      if (children) {
        for (let i = 0; i < children.length; i++) visit(children[i]);
      }
    };

    visit(doc as unknown as ChildNode);
  }

  return {
    processName: input.projectName,
    objective: DEFAULT_OBJECTIVE,
    graph: { nodes, edges },
  };
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
      throw new Error(`Agente respondeu HTTP ${response.status}`);
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
  } finally {
    clearTimeout(timeout);
  }
}
