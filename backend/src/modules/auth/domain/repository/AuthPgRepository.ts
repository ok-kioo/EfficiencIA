import { query } from "../../../../infra/db";
import type { UserRecord } from "../entity/Auth";
import type { AuthRepository, GoogleProfile } from "./AuthRepository";

const USER_COLS =
  "id, email, name, picture, google_sub, plan, onboarded_at";

export class AuthPgRepository implements AuthRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await query<UserRecord>(
      `SELECT ${USER_COLS} FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async createEmailUser(input: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<UserRecord> {
    const { rows } = await query<UserRecord>(
      `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING ${USER_COLS}
      `,
      [input.email, input.passwordHash, input.name],
    );
    return rows[0];
  }

  async findCredentialsByEmail(
    email: string,
  ): Promise<(UserRecord & { password_hash: string | null }) | null> {
    const { rows } = await query<UserRecord & { password_hash: string | null }>(
      `SELECT ${USER_COLS}, password_hash FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const { rows } = await query<UserRecord>(
      `SELECT ${USER_COLS} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await query(
      "UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1",
      [userId, passwordHash],
    );
  }
}

export const authRepository: AuthRepository = new AuthPgRepository();