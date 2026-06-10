export type SeverityLevel = "low" | "medium" | "high";

export interface BottleneckFinding {
  id: string;
  activityId?: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  evidence: string[];
}

export interface ScenarioSuggestion {
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  riskLevel: SeverityLevel;
}

export interface ProcessAnalysis {
  processId?: string;
  summary: string;
  findings: BottleneckFinding[];
  scenarios: ScenarioSuggestion[];
}