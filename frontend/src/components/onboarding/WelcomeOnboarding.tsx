import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, MousePointerClick, Sparkles, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from "../../services/userService";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Desenhe seu fluxo",
    desc: "Arraste os elementos da barra lateral e conecte com setas. Você não precisa decorar nada — passe o mouse para ver o que cada um faz.",
  },
  {
    icon: BookOpen,
    title: "Preencha os dados operacionais",
    desc: "Clique em qualquer etapa para informar tempo, custo e responsável. Quanto mais detalhes, mais rica a análise.",
  },
  {
    icon: Sparkles,
    title: "Analise com IA",
    desc: "Aperte ‘Analisar com IA’ e receba resumo, gargalos, sugestões e uma pontuação geral do processo.",
  },
];

const STORAGE_KEY = "efficiencia:onboarding:dismissed";

export function WelcomeOnboarding() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.onboarded_at) return;
    // segundo nível de proteção: usuário pode ter fechado e o backend ainda não atualizou
    try {
      if (localStorage.getItem(STORAGE_KEY) === user.id) return;
    } catch {
      /* ignore */
    }
    setOpen(true);
  }, [user]);

  if (!open || !user) return null;

  async function dismiss() {
    if (closing) return;
    setClosing(true);
    try {
      const updated = await userService.completeOnboarding();
      setUser({ ...user!, ...updated });
    } catch {
      // se falhar, persiste localmente pra não repetir
      try {
        localStorage.setItem(STORAGE_KEY, user!.id);
      } catch {
        /* ignore */
      }
    } finally {
      setOpen(false);
      setClosing(false);
    }
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        <div className="px-7 pt-8 pb-2">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon size={20} strokeWidth={1.75} />
          </div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            Passo {step + 1} de {STEPS.length}
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {current.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {current.desc}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-7 py-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full transition ${
                  i === step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Voltar
              </button>
            )}
            {isLast ? (
              <Link
                to="/modeler"
                onClick={dismiss}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary-deep"
              >
                Abrir o exemplo
                <ArrowRight size={12} strokeWidth={2} />
              </Link>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary-deep"
              >
                Continuar
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
