import { query } from "../../../infra/db.js";
import { HttpError } from "../../../infra/errors.js";
import type { Project } from "../domain/Project.js";

export async function listByUser(userId: string): Promise<Project[]> {
  const { rows } = await query<Project>(
    `SELECT id, user_id, name, description, bpmn_xml, activities, created_at, updated_at
     FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId],
  );
  return rows;
}

export async function findOwned(userId: string, id: string): Promise<Project> {
  const { rows } = await query<Project>(
    `SELECT id, user_id, name, description, bpmn_xml, activities, created_at, updated_at
     FROM projects WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  if (!rows[0]) throw new HttpError(404, "Projeto não encontrado.");
  return rows[0];
}

export async function create(
  userId: string,
  input: { name: string; description?: string; bpmnXml?: string; activities?: unknown[] },
): Promise<Project> {
  const { rows } = await query<Project>(
    `INSERT INTO projects (user_id, name, description, bpmn_xml, activities)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id, user_id, name, description, bpmn_xml, activities, created_at, updated_at`,
    [
      userId,
      input.name,
      input.description ?? null,
      input.bpmnXml ?? "",
      JSON.stringify(input.activities ?? []),
    ],
  );
  return rows[0];
}

export async function update(
  userId: string,
  id: string,
  input: {
    name?: string;
    description?: string | null;
    bpmnXml?: string;
    activities?: unknown[];
  },
): Promise<Project> {
  await findOwned(userId, id);
  const { rows } = await query<Project>(
    `UPDATE projects SET
       name        = COALESCE($3, name),
       description = COALESCE($4, description),
       bpmn_xml    = COALESCE($5, bpmn_xml),
       activities  = COALESCE($6::jsonb, activities),
       updated_at  = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, name, description, bpmn_xml, activities, created_at, updated_at`,
    [
      id,
      userId,
      input.name ?? null,
      input.description ?? null,
      input.bpmnXml ?? null,
      input.activities ? JSON.stringify(input.activities) : null,
    ],
  );
  return rows[0];
}

export async function remove(userId: string, id: string): Promise<void> {
  const { rowCount } = await query(
    "DELETE FROM projects WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  if (!rowCount) throw new HttpError(404, "Projeto não encontrado.");
}
