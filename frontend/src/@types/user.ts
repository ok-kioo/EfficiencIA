export type UserPlan = "free" | "premium";

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string | null;
  plan: UserPlan;
  plan_updated_at?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
