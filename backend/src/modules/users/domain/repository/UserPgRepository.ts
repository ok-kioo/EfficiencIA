import { query } from "../../../../infra/db";
import type { User, UserPlan } from "../entity/User";
import type { UserRepository } from "./UserRepository";

const COLS =
  "id, email, name, picture, plan, plan_updated_at, onboarded_at";

export class UserPgRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const { rows } = await query<User>(
      `SELECT ${COLS} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async setPlan(id: string, plan: UserPlan): Promise<User | null> {
    const { rows } = await query<User>(
      `UPDATE users SET plan = $2, plan_updated_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING ${COLS}`,
      [id, plan],
    );
    return rows[0] ?? null;
  }

  async completeOnboarding(id: string): Promise<User | null> {
    const { rows } = await query<User>(
      `UPDATE users SET onboarded_at = COALESCE(onboarded_at, NOW()), updated_at = NOW()
       WHERE id = $1
       RETURNING ${COLS}`,
      [id],
    );
    return rows[0] ?? null;
  }
}

export const userRepository: UserRepository = new UserPgRepository();