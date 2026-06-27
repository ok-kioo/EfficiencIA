import type { Violation } from "../../lib/bpmn-validation/types";
import { Crown, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface DisplayViolation extends Violation {
  count?: number;
}

interface ValidationPanelProps {
  violations: DisplayViolation[];
  onFocus: (elementId: string) => void;
  /** Indica que algumas sugestões estão bloqueadas por serem do plano Premium. */
  premiumLockedCount?: number;
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

export function ValidationPanel({
  violations,
  onFocus,
  premiumLockedCount = 0,
}: ValidationPanelProps) {
  const grouped: Record<Violation["severity"], DisplayViolation[]> = {
    error: [],
    warning: [],
    info: [],
  };
  for (const v of violations) grouped[v.severity].push(v);
  const total = violations.length;

  return (
    <div className="space-y-4">
      {total === 0 && premiumLockedCount === 0 && (
        <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-3 text-xs text-primary-deep">
          Tudo certo — o diagrama está consistente.
        </div>
      )}

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

      {premiumLockedCount > 0 && (
        <div className="rounded-lg border-2 border-dashed border-accent/40 bg-gradient-to-br from-primary/5 to-accent/10 p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <Crown size={14} className="text-accent" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Análises avançadas do Premium
            </p>
          </div>
          <p className="text-[13px] leading-snug text-foreground">
            Esta melhoria faz parte das análises avançadas do{" "}
            <strong className="font-semibold">Plano Premium</strong>.
          </p>
          <Link
            to="/premium"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition hover:opacity-95"
          >
            <Sparkles size={11} />
            Conhecer Plano Premium
          </Link>
        </div>
      )}
    </div>
  );
}
