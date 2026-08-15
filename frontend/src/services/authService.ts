import { api } from "./api";
import type { AuthResponse, LoginRequest, SignupRequest, User } from "../@types/user";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function normalize(u: User): User {
  return { ...u, plan: (u.plan ?? "free") as User["plan"] };
}

function persist(res: AuthResponse) {
  const user = normalize(res.user);
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { data: res } = await api.post<AuthResponse>("/api/auth/login", data);
    persist(res);
    return res;
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const { data: res } = await api.post<AuthResponse>("/api/auth/signup", {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    persist(res);
    return res;
  },

  /* async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const { data: res } = await api.post<AuthResponse>("/api/auth/google", { idToken });
    persist(res);
    return res;
  }, */

  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>("/api/auth/me");
    const user = normalize(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async requestPasswordReset(email: string): Promise<{ message: string; resetUrl?: string }> {
    const { data } = await api.post<{ message: string; resetUrl?: string }>(
      "/api/auth/forgot-password",
      { email },
    );
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/api/auth/reset-password", {
      token,
      password,
    });
    return data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem(USER_KEY);
    if (!u) return null;
    try {
      return normalize(JSON.parse(u) as User);
    } catch {
      return null;
    }
  },
};
