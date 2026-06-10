export type ViolationSeverity = "error" | "warning" | "info";

export interface Violation {
  id: string;
  elementId: string;
  elementName?: string;
  severity: ViolationSeverity;
  rule: string;
  message: string;
}
