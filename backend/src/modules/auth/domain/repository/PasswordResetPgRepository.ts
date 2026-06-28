import { query } from "../../../../infra/db";
import type {
  PasswordResetRecord,
  PasswordResetRepository,
} from "./PasswordResetRepository";

export class PasswordResetPgRepository implements PasswordResetRepository {
  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [input.userId, input.tokenHash, input.expiresAt.toISOString()],
    );
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetRecord | null> {
    const { rows } = await query<PasswordResetRecord>(
      `SELECT id, user_id, used_at, expires_at
         FROM password_resets WHERE token_hash = $1`,
      [tokenHash],
    );
    return rows[0] ?? null;
  }

  async markUsed(id: string): Promise<void> {
    await query("UPDATE password_resets SET used_at = NOW() WHERE id = $1", [id]);
  }
}

export const passwordResetRepository: PasswordResetRepository =
  new PasswordResetPgRepository();