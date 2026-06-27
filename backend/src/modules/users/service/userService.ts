import { query } from "../../../infra/db.js";
import { HttpError } from "../../../infra/errors.js";
import type { User, UserPlan } from "../domain/User.js";

const SELECT = "SELECT id, email, name, picture, plan, plan_updated_at FROM users";

export async function findById(id: string): Promise<User> {
  const { rows } = await query<User>(`${SELECT} WHERE id = $1`, [id]);
  if (!rows[0]) throw new HttpError(404, "Usuário não encontrado.");
  return rows[0];
}

export async function setPlan(id: string, plan: UserPlan): Promise<User> {
  const { rows } = await query<User>(
    `UPDATE users SET plan = $2, plan_updated_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, name, picture, plan, plan_updated_at`,
    [id, plan],
  );
  if (!rows[0]) throw new HttpError(404, "Usuário não encontrado.");
  return rows[0];
}
