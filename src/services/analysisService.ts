import { api } from "./api";
import type { ProcessModel } from "../@types/processs";
import type { ProcessAnalysis } from "../@types/analysis";

export async function analyzeProcess(
  process: ProcessModel
): Promise<ProcessAnalysis> {
  const response = await api.post<ProcessAnalysis>(
    "/analysis/process",
    process
  );

  return response.data;
}