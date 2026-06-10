export function AnalysisPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Análise do processo
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Visualize possíveis gargalos, riscos estruturais e impactos sistêmicos.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-6">
        <p className="text-sm text-muted-foreground">Nenhuma análise realizada ainda.</p>
      </div>
    </div>
  );
}
