import type { Analysis } from "../entity/Analysis";

export interface CreateAnalysisData {
  projectId: string;
}

export interface AnalysisSuccessData {
  summary: string;
  bottlenecks: unknown[];
  modelingIssues: unknown[];
  improvementSuggestions: unknown[];
  finalAssessment: { score: number; explanation: string };
}

export interface RecentAnalysisRow extends Analysis {
  project_name: string;
}

export interface OwnedAnalysisRow extends Analysis {
  user_id: string;
}

export interface AnalysisRepository {
  listForProject(projectId: string): Promise<Analysis[]>;
  listRecentForUser(userId: string, limit: number): Promise<RecentAnalysisRow[]>;
  findByIdWithOwner(id: string): Promise<OwnedAnalysisRow | null>;
  createRunning(projectId: string): Promise<Analysis>;
  markDone(id: string, data: AnalysisSuccessData): Promise<Analysis>;
  markFailed(id: string, error: string): Promise<Analysis>;
}