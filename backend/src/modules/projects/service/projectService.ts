import { HttpError } from "../../../infra/errors.js";
import type { Project } from "../domain/entity/Project.js";
import type {
  CreateProjectData,
  ProjectRepository,
  UpdateProjectData,
} from "../domain/repository/ProjectRepository";
import { projectRepository } from "../domain/repository/ProjectPgRepository";

export function makeProjectService(repo: ProjectRepository) {
  async function listByUser(userId: string): Promise<Project[]> {
    return repo.listByUser(userId);
  }

  async function findOwned(userId: string, id: string): Promise<Project> {
    const project = await repo.findOwned(userId, id);
    if (!project) throw new HttpError(404, "Projeto não encontrado.");
    return project;
  }

  async function create(
    userId: string,
    input: CreateProjectData,
  ): Promise<Project> {
    return repo.create(userId, input);
  }

  async function update(
    userId: string,
    id: string,
    input: UpdateProjectData,
  ): Promise<Project> {
    const existing = await repo.findOwned(userId, id);
    if (!existing) throw new HttpError(404, "Projeto não encontrado.");
    const updated = await repo.update(userId, id, input);
    if (!updated) throw new HttpError(404, "Projeto não encontrado.");
    return updated;
  }

  async function remove(userId: string, id: string): Promise<void> {
    const ok = await repo.remove(userId, id);
    if (!ok) throw new HttpError(404, "Projeto não encontrado.");
  }

  return { listByUser, findOwned, create, update, remove };
}

const defaultService = makeProjectService(projectRepository);

export const listByUser = defaultService.listByUser;
export const findOwned = defaultService.findOwned;
export const create = defaultService.create;
export const update = defaultService.update;
export const remove = defaultService.remove;
