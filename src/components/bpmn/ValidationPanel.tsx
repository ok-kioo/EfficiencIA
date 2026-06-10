import type { Violation } from "../../lib/bpmn-validation/types";

interface ValidationPanelProps {
  violations: Violation[];
  onFocus: (elementId: string) => void;
}

const SEVERITY_LABEL: Record<Violation["severity"], string> = {
  error: "Erros",
  warning: "Avisos",
  info: "Informações",
};

const SEVERITY_STYLES: Record<Violation["severity"], string> = {
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

const DOT_STYLES: Record<Violation["severity"], string> = {
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-slate-400",
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Validação BPMN</h2>
          <p className="text-sm text-slate-500">
            {total === 0
              ? "Nenhuma violação detectada."
              : `${total} ${total === 1 ? "violação encontrada" : "violações encontradas"}.`}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            {grouped.error.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            {grouped.warning.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
            {grouped.info.length}
          </span>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">
          O diagrama está sintaticamente válido.
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.keys(grouped) as Violation["severity"][]).map((severity) => {
            const items = grouped[severity];
            if (items.length === 0) return null;
            return (
              <div key={severity}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {SEVERITY_LABEL[severity]} ({items.length})
                </p>
                <ul className="space-y-2">
                  {items.map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => onFocus(v.elementId)}
                        className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition hover:shadow-sm ${SEVERITY_STYLES[severity]}`}
                      >
                        <span
                          className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${DOT_STYLES[severity]}`}
                        />
                        <span className="flex-1">
                          <span className="block font-medium">{v.message}</span>
                          <span className="block text-xs opacity-70">
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
    </section>
  );
}
