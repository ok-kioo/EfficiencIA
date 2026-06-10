export type ActivityType =
  | "manual"
  | "approval"
  | "system"
  | "decision"
  | "integration";

export type CriticalityLevel = "low" | "medium" | "high";

export interface ProcessActivity {
  id: string;
  name: string;
  type: ActivityType;
  averageTimeMinutes?: number;
  cost?: number;
  responsible?: string;
  resource?: string;
  demandVolume?: number;
  criticality?: CriticalityLevel;
  observations?: string;
}

export interface ProcessModel {
  id?: string;
  name: string;
  bpmnXml: string;
  activities: ProcessActivity[];
}