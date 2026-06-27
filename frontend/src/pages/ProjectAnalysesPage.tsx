import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Loader } from "lucide-react";
import { analysisService } from "../services/analysisService";

const STATUS_LABEL: Record<string, string> = {
  running: "Em andamento",
  done: "Concluída",
  failed: "Falhou",
};

export function ProjectAnalysesPage() {
  const { id } = useParams({ from: "/_authenticated/projects/$id/analyses" });
  const { data: analyses = [], isLoading, error } = useQuery({
    queryKey: ["project-analyses", id],
    queryFn: () => analysisService.listForProject(id),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={12} />
        Voltar
      </Link>

      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          <h1 className="font-display text-xl font-semibold text-foreground">
            Histórico de análises
          </h1>
        </div>

        {isLoading ? (
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader size={14} className="animate-spin" /> Carregando…
          </p>
        ) : error ? (
          <p className="mt-6 text-sm text-destructive">Erro ao carregar análises.</p>
        ) : analyses.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Nenhuma análise ainda. Abra o processo no editor e clique em “Analisar com IA”.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {analyses.map((a) => (
              <li key={a.id}>
                <Link
                  to="/analyses/$id"
                  params={{ id: a.id }}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm transition hover:border-primary/40"
                >
                  <span className="text-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      a.status === "done"
                        ? "bg-primary/10 text-primary"
                        : a.status === "failed"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
