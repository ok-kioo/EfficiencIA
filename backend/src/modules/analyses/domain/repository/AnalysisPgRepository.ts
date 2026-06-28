import { query } from "../../../../infra/db";
import type { Analysis } from "../entity/Analysis";
import type {
  AnalysisRepository,
  AnalysisSuccessData,
  OwnedAnalysisRow,
  RecentAnalysisRow,
} from "./AnalysisRepository";

const COLUMNS = `id, project_id, status, summary, bottlenecks, modeling_issues,
  improvement_suggestions, final_assessment, error, created_at, finished_at`;

export class AnalysisPgRepository implements AnalysisRepository {
  async listForProject(projectId: string): Promise<Analysis[]> {
    const { rows } = await query<Analysis>(
      `SELECT ${COLUMNS} FROM analyses WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId],
    );
    return rows;
  }

  async listRecentForUser(
    userId: string,
    limit: number,
  ): Promise<RecentAnalysisRow[]> {
    const { rows } = await query<RecentAnalysisRow>(
      `SELECT a.id, a.project_id, a.status, a.summary, a.bottlenecks, a.modeling_issues,
              a.improvement_suggestions, a.final_assessment, a.error, a.created_at,
              a.finished_at, p.name AS project_name
       FROM analyses a
       JOIN projects p ON p.id = a.project_id
       WHERE p.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [userId, limit],
    );
    return rows;
  }

  async findByIdWithOwner(id: string): Promise<OwnedAnalysisRow | null> {
    const { rows } = await query<OwnedAnalysisRow>(
      `SELECT a.*, p.user_id
       FROM analyses a
       JOIN projects p ON p.id = a.project_id
       WHERE a.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async createRunning(projectId: string): Promise<Analysis> {
    const { rows } = await query<Analysis>(
      `INSERT INTO analyses (project_id, status) VALUES ($1, 'running')
       RETURNING ${COLUMNS}`,
      [projectId],
    );
    return rows[0];
  }

  async markDone(id: string, data: AnalysisSuccessData): Promise<Analysis> {
    const { rows } = await query<Analysis>(
      `UPDATE analyses SET
         status = 'done',
         summary = $2,
         bottlenecks = $3::jsonb,
         modeling_issues = $4::jsonb,
         improvement_suggestions = $5::jsonb,
         final_assessment = $6::jsonb,
         finished_at = NOW()
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [
        id,
        data.summary,
        JSON.stringify(data.bottlenecks),
        JSON.stringify(data.modelingIssues),
        JSON.stringify(data.improvementSuggestions),
        JSON.stringify(data.finalAssessment),
      ],
    );
    return rows[0];
  }

  async markFailed(id: string, error: string): Promise<Analysis> {
    const { rows } = await query<Analysis>(
      `UPDATE analyses SET status = 'failed', error = $2, finished_at = NOW()
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [id, error],
    );
    return rows[0];
  }
}

export const analysisRepository: AnalysisRepository = new AnalysisPgRepository();