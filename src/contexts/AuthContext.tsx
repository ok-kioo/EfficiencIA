import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthResponse, LoginRequest, SignupRequest } from "../@types/user";
import { authService } from "../services/authService";

const DEMO_USER: User = {
  id: "demo-user",
  name: "Usuário Demo",
  email: "demo@efficiencia.local",
  createdAt: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authService.initializeToken();
    const storedUser = authService.getUser();
    setUser(storedUser ?? DEMO_USER);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      const response: AuthResponse = await authService.login(data);
      setUser(response.user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      const response: AuthResponse = await authService.signup(data);
      setUser(response.user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer cadastro";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(DEMO_USER);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: true,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
