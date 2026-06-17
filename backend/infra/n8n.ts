const N8N_URL =
  process.env.N8N_WEBHOOK_URL ?? "http://localhost:5678/webhook/assist-bpmn";
const TIMEOUT_MS = Number(process.env.N8N_TIMEOUT_MS ?? 60000);

export interface AnalysisPayload {
  projectId: string;
  projectName: string;
  bpmnXml: string;
  activities: unknown;
}

export interface AnalysisResult {
  summary: string;
  bottlenecks: unknown[];
  modelingIssues: unknown[];
  improvementSuggestions: unknown[];
  finalAssessment: { score: number; explanation: string };
}

export async function callAnalysisAgent(payload: AnalysisPayload): Promise<AnalysisResult> {
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
