import { api } from "./api";

export interface ProjectDTO {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  bpmn_xml: string;
  activities: unknown[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  bpmnXml?: string;
  activities?: unknown[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  bpmnXml?: string;
  activities?: unknown[];
}

export const projectService = {
  async list(): Promise<ProjectDTO[]> {
    const { data } = await api.get<ProjectDTO[]>("/api/projects");
    return data;
  },
  async get(id: string): Promise<ProjectDTO> {
    const { data } = await api.get<ProjectDTO>(`/api/projects/${id}`);
    return data;
  },
  async create(input: CreateProjectInput): Promise<ProjectDTO> {
    const { data } = await api.post<ProjectDTO>("/api/projects", input);
    return data;
  },
  async update(id: string, input: UpdateProjectInput): Promise<ProjectDTO> {
    const { data } = await api.put<ProjectDTO>(`/api/projects/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/api/projects/${id}`);
  },
};
