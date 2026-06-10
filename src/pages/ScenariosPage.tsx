export function ScenariosPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Exploração de cenários
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Compare o fluxo atual com alternativas de melhoria.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-6">
        <p className="text-sm text-muted-foreground">Nenhum cenário criado ainda.</p>
      </div>
    </div>
  );
}
