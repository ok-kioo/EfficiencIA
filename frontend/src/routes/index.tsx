import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Layers,
  Lightbulb,
  Sparkles,
  Workflow,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EfficiencIA — Mapeie e melhore os processos da sua empresa" },
      {
        name: "description",
        content:
          "Plataforma simples para desenhar fluxos de trabalho e receber análises inteligentes que mostram como melhorar a eficiência da sua empresa.",
      },
      { property: "og:title", content: "EfficiencIA — Processos mais eficientes com IA" },
      {
        property: "og:description",
        content:
          "Desenhe seus fluxos de forma visual e descubra gargalos e melhorias com a ajuda da inteligência artificial.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Workflow size={15} strokeWidth={2} />
            </span>
            <span className="font-display text-base font-semibold tracking-tight">
              EfficiencIA
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/ajuda"
              className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              Ajuda
            </Link>
            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-deep"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/8 via-background to-accent/5"
        />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
                <Sparkles size={12} strokeWidth={2} />
                Análise com inteligência artificial
              </span>
              <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Desenhe os processos da sua empresa e{" "}
                <span className="text-primary">descubra o que pode melhorar.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Uma ferramenta visual e simples para mapear como o trabalho acontece
                hoje. Nossa IA analisa cada fluxo e mostra gargalos, riscos e
                sugestões práticas — sem precisar entender de notação técnica.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-deep"
                >
                  Criar conta grátis
                  <ArrowRight size={15} strokeWidth={2} />
                </Link>
                <Link
                  to="/modeler"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Começar um novo fluxo
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
                  Já tenho conta
                </Link>
              </div>
              <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Sem precisar instalar nada",
                  "Linguagem simples, sem jargão",
                  "Salva o rascunho automaticamente",
                  "Análise feita por IA em segundos",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-primary/5">
                <div className="rounded-xl border border-border/60 bg-background p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-destructive/60" />
                    <span className="h-2 w-2 rounded-full bg-warning/70" />
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Pedido de compra
                    </span>
                  </div>
                  <FlowPreview />
                </div>
                <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Análise da IA
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    O fluxo passa por <strong>3 aprovações em sequência</strong>. Isso
                    pode aumentar o tempo total em até 60%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Como funciona
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Em três passos você tem clareza sobre seus processos
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Sem treinamento. Sem manual. Você arrasta as etapas, conecta com setas e
              descreve com palavras do dia a dia.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Compass,
                title: "1. Desenhe o fluxo",
                text: "Arraste as etapas, conecte com setas e use linguagem do seu negócio. Não precisa entender BPMN.",
              },
              {
                icon: Layers,
                title: "2. Informe os dados",
                text: "Adicione tempo médio, custo, responsável e volume para cada etapa. Tudo opcional, faça do seu jeito.",
              },
              {
                icon: Lightbulb,
                title: "3. Receba a análise",
                text: "Em segundos a IA aponta gargalos, problemas e sugestões com explicações simples e práticas.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Por que usar IA?
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Uma análise que parece feita por um consultor experiente.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Nossa IA foi treinada para olhar fluxos de trabalho como um especialista
                em processos olharia. Ela considera o contexto, faz perguntas e entrega
                respostas em linguagem clara.
              </p>
            </div>

            <ul className="space-y-3">
              {[
                {
                  title: "Identifica gargalos automaticamente",
                  text: "Encontra etapas que travam o fluxo e explica o motivo em palavras simples.",
                },
                {
                  title: "Sugere melhorias práticas",
                  text: "Recebe recomendações que podem ser aplicadas no dia a dia da operação.",
                },
                {
                  title: "Aponta riscos e problemas de modelagem",
                  text: "Mostra inconsistências no desenho antes que virem problema na execução.",
                },
                {
                  title: "Dá uma nota geral ao seu processo",
                  text: "Pontuação clara com explicação do que pesou para chegar nela.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <p className="font-display text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Pronto para enxergar seus processos com clareza?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Crie sua conta e desenhe seu primeiro fluxo agora. Leva menos de um minuto.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-deep"
            >
              Criar conta grátis
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
            <Link
              to="/ajuda"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Ver a página de ajuda
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} EfficiencIA</p>
          <div className="flex items-center gap-4">
            <Link to="/ajuda" className="transition hover:text-foreground">
              Ajuda
            </Link>
            <Link to="/login" className="transition hover:text-foreground">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FlowPreview() {
  return (
    <svg viewBox="0 0 360 180" className="h-auto w-full" aria-hidden>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" className="text-muted-foreground" />
        </marker>
      </defs>
      <g className="text-muted-foreground" stroke="currentColor" strokeWidth="1.5" fill="none">
        <line x1="50" y1="50" x2="100" y2="50" markerEnd="url(#arrow)" />
        <line x1="160" y1="50" x2="210" y2="50" markerEnd="url(#arrow)" />
        <line x1="270" y1="50" x2="290" y2="90" markerEnd="url(#arrow)" />
        <line x1="290" y1="110" x2="240" y2="140" markerEnd="url(#arrow)" />
        <line x1="180" y1="140" x2="120" y2="140" markerEnd="url(#arrow)" />
      </g>
      <circle cx="40" cy="50" r="14" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      <rect x="100" y="35" width="60" height="30" rx="6" className="fill-card stroke-border" strokeWidth="1.5" />
      <text x="130" y="54" textAnchor="middle" className="fill-foreground text-[9px]" fontFamily="ui-sans-serif">
        Solicitar
      </text>
      <rect x="210" y="35" width="60" height="30" rx="6" className="fill-card stroke-border" strokeWidth="1.5" />
      <text x="240" y="54" textAnchor="middle" className="fill-foreground text-[9px]" fontFamily="ui-sans-serif">
        Validar
      </text>
      <polygon
        points="290,80 310,100 290,120 270,100"
        className="fill-warning/20 stroke-warning"
        strokeWidth="1.5"
      />
      <rect x="180" y="125" width="60" height="30" rx="6" className="fill-card stroke-border" strokeWidth="1.5" />
      <text x="210" y="144" textAnchor="middle" className="fill-foreground text-[9px]" fontFamily="ui-sans-serif">
        Aprovar
      </text>
      <circle cx="105" cy="140" r="14" className="fill-primary/15 stroke-primary" strokeWidth="2.5" />
    </svg>
  );
}
