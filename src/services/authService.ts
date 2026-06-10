import { api } from "./api";
import type { AuthResponse, LoginRequest, SignupRequest, User } from "../@types/user";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function buildDemoResponse(email: string, name?: string): AuthResponse {
  const normalizedEmail = email.trim() || "demo@efficiencia.local";
  const demoName = name?.trim() || normalizedEmail.split("@")[0] || "Usuário Demo";

  return {
    token: "demo-token",
    user: {
      id: `demo-${Date.now()}`,
      name: demoName,
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    },
  };
}

export const authService = {
  // Login do usuário
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = buildDemoResponse(data.email);
    const { token, user } = response;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Adicionar token ao header das requisições futuras
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    return response;
  },

  // Cadastro de novo usuário
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = buildDemoResponse(data.email, data.name);
    const { token, user } = response;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    return response;
  },

  // Logout
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common["Authorization"];
  },

  // Obter token armazenado
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Obter usuário armazenado
  getUser(): User | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Inicializar token ao carregar a aplicação
  initializeToken(): void {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
};
