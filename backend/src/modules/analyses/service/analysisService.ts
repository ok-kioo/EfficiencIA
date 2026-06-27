import { query } from "../../../infra/db.js";
import { HttpError } from "../../../infra/errors.js";
import { callAnalysisAgent } from "../../../infra/n8n.js";
import { findOwned } from "../../projects/service/projectService.js";
import type { Analysis } from "../domain/Analysis.js";

export async function listForProject(
  userId: string,
  projectId: string,
): Promise<Analysis[]> {
  await findOwned(userId, projectId); // ownership check
  const { rows } = await query<Analysis>(
    `SELECT id, project_id, status, summary, bottlenecks, modeling_issues,
            improvement_suggestions, final_assessment, error, created_at, finished_at
     FROM analyses WHERE project_id = $1 ORDER BY created_at DESC`,
    [projectId],
  );
  return rows;
}

export interface RecentAnalysis extends Analysis {
  project_name: string;
}

export async function listRecent(userId: string, limit = 5): Promise<RecentAnalysis[]> {
  const { rows } = await query<RecentAnalysis>(
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

export async function findOne(userId: string, id: string): Promise<Analysis> {
  const { rows } = await query<Analysis & { user_id: string }>(
    `SELECT a.*, p.user_id
     FROM analyses a
     JOIN projects p ON p.id = a.project_id
     WHERE a.id = $1`,
    [id],
  );
  const row = rows[0];
  if (!row || row.user_id !== userId) {
    throw new HttpError(404, "Análise não encontrada.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id, ...analysis } = row;
  return analysis;
}

export async function createForProject(
  userId: string,
  projectId: string,
): Promise<Analysis> {
  const project = await findOwned(userId, projectId);

  const created = await query<Analysis>(
    `INSERT INTO analyses (project_id, status) VALUES ($1, 'running')
     RETURNING id, project_id, status, summary, bottlenecks, modeling_issues,
               improvement_suggestions, final_assessment, error, created_at, finished_at`,
    [projectId],
  );
  const analysis = created.rows[0];

  try {
    const result = await callAnalysisAgent({
      projectId: project.id,
      projectName: project.name,
      bpmnXml: project.bpmn_xml,
      activities: project.activities,
    });
    const updated = await query<Analysis>(
      `UPDATE analyses SET
         status = 'done',
         summary = $2,
         bottlenecks = $3::jsonb,
         modeling_issues = $4::jsonb,
         improvement_suggestions = $5::jsonb,
         final_assessment = $6::jsonb,
         finished_at = NOW()
       WHERE id = $1
       RETURNING id, project_id, status, summary, bottlenecks, modeling_issues,
                 improvement_suggestions, final_assessment, error, created_at, finished_at`,
      [
        analysis.id,
        result.summary,
        JSON.stringify(result.bottlenecks),
        JSON.stringify(result.modelingIssues),
        JSON.stringify(result.improvementSuggestions),
        JSON.stringify(result.finalAssessment),
      ],
    );
    return updated.rows[0];
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha desconhecida ao analisar.";
    const updated = await query<Analysis>(
      `UPDATE analyses SET status = 'failed', error = $2, finished_at = NOW()
       WHERE id = $1
       RETURNING id, project_id, status, summary, bottlenecks, modeling_issues,
                 improvement_suggestions, final_assessment, error, created_at, finished_at`,
      [analysis.id, message],
    );
    return updated.rows[0];
  }
}
