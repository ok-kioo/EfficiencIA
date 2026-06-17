import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  bpmnXml: z.string().optional(),
  activities: z.array(z.any()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  bpmnXml: z.string().optional(),
  activities: z.array(z.any()).optional(),
});

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  bpmn_xml: string;
  activities: unknown[];
  created_at: string;
  updated_at: string;
}
