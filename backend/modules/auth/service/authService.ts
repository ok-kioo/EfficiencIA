import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { query } from "../../../infra/db.js";
import { signToken } from "../../../infra/jwt.js";
import { verifyGoogleIdToken } from "../../../infra/google.js";
import { HttpError } from "../../../infra/errors.js";
import type { AuthResponse, UserRecord } from "../domain/Auth.js";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const RESET_TTL_MIN = 60;

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
    },
  };
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const profile = await verifyGoogleIdToken(idToken);
  const { rows } = await query<UserRecord>(
    `
    INSERT INTO users (google_sub, email, name, picture)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE
      SET google_sub = EXCLUDED.google_sub,
          name       = COALESCE(users.name, EXCLUDED.name),
          picture    = EXCLUDED.picture,
          updated_at = NOW()
    RETURNING id, email, name, picture, google_sub
    `,
    [profile.sub, profile.email, profile.name, profile.picture ?? null],
  );
  return toResponse(rows[0]);
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
    RETURNING id, email, name, picture, google_sub
    `,
    [email, password_hash, name],
  );
  return toResponse(rows[0]);
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const { rows } = await query<UserRecord & { password_hash: string | null }>(
    "SELECT id, email, name, picture, google_sub, password_hash FROM users WHERE email = $1",
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
    "SELECT id, email, name, picture, google_sub FROM users WHERE id = $1",
    [userId],
  );
  if (!rows[0]) throw new HttpError(404, "Usuário não encontrado.");
  return rows[0];
}
