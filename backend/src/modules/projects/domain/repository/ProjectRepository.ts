import type { Project } from "../entity/Project";

export interface CreateProjectData {
  name: string;
  description?: string;
  bpmnXml?: string;
  activities?: unknown[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string | null;
  bpmnXml?: string;
  activities?: unknown[];
}

export interface ProjectRepository {
  listByUser(userId: string): Promise<Project[]>;
  findOwned(userId: string, id: string): Promise<Project | null>;
  create(userId: string, input: CreateProjectData): Promise<Project>;
  update(
    userId: string,
    id: string,
    input: UpdateProjectData,
  ): Promise<Project | null>;
  remove(userId: string, id: string): Promise<boolean>;
}