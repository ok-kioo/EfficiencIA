import { z } from "zod";

export const googleLoginSchema = z.object({
  idToken: z.string().min(10),
});

export const emailSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(6),
});

export type UserPlan = "free" | "premium";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  google_sub: string | null;
  plan?: UserPlan;
  onboarded_at?: string | null;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string | null;
    plan: UserPlan;
    onboarded_at: string | null;
  };
}
