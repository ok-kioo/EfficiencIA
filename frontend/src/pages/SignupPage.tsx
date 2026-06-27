import { UserPlus } from "lucide-react";
import { SignupForm } from "../components/auth/SignupForm";

export function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UserPlus size={16} strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
            EfficiencIA
          </h1>
        </div>

        <h2 className="font-display text-xl font-semibold text-foreground">
          Crie sua conta
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comece a usar EfficiencIA para otimizar seus processos de negócio.
        </p>

        <div className="mt-6">
          <SignupForm />
        </div>

        <div className="mt-8 border-t border-border pt-5">
          <p className="text-center text-[11px] text-muted-foreground">
            Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
