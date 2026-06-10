import type { Violation } from "../../lib/bpmn-validation/types";

interface ValidationPanelProps {
  violations: Violation[];
  onFocus: (elementId: string) => void;
}

const SEVERITY_LABEL: Record<Violation["severity"], string> = {
  error: "Erros",
  warning: "Avisos",
  info: "Notas",
};

const ACCENT: Record<Violation["severity"], string> = {
  error: "border-l-destructive",
  warning: "border-l-warning",
  info: "border-l-muted-foreground/40",
};

const DOT: Record<Violation["severity"], string> = {
  error: "bg-destructive",
  warning: "bg-warning",
  info: "bg-muted-foreground/50",
};

export function ValidationPanel({ violations, onFocus }: ValidationPanelProps) {
  const grouped: Record<Violation["severity"], Violation[]> = {
    error: [],
    warning: [],
    info: [],
  };
  for (const v of violations) grouped[v.severity].push(v);
  const total = violations.length;

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Validação BPMN
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {total === 0
              ? "Sem violações."
              : `${total} ${total === 1 ? "violação" : "violações"}.`}
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground tabular">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            {grouped.error.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            {grouped.warning.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            {grouped.info.length}
          </span>
        </div>
      </header>

      <div className="p-3">
        {total === 0 ? (
          <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-3 text-xs text-primary-deep">
            Diagrama sintaticamente válido.
          </div>
        ) : (
          <div className="space-y-4">
            {(Object.keys(grouped) as Violation["severity"][]).map((severity) => {
              const items = grouped[severity];
              if (items.length === 0) return null;
              return (
                <div key={severity}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {SEVERITY_LABEL[severity]} · {items.length}
                  </p>
                  <ul className="space-y-1">
                    {items.map((v) => (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => onFocus(v.elementId)}
                          className={`flex w-full items-start gap-2 rounded-md border-l-2 bg-background px-3 py-2 text-left text-[13px] text-foreground transition hover:bg-muted ${ACCENT[severity]}`}
                        >
                          <span
                            className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${DOT[severity]}`}
                          />
                          <span className="flex-1">
                            <span className="block leading-snug">{v.message}</span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground tabular">
                              {v.elementName || v.elementId} · {v.rule}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
