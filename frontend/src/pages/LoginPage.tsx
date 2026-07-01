import { LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LoginForm } from "../components/auth/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <Link
          to="/"
          aria-label="Voltar para a página inicial"
          className="mb-6 inline-flex items-center gap-2 rounded-md outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LogIn size={16} strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
            EfficiencIA
          </h1>
        </Link>

        <h2 className="font-display text-xl font-semibold text-foreground">
          Bem-vindo de volta
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre com suas credenciais para acessar a plataforma.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-8 border-t border-border pt-5">
          <p className="text-center text-[11px] text-muted-foreground">
            Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
