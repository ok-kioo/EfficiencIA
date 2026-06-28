import { query } from "../../../../infra/db";
import type { Project } from "../entity/Project";
import type {
  CreateProjectData,
  ProjectRepository,
  UpdateProjectData,
} from "./ProjectRepository";

const COLUMNS =
  "id, user_id, name, description, bpmn_xml, activities, created_at, updated_at";

export class ProjectPgRepository implements ProjectRepository {
  async listByUser(userId: string): Promise<Project[]> {
    const { rows } = await query<Project>(
      `SELECT ${COLUMNS} FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId],
    );
    return rows;
  }

  async findOwned(userId: string, id: string): Promise<Project | null> {
    const { rows } = await query<Project>(
      `SELECT ${COLUMNS} FROM projects WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return rows[0] ?? null;
  }

  async create(userId: string, input: CreateProjectData): Promise<Project> {
    const { rows } = await query<Project>(
      `INSERT INTO projects (user_id, name, description, bpmn_xml, activities)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING ${COLUMNS}`,
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

  async update(
    userId: string,
    id: string,
    input: UpdateProjectData,
  ): Promise<Project | null> {
    const { rows } = await query<Project>(
      `UPDATE projects SET
         name        = COALESCE($3, name),
         description = COALESCE($4, description),
         bpmn_xml    = COALESCE($5, bpmn_xml),
         activities  = COALESCE($6::jsonb, activities),
         updated_at  = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING ${COLUMNS}`,
      [
        id,
        userId,
        input.name ?? null,
        input.description ?? null,
        input.bpmnXml ?? null,
        input.activities ? JSON.stringify(input.activities) : null,
      ],
    );
    return rows[0] ?? null;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const { rowCount } = await query(
      "DELETE FROM projects WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  }
}

export const projectRepository: ProjectRepository = new ProjectPgRepository();