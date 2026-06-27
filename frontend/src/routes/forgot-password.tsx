import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Loader, AlertCircle, CheckCircle2 } from "lucide-react";
import { authService } from "../services/authService";
import { extractApiError } from "../services/api";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Esqueci minha senha — EfficiencIA" },
      { name: "description", content: "Receba um link para redefinir sua senha." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.requestPasswordReset(email);
      setMessage(res.message);
      setResetUrl(res.resetUrl ?? null);
    } catch (err) {
      setError(extractApiError(err, "Não foi possível enviar o e-mail agora."));
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
          Esqueci minha senha
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para criar uma nova senha.
        </p>

        {message ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={14} />
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{message}</p>
            </div>
            {resetUrl && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold">Modo desenvolvimento</p>
                <p className="mt-1 break-all">
                  Link gerado:{" "}
                  <a className="underline" href={resetUrl}>
                    {resetUrl}
                  </a>
                </p>
              </div>
            )}
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-2.5 text-muted-foreground"
                  size={16}
                  strokeWidth={1.75}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

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
                  Enviando…
                </>
              ) : (
                "Enviar link de redefinição"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
