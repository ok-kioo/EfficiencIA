import type { Violation } from "../../lib/bpmn-validation/types";

interface DisplayViolation extends Violation {
  count?: number;
}

interface ValidationPanelProps {
  violations: DisplayViolation[];
  onFocus: (elementId: string) => void;
}

const SEVERITY_LABEL: Record<Violation["severity"], string> = {
  error: "Precisa corrigir",
  warning: "Sugestões",
  info: "Dicas",
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
  const grouped: Record<Violation["severity"], DisplayViolation[]> = {
    error: [],
    warning: [],
    info: [],
  };
  for (const v of violations) grouped[v.severity].push(v);
  const total = violations.length;

  if (total === 0) {
    return (
      <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-3 text-xs text-primary-deep">
        Tudo certo — o diagrama está consistente.
      </div>
    );
  }

  return (
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
                      <span className="block leading-snug">
                        {v.message}
                        {v.count && v.count > 1 ? (
                          <span className="ml-1.5 inline-flex h-4 items-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                            ×{v.count}
                          </span>
                        ) : null}
                      </span>
                      {v.elementName && (
                        <span className="mt-0.5 block text-[11px] text-muted-foreground tabular">
                          {v.elementName}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
