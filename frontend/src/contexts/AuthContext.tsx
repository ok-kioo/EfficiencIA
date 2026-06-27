import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, LoginRequest, SignupRequest } from "../@types/user";
import { authService } from "../services/authService";
import { extractApiError } from "../services/api";
import { clearAllDrafts } from "../lib/modeler/autosave";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      setIsHydrating(false);
      return;
    }
    const cached = authService.getUser();
    if (cached) setUserState(cached);
    authService
      .me()
      .then((u) => setUserState(u))
      .catch(() => {
        authService.logout();
        setUserState(null);
      })
      .finally(() => setIsHydrating(false));
  }, []);

  const wrap = async (fn: () => Promise<User>) => {
    try {
      setError(null);
      setIsLoading(true);
      const u = await fn();
      setUserState(u);
    } catch (err) {
      const msg = extractApiError(err, "Não foi possível autenticar.");
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (data: LoginRequest) => wrap(async () => (await authService.login(data)).user);
  const signup = (data: SignupRequest) => wrap(async () => (await authService.signup(data)).user);
  const loginWithGoogle = (idToken: string) =>
    wrap(async () => (await authService.loginWithGoogle(idToken)).user);

  const logout = () => {
    authService.logout();
    // Não vaza rascunhos para o próximo usuário do navegador.
    clearAllDrafts();
    setUserState(null);
    setError(null);
  };

  const setUser = (u: User) => {
    setUserState(u);
    try {
      localStorage.setItem("auth_user", JSON.stringify(u));
    } catch {
      /* ignore */
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isHydrating,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    setUser,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
