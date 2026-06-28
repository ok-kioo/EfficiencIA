import type { User, UserPlan } from "../entity/User";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  setPlan(id: string, plan: UserPlan): Promise<User | null>;
  completeOnboarding(id: string): Promise<User | null>;
}