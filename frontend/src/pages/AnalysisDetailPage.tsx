import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader, Sparkles } from "lucide-react";
import { analysisService, type Analysis } from "../services/analysisService";

function asList(v: unknown[] | null | undefined): unknown[] {
  return Array.isArray(v) ? v : [];
}

function renderItem(item: unknown, idx: number) {
  if (typeof item === "string") {
    return (
      <li key={idx} className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
        {item}
      </li>
    );
  }
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    const title = (obj.title || obj.name || obj.summary) as string | undefined;
    const description = (obj.description || obj.detail || obj.explanation) as string | undefined;
    return (
      <li key={idx} className="rounded-md border border-border bg-background px-3 py-2">
        {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        {!title && !description && (
          <pre className="overflow-x-auto text-[11px] text-muted-foreground">
            {JSON.stringify(obj, null, 2)}
          </pre>
        )}
      </li>
    );
  }
  return null;
}

function Section({ title, items }: { title: string; items: unknown[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6">
      <h3 className="mb-2 font-display text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2">{items.map(renderItem)}</ul>
    </section>
  );
}

export function AnalysisDetailPage() {
  const { id } = useParams({ from: "/_authenticated/analyses/$id" });
  const { data: analysis, isLoading, error, refetch } = useQuery<Analysis>({
    queryKey: ["analysis", id],
    queryFn: () => analysisService.get(id),
    refetchInterval: (q) => (q.state.data?.status === "running" ? 3000 : false),
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
          <Sparkles size={16} className="text-primary" />
          <h1 className="font-display text-xl font-semibold text-foreground">
            Análise do processo
          </h1>
        </div>

        {isLoading ? (
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader size={14} className="animate-spin" /> Carregando…
          </p>
        ) : error ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Não foi possível carregar a análise.
            <button onClick={() => refetch()} className="ml-2 underline">Tentar novamente</button>
          </div>
        ) : analysis ? (
          <>
            {analysis.status === "running" && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <Loader size={14} className="animate-spin" />
                A IA está analisando seu processo…
              </p>
            )}
            {analysis.status === "failed" && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle size={14} className="mt-0.5" />
                <div>
                  <p className="font-semibold">A análise falhou.</p>
                  <p className="mt-0.5 text-xs">{analysis.error}</p>
                </div>
              </div>
            )}

            {analysis.status === "done" && (
              <>
                {analysis.final_assessment && (
                  <div className="mt-5 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4">
                    <CheckCircle2 size={18} className="mt-0.5 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Avaliação final · {analysis.final_assessment.score}/100
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {analysis.final_assessment.explanation}
                      </p>
                    </div>
                  </div>
                )}

                {analysis.summary && (
                  <section className="mt-6">
                    <h3 className="mb-2 font-display text-sm font-semibold text-foreground">
                      Resumo
                    </h3>
                    <p className="rounded-md border border-border bg-background p-3 text-sm leading-relaxed text-foreground">
                      {analysis.summary}
                    </p>
                  </section>
                )}

                <Section title="Gargalos identificados" items={asList(analysis.bottlenecks)} />
                <Section title="Problemas de modelagem" items={asList(analysis.modeling_issues)} />
                <Section
                  title="Sugestões de melhoria"
                  items={asList(analysis.improvement_suggestions)}
                />
              </>
            )}

            <p className="mt-6 text-[11px] text-muted-foreground tabular">
              Criada em {new Date(analysis.created_at).toLocaleString()}
              {analysis.finished_at &&
                ` · finalizada em ${new Date(analysis.finished_at).toLocaleString()}`}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
