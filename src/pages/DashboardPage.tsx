import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  GitBranch,
  Loader,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { analysisService, type RecentAnalysis } from "../services/analysisService";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(s: RecentAnalysis["status"]) {
  if (s === "done") return { text: "Concluída", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  if (s === "running") return { text: "Em andamento", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
  return { text: "Falhou", className: "bg-destructive/10 text-destructive" };
}

export function DashboardPage() {
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.list(),
  });

  const { data: recent = [], isLoading: recentLoading } = useQuery({
    queryKey: ["analyses", "recent"],
    queryFn: () => analysisService.listRecent(5),
  });

  const totalProjects = projects.length;
  const totalAnalyses = recent.length; // visão das mais recentes
  const doneAnalyses = recent.filter((a) => a.status === "done").length;
  const lastAnalysisDate = recent[0]?.created_at;
  const avgScore =
    recent
      .filter((a) => a.status === "done" && a.final_assessment)
      .map((a) => a.final_assessment?.score ?? 0)
      .reduce((s, n, _, arr) => s + n / (arr.length || 1), 0) || 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-xl border border-border bg-card px-6 py-7">
        <span className="absolute right-6 top-6 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          <Sparkles size={11} strokeWidth={2} />
          Bem-vindo
        </span>
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          Seus processos em um só lugar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Crie fluxos novos, abra os que já desenhou e acompanhe as análises feitas pela IA.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/modeler"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary-deep"
          >
            <Plus size={13} strokeWidth={2} />
            Criar novo processo
          </Link>
          <Link
            to="/guia"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            <BookOpen size={13} strokeWidth={2} />
            Abrir guia
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={GitBranch}
          label="Processos"
          value={projectsLoading ? "…" : totalProjects.toString()}
        />
        <StatCard
          icon={BarChart3}
          label="Análises recentes"
          value={recentLoading ? "…" : totalAnalyses.toString()}
        />
        <StatCard
          icon={CheckCircle2}
          label="Concluídas"
          value={recentLoading ? "…" : doneAnalyses.toString()}
        />
        <StatCard
          icon={TrendingUp}
          label="Score médio"
          value={
            recentLoading
              ? "…"
              : doneAnalyses === 0
                ? "—"
                : Math.round(avgScore).toString()
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              Seus processos
            </h2>
            <Link
              to="/modeler"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              + Novo
            </Link>
          </div>

          {projectsLoading ? (
            <SkeletonBlock text="Carregando processos…" />
          ) : projectsError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-6 text-sm text-destructive">
              Não foi possível carregar seus projetos. Verifique se o backend está rodando.
            </div>
          ) : projects.length === 0 ? (
            <EmptyProjects />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Atualizado em {formatDate(p.updated_at)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      to="/modeler"
                      search={{ projectId: p.id }}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition hover:bg-primary-deep"
                    >
                      Abrir
                      <ArrowRight size={11} strokeWidth={2} />
                    </Link>
                    <Link
                      to="/projects/$id/analyses"
                      params={{ id: p.id }}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-muted"
                    >
                      <BarChart3 size={11} strokeWidth={2} />
                      Análises
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: recent analyses + quick actions */}
        <aside className="space-y-6">
          <div>
            <h2 className="mb-3 font-display text-sm font-semibold tracking-tight text-foreground">
              Análises recentes
            </h2>
            {recentLoading ? (
              <SkeletonBlock text="Carregando…" />
            ) : recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-5 text-center text-xs text-muted-foreground">
                Nenhuma análise por aqui ainda. Modele um fluxo e clique em “Analisar com IA”.
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.map((a) => {
                  const st = statusLabel(a.status);
                  return (
                    <li
                      key={a.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <Link
                        to="/analyses/$id"
                        params={{ id: a.id }}
                        className="block"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {a.project_name}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.className}`}
                          >
                            {st.text}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(a.created_at)}
                          </span>
                          {a.status === "done" && a.final_assessment && (
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                              <TrendingUp size={10} />
                              {a.final_assessment.score}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-display text-sm font-semibold tracking-tight text-foreground">
              Atalhos
            </h2>
            <div className="space-y-2">
              <QuickLink to="/modeler" icon={Plus} label="Criar novo processo" />
              <QuickLink to="/guia" icon={BookOpen} label="Como modelar e preencher dados" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GitBranch;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Plus;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-muted"
    >
      <span className="inline-flex items-center gap-2">
        <Icon size={13} strokeWidth={1.75} />
        {label}
      </span>
      <ArrowRight size={12} className="text-muted-foreground" />
    </Link>
  );
}

function SkeletonBlock({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-8 text-xs text-muted-foreground">
      <Loader size={13} className="mr-2 animate-spin" /> {text}
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
      <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <GitBranch size={18} strokeWidth={1.75} />
      </div>
      <p className="font-display text-base font-semibold text-foreground">
        Você ainda não criou nenhum processo
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Comece desenhando seu primeiro fluxo. Leva poucos minutos.
      </p>
      <Link
        to="/modeler"
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary-deep"
      >
        <Plus size={13} strokeWidth={2} />
        Começar agora
      </Link>
    </div>
  );
}
