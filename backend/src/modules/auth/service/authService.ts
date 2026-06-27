import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { query } from "../../../infra/db.js";
import { signToken } from "../../../infra/jwt.js";
import { verifyGoogleIdToken } from "../../../infra/google.js";
import { HttpError } from "../../../infra/errors.js";
import { createWelcomeProject } from "../../projects/service/welcomeProject.js";
import type { AuthResponse, UserRecord } from "../domain/Auth.js";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const RESET_TTL_MIN = 60;
const USER_COLS =
  "id, email, name, picture, google_sub, plan, onboarded_at";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function toResponse(user: UserRecord): AuthResponse {
  const token = signToken({ sub: user.id, email: user.email });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      plan: (user.plan ?? "free") as "free" | "premium",
      onboarded_at: user.onboarded_at ?? null,
    },
  };
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const profile = await verifyGoogleIdToken(idToken);
  // Detecta novo cadastro para semear o projeto de exemplo.
  const existing = await query<{ id: string }>(
    "SELECT id FROM users WHERE email = $1",
    [profile.email],
  );
  const isNew = !existing.rowCount;
  const { rows } = await query<UserRecord>(
    `
    INSERT INTO users (google_sub, email, name, picture)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE
      SET google_sub = EXCLUDED.google_sub,
          name       = COALESCE(users.name, EXCLUDED.name),
          picture    = EXCLUDED.picture,
          updated_at = NOW()
    RETURNING ${USER_COLS}
    `,
    [profile.sub, profile.email, profile.name, profile.picture ?? null],
  );
  const user = rows[0];
  if (isNew) await createWelcomeProject(user.id);
  return toResponse(user);
}

export async function signupWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  const existing = await query<UserRecord>("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw new HttpError(409, "Já existe uma conta com esse e-mail.", "email_taken");
  }
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await query<UserRecord>(
    `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING ${USER_COLS}
    `,
    [email, password_hash, name],
  );
  const user = rows[0];
  await createWelcomeProject(user.id);
  return toResponse(user);
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const { rows } = await query<UserRecord & { password_hash: string | null }>(
    `SELECT ${USER_COLS}, password_hash FROM users WHERE email = $1`,
    [email],
  );
  const user = rows[0];
  if (!user || !user.password_hash) {
    throw new HttpError(401, "E-mail ou senha inválidos.", "invalid_credentials");
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new HttpError(401, "E-mail ou senha inválidos.", "invalid_credentials");
  }
  return toResponse(user);
}

export async function getCurrentUser(userId: string) {
  const { rows } = await query<UserRecord>(
    `SELECT ${USER_COLS} FROM users WHERE id = $1`,
    [userId],
  );
  if (!rows[0]) throw new HttpError(404, "Usuário não encontrado.");
  return rows[0];
}

export interface ForgotPasswordResult {
  message: string;
  resetUrl?: string;
}

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResult> {
  const genericMessage =
    "Se existir uma conta com esse e-mail, enviaremos instruções para redefinir a senha.";
  const { rows } = await query<{ id: string }>(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );
  const user = rows[0];
  if (!user) return { message: genericMessage };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TTL_MIN * 60_000);

  await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt.toISOString()],
  );

  console.log("[password-reset] requested", {
    userId: user.id,
    at: new Date().toISOString(),
  });

  const result: ForgotPasswordResult = { message: genericMessage };
  if (process.env.NODE_ENV !== "production") {
    // Apenas em desenvolvimento devolvemos o link para facilitar testes locais.
    result.resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
  }
  return result;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = sha256(token);
  const { rows } = await query<{
    id: string;
    user_id: string;
    used_at: string | null;
    expires_at: string;
  }>(
    `SELECT id, user_id, used_at, expires_at FROM password_resets WHERE token_hash = $1`,
    [tokenHash],
  );
  const record = rows[0];
  if (!record || record.used_at || new Date(record.expires_at).getTime() < Date.now()) {
    throw new HttpError(400, "Token inválido ou expirado.", "invalid_token");
  }
  const password_hash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1", [
    record.user_id,
    password_hash,
  ]);
  await query("UPDATE password_resets SET used_at = NOW() WHERE id = $1", [record.id]);
}
