import type { ProcessActivity } from "../@types/processs";

/**
 * Shape canônico esperado pelo backend/n8n. Mantém `id` para casar com o nó BPMN
 * e usa apenas campos com nomes estáveis (sem aliases).
 */
export interface ActivityMetadataPayload {
  id: string;
  responsible: string;
  averageTime: number | "";
  monthlyVolume: number | "";
  stageType: string;
  cost: number | "";
  area: string;
  criticality: string;
  observations: string;
}

function clean(value: string | undefined | null, maxLen = 500): string {
  if (!value) return "";
  // remove caracteres de controle e limita o tamanho
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLen);
}

function num(value: number | undefined | null): number | "" {
  if (value === null || value === undefined) return "";
  if (!Number.isFinite(value) || value < 0) return "";
  return value;
}

export function activityToMetadata(activity: ProcessActivity): ActivityMetadataPayload {
  return {
    id: activity.id,
    responsible: clean(activity.responsible),
    averageTime: num(activity.averageTimeMinutes),
    monthlyVolume: num(activity.demandVolume),
    stageType: clean(activity.type, 100),
    cost: num(activity.cost),
    area: clean(activity.resource),
    criticality: clean(activity.criticality, 50),
    observations: clean(activity.observations, 2000),
  };
}

export function activitiesToMetadata(
  activities: ProcessActivity[],
): ActivityMetadataPayload[] {
  return activities.filter((a) => a.id).map(activityToMetadata);
}