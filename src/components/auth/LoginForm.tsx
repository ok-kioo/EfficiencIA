import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, AlertCircle, Loader } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginRequest } from "../../@types/user";

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate({ to: "/" });
    } catch {
      /* erro tratado no contexto */
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} strokeWidth={1.75} />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={16} strokeWidth={1.75} />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={14} strokeWidth={1.75} />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary-deep disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader size={14} className="animate-spin" />
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Não tem uma conta?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
