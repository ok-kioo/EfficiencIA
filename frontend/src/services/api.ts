import axios from "axios";

const TOKEN_KEY = "auth_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("auth_user");
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup" && path !== "/") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown, fallback = "Algo deu errado."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
