import { HttpError } from "../../../infra/errors.js";
import type { User, UserPlan } from "../domain/entity/User.js";
import type { UserRepository } from "../domain/repository/UserRepository";
import { userRepository } from "../domain/repository/UserPgRepository";

export function makeUserService(repo: UserRepository) {
  async function findById(id: string): Promise<User> {
    const user = await repo.findById(id);
    if (!user) throw new HttpError(404, "Usuário não encontrado.");
    return user;
  }

  async function setPlan(id: string, plan: UserPlan): Promise<User> {
    const user = await repo.setPlan(id, plan);
    if (!user) throw new HttpError(404, "Usuário não encontrado.");
    return user;
  }

  async function completeOnboarding(id: string): Promise<User> {
    const user = await repo.completeOnboarding(id);
    if (!user) throw new HttpError(404, "Usuário não encontrado.");
    return user;
  }

  return { findById, setPlan, completeOnboarding };
}

const defaultService = makeUserService(userRepository);

export const findById = defaultService.findById;
export const setPlan = defaultService.setPlan;
export const completeOnboarding = defaultService.completeOnboarding;
