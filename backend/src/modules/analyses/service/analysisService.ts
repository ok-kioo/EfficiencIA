import { HttpError } from "../../../infra/errors.js";
import { callAnalysisAgent } from "../../../infra/n8n.js";
import { findOwned } from "../../projects/service/projectService.js";
import type { Analysis } from "../domain/entity/Analysis.js";
import type { AnalysisRepository } from "../domain/repository/AnalysisRepository";
import { analysisRepository } from "../domain/repository/AnalysisPgRepository";

export interface RecentAnalysis extends Analysis {
  project_name: string;
}

export function makeAnalysisService(repo: AnalysisRepository) {
  async function listForProject(
    userId: string,
    projectId: string,
  ): Promise<Analysis[]> {
    await findOwned(userId, projectId); // ownership check
    return repo.listForProject(projectId);
  }

  async function listRecent(userId: string, limit = 5): Promise<RecentAnalysis[]> {
    return repo.listRecentForUser(userId, limit);
  }

  async function findOne(userId: string, id: string): Promise<Analysis> {
    const row = await repo.findByIdWithOwner(id);
    if (!row || row.user_id !== userId) {
      throw new HttpError(404, "Análise não encontrada.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_id, ...analysis } = row;
    return analysis;
  }

  async function createForProject(
    userId: string,
    projectId: string,
  ): Promise<Analysis> {
    const project = await findOwned(userId, projectId);
    const analysis = await repo.createRunning(projectId);

    try {
      const result = await callAnalysisAgent({
        projectId: project.id,
        projectName: project.name,
        bpmnXml: project.bpmn_xml,
        activities: project.activities,
      });
      return await repo.markDone(analysis.id, result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha desconhecida ao analisar.";
      return await repo.markFailed(analysis.id, message);
    }
  }

  return { listForProject, listRecent, findOne, createForProject };
}

const defaultService = makeAnalysisService(analysisRepository);

export const listForProject = defaultService.listForProject;
export const listRecent = defaultService.listRecent;
export const findOne = defaultService.findOne;
export const createForProject = defaultService.createForProject;
