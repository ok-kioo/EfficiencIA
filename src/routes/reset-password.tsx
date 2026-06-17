import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Lock, Loader, AlertCircle, CheckCircle2 } from "lucide-react";
import { authService } from "../services/authService";
import { extractApiError } from "../services/api";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Redefinir senha — EfficiencIA" },
      { name: "description", content: "Defina uma nova senha para sua conta." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Link inválido. Solicite um novo em 'Esqueci minha senha'.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 1800);
    } catch (err) {
      setError(extractApiError(err, "Não foi possível redefinir a senha."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-7">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Voltar
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Definir nova senha
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha uma senha de pelo menos 6 caracteres.
        </p>

        {done ? (
          <div className="mt-6 flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={14} />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Senha redefinida. Redirecionando para o login…
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <PasswordField label="Nova senha" value={password} onChange={setPassword} />
            <PasswordField label="Confirmar senha" value={confirm} onChange={setConfirm} />

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={14} />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary-deep disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                "Redefinir senha"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="absolute left-3 top-2.5 text-muted-foreground"
          size={16}
          strokeWidth={1.75}
        />
        <input
          type="password"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}
