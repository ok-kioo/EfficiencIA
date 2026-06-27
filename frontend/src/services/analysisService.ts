import { api } from "./api";

export interface FinalAssessment {
  score: number;
  explanation: string;
}

export interface Analysis {
  id: string;
  project_id: string;
  status: "running" | "done" | "failed";
  summary: string | null;
  bottlenecks: unknown[] | null;
  modeling_issues: unknown[] | null;
  improvement_suggestions: unknown[] | null;
  final_assessment: FinalAssessment | null;
  error: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface RecentAnalysis extends Analysis {
  project_name: string;
}

export const analysisService = {
  async createForProject(projectId: string): Promise<Analysis> {
    const { data } = await api.post<Analysis>(`/api/projects/${projectId}/analyses`);
    return data;
  },
  async listForProject(projectId: string): Promise<Analysis[]> {
    const { data } = await api.get<Analysis[]>(`/api/projects/${projectId}/analyses`);
    return data;
  },
  async get(id: string): Promise<Analysis> {
    const { data } = await api.get<Analysis>(`/api/analyses/${id}`);
    return data;
  },
  async listRecent(limit = 5): Promise<RecentAnalysis[]> {
    const { data } = await api.get<RecentAnalysis[]>(`/api/analyses/recent`, {
      params: { limit },
    });
    return data;
  },
};
