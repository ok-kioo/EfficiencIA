import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { signToken } from "../../../infra/jwt.js";
import { verifyGoogleIdToken } from "../../../infra/google.js";
import { HttpError } from "../../../infra/errors.js";
import { createWelcomeProject } from "../../projects/service/welcomeProject.js";
import type { AuthResponse, UserRecord } from "../domain/entity/Auth.js";
import type { AuthRepository } from "../domain/repository/AuthRepository";
import type { PasswordResetRepository } from "../domain/repository/PasswordResetRepository";
import { authRepository } from "../domain/repository/AuthPgRepository";
import { passwordResetRepository } from "../domain/repository/PasswordResetPgRepository";

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
      plan: (user.plan ?? "free") as "free" | "premium",
      onboarded_at: user.onboarded_at ?? null,
    },
  };
}

export interface ForgotPasswordResult {
  message: string;
  resetUrl?: string;
}

export interface AuthServiceDeps {
  authRepo: AuthRepository;
  passwordResetRepo: PasswordResetRepository;
  onUserCreated?: (userId: string) => Promise<void>;
}

export function makeAuthService(deps: AuthServiceDeps) {
  const { authRepo, passwordResetRepo, onUserCreated } = deps;

  /* async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const profile = await verifyGoogleIdToken(idToken);
    const { user, isNew } = await authRepo.upsertGoogleUser({
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture ?? null,
    });
    if (isNew && onUserCreated) await onUserCreated(user.id);
    return toResponse(user);
  } */

  async function signupWithEmail(
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> {
    const existing = await authRepo.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Já existe uma conta com esse e-mail.", "email_taken");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepo.createEmailUser({ email, passwordHash, name });
    if (onUserCreated) await onUserCreated(user.id);
    return toResponse(user);
  }

  async function loginWithEmail(
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const user = await authRepo.findCredentialsByEmail(email);
    if (!user || !user.password_hash) {
      throw new HttpError(401, "E-mail ou senha inválidos.", "invalid_credentials");
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw new HttpError(401, "E-mail ou senha inválidos.", "invalid_credentials");
    }
    return toResponse(user);
  }

  async function getCurrentUser(userId: string): Promise<UserRecord> {
    const user = await authRepo.findById(userId);
    if (!user) throw new HttpError(404, "Usuário não encontrado.");
    return user;
  }

  async function requestPasswordReset(email: string): Promise<ForgotPasswordResult> {
    const genericMessage =
      "Se existir uma conta com esse e-mail, enviaremos instruções para redefinir a senha.";
    const user = await authRepo.findByEmail(email);
    if (!user) return { message: genericMessage };

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MIN * 60_000);

    await passwordResetRepo.create({ userId: user.id, tokenHash, expiresAt });

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

  async function resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = sha256(token);
    const record = await passwordResetRepo.findByTokenHash(tokenHash);
    if (
      !record ||
      record.used_at ||
      new Date(record.expires_at).getTime() < Date.now()
    ) {
      throw new HttpError(400, "Token inválido ou expirado.", "invalid_token");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await authRepo.updatePasswordHash(record.user_id, passwordHash);
    await passwordResetRepo.markUsed(record.id);
  }

  return {
    /* loginWithGoogle,*/
    signupWithEmail,
    loginWithEmail,
    getCurrentUser,
    requestPasswordReset,
    resetPassword
  };
}

const defaultService = makeAuthService({
  authRepo: authRepository,
  passwordResetRepo: passwordResetRepository,
  onUserCreated: createWelcomeProject,
});

/* export const loginWithGoogle = defaultService.loginWithGoogle;*/
export const signupWithEmail = defaultService.signupWithEmail;
export const loginWithEmail = defaultService.loginWithEmail;
export const getCurrentUser = defaultService.getCurrentUser;
export const requestPasswordReset = defaultService.requestPasswordReset;
export const resetPassword = defaultService.resetPassword;
