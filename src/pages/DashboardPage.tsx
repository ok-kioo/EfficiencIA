import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, GitBranch, WandSparkles } from "lucide-react";

const tiles = [
  {
    icon: GitBranch,
    title: "Modelagem BPMN",
    desc: "Desenhe ou importe fluxos organizacionais para análise.",
    to: "/modeler",
  },
  {
    icon: BarChart3,
    title: "Análise estrutural",
    desc: "Identifique padrões que podem gerar gargalos e baixa eficiência.",
    to: "/analysis",
  },
  {
    icon: WandSparkles,
    title: "Exploração com IA",
    desc: "Gere hipóteses, explicações e cenários alternativos com apoio de IA.",
    to: "/scenarios",
  },
] as const;

export function DashboardPage() {
  return (
    <div>
      <section className="relative mb-6 overflow-hidden rounded-xl border border-border bg-card px-6 py-7">
        <span className="absolute right-6 top-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          Visão geral
        </span>
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          Explore cenários organizacionais{" "}
          <span className="text-primary">antes da execução</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Modele processos, informe dados operacionais e receba análises inteligentes
          sobre possíveis gargalos, riscos e alternativas.
        </p>

        <Link
          to="/modeler"
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary-deep"
        >
          Criar novo processo
          <ArrowUpRight size={14} strokeWidth={2} />
        </Link>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.to}
              to={tile.to}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-card"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <h2 className="font-display text-sm font-semibold text-foreground">
                {tile.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {tile.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Abrir
                <ArrowUpRight size={11} strokeWidth={2} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
