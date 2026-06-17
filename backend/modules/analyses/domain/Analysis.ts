export type AnalysisStatus = "pending" | "running" | "done" | "failed";

export interface Analysis {
  id: string;
  project_id: string;
  status: AnalysisStatus;
  summary: string | null;
  bottlenecks: unknown[];
  modeling_issues: unknown[];
  improvement_suggestions: unknown[];
  final_assessment: { score: number; explanation: string };
  error: string | null;
  created_at: string;
  finished_at: string | null;
}
