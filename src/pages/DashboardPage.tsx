import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, GitBranch, Plus, Sparkles, Loader } from "lucide-react";
import { projectService } from "../services/projectService";

export function DashboardPage() {
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.list(),
  });

  return (
    <div>
      <section className="relative mb-6 overflow-hidden rounded-xl border border-border bg-card px-6 py-7">
        <span className="absolute right-6 top-6 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          <Sparkles size={11} strokeWidth={2} />
          Bem-vindo
        </span>
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          Seus processos em um só lugar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Crie fluxos novos, abra os que já desenhou e veja as análises feitas pela IA.
        </p>

        <Link
          to="/modeler"
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary-deep"
        >
          <Plus size={13} strokeWidth={2} />
          Criar novo processo
        </Link>
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
          Seus processos
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-sm text-muted-foreground">
          <Loader size={14} className="mr-2 animate-spin" /> Carregando…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-6 text-sm text-destructive">
          Não foi possível carregar seus projetos. Verifique se o backend está rodando.
        </div>
      ) : projects.length === 0 ? (
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
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <h3 className="font-display text-sm font-semibold text-foreground">
                {p.name}
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Atualizado em {new Date(p.updated_at).toLocaleDateString()}
              </p>
              <div className="mt-4 flex items-center gap-2">
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
  );
}
