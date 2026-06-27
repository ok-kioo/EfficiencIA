import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Crown,
  Gauge,
  LineChart,
  Lock,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { extractApiError } from "../services/api";

export const Route = createFileRoute("/_authenticated/premium")({
  head: () => ({
    meta: [
      { title: "Plano Premium — Análise inteligente com IA | EfficiencIA" },
      {
        name: "description",
        content:
          "Libere a análise por IA: gargalos identificados, recomendações priorizadas e pontuação do seu processo.",
      },
    ],
  }),
  component: PremiumPage,
});

const FREE_FEATURES = [
  "Modelagem BPMN completa",
  "Dados operacionais por etapa",
  "Validações de modelagem em tempo real",
  "Sugestões básicas de revisão",
  "Histórico dos seus projetos",
];

const PREMIUM_FEATURES = [
  "Tudo do plano FREE",
  "Análise inteligente com IA dos seus fluxos",
  "Identificação automática de gargalos",
  "Sugestões priorizadas de melhoria",
  "Pontuação de maturidade do processo",
  "Comparação entre versões e análises",
];

const VALUE_PROPS = [
  {
    icon: Brain,
    title: "Análise da IA em segundos",
    text:
      "Recebe gargalos, problemas estruturais e oportunidades em linguagem clara — sem precisar entender de BPMN.",
  },
  {
    icon: Target,
    title: "Recomendações priorizadas",
    text:
      "A IA já te diz por onde começar a melhorar: impacto, esforço estimado e ordem sugerida.",
  },
  {
    icon: Gauge,
    title: "Pontuação do processo",
    text:
      "Acompanhe a maturidade do seu fluxo com um score que evolui a cada revisão.",
  },
  {
    icon: LineChart,
    title: "Decisões com dado",
    text:
      "Combine dados operacionais (tempo, custo, volume) com a leitura da IA para decidir com confiança.",
  },
];

function PremiumPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const alreadyPremium = user?.plan === "premium";

  async function handleUpgrade() {
    setLoading(true);
    try {
      const updated = await userService.upgradeToPremium();
      setUser({ ...(user ?? updated), ...updated });
      toast.success("Bem-vindo ao Premium! Análises com IA liberadas.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(extractApiError(err, "Não foi possível atualizar o plano."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="-mx-4 -my-6 sm:-mx-6">
      <div className="mb-6 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard" })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Voltar ao dashboard
        </button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
            <Crown size={12} strokeWidth={2} />
            Plano Premium
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Deixe a IA fazer o trabalho{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              pesado da análise
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Modelar é o começo. O Premium ativa a análise inteligente que aponta
            gargalos, sugere melhorias e te ajuda a evoluir cada processo.
          </p>
          {alreadyPremium ? (
            <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <BadgeCheck size={16} />
              Você já é Premium. Aproveite!
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              <Sparkles size={16} />
              {loading ? "Ativando…" : "Ser PREMIUM"}
            </button>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Demonstração — nenhuma cobrança real é feita.
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUE_PROPS.map((v) => (
              <article
                key={v.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <v.icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {v.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border bg-muted/20 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Compare os planos
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
            Tudo do FREE continua disponível. O Premium adiciona a camada de IA que
            faz a diferença.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {/* FREE */}
            <article className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">FREE</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Atual
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tudo que você precisa para modelar e documentar processos.
              </p>
              <ul className="mt-5 space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6 text-[11px] text-muted-foreground">
                Grátis, para sempre.
              </div>
            </article>

            {/* PREMIUM */}
            <article className="relative flex flex-col overflow-hidden rounded-xl border-2 border-primary bg-card p-6 shadow-lg">
              <div className="absolute right-0 top-0 rounded-bl-lg bg-gradient-to-r from-primary to-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                Recomendado
              </div>
              <div className="mb-4 flex items-center gap-2">
                <Crown size={18} className="text-accent" />
                <h3 className="font-display text-lg font-semibold">PREMIUM</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Modelagem + análise inteligente para times que querem evoluir.
              </p>
              <ul className="mt-5 space-y-2.5">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      size={15}
                      className={`mt-0.5 shrink-0 ${
                        i === 0 ? "text-primary" : "text-accent"
                      }`}
                    />
                    <span className={i === 0 ? "text-muted-foreground" : ""}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              {alreadyPremium ? (
                <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary">
                  <BadgeCheck size={15} />
                  Plano ativo
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:opacity-60"
                >
                  <Zap size={15} />
                  {loading ? "Ativando…" : "Ser PREMIUM agora"}
                </button>
              )}
            </article>
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            O que você recebe em cada análise
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ExampleCard
              title="Gargalos identificados"
              text="“A etapa ‘Aprovar pedido’ concentra 62% do tempo total. Avalie automatizar valores até R$ 500.”"
            />
            <ExampleCard
              title="Problemas estruturais"
              text="“O fluxo possui um ponto de decisão sem condição definida na saída ‘sim’.”"
            />
            <ExampleCard
              title="Sugestões priorizadas"
              text="“1) Paralelizar separação e emissão de nota. 2) Notificar cliente automaticamente.”"
            />
            <ExampleCard
              title="Pontuação geral"
              text="Score de 0 a 100 com explicação clara do que pesou para cima ou para baixo."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!alreadyPremium && (
        <section className="border-t border-border bg-gradient-to-br from-primary/5 to-accent/10 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Lock
              size={32}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-primary"
            />
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Pronto para destravar a IA?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Em um clique seu plano vira Premium e você já pode rodar análises
              inteligentes em todos os seus processos.
            </p>
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              <Sparkles size={16} />
              {loading ? "Ativando…" : "Ser PREMIUM"}
              <ArrowRight size={15} />
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Demonstração — sem cobrança real.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Prefere continuar no FREE?{" "}
              <Link to="/dashboard" className="text-primary hover:underline">
                Voltar ao dashboard
              </Link>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function ExampleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={14} className="text-accent" />
        <h3 className="font-display text-sm font-semibold tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
