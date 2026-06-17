import { query } from "../../../infra/db.js";
import { HttpError } from "../../../infra/errors.js";
import type { User } from "../domain/User.js";

export async function findById(id: string): Promise<User> {
  const { rows } = await query<User>(
    "SELECT id, email, name, picture FROM users WHERE id = $1",
    [id],
  );
  if (!rows[0]) throw new HttpError(404, "Usuário não encontrado.");
  return rows[0];
}
