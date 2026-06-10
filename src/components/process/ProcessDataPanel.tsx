import type { ProcessActivity } from "../../@types/processs";

interface ProcessDataPanelProps {
  activities: ProcessActivity[];
  onActivitiesChange: (activities: ProcessActivity[]) => void;
}

const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";
const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

export function ProcessDataPanel({
  activities,
  onActivitiesChange,
}: ProcessDataPanelProps) {
  function updateActivity(
    id: string,
    field: keyof ProcessActivity,
    value: string | number
  ) {
    const updatedActivities = activities.map((activity) =>
      activity.id === id ? { ...activity, [field]: value } : activity
    );
    onActivitiesChange(updatedActivities);
  }

  return (
    <aside className="max-h-[calc(100vh-150px)] overflow-y-auto rounded-xl border border-border bg-card">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Dados operacionais
        </h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Atividades extraídas automaticamente do BPMN.
        </p>
      </header>

      <div className="p-3">
        {activities.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Nenhuma atividade encontrada. Adicione tarefas ao fluxo BPMN.
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-md border border-border bg-background p-3">
                <div className="mb-2.5">
                  <p className="text-[13px] font-semibold text-foreground">{activity.name}</p>
                  <p className="text-[10px] text-muted-foreground tabular">{activity.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className={labelClass}>Tipo</label>
                    <select
                      value={activity.type}
                      onChange={(e) => updateActivity(activity.id, "type", e.target.value)}
                      className={inputClass}
                    >
                      <option value="manual">Manual</option>
                      <option value="approval">Aprovação</option>
                      <option value="system">Sistema</option>
                      <option value="decision">Decisão</option>
                      <option value="integration">Integração</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Tempo (min)</label>
                    <input
                      type="number"
                      value={activity.averageTimeMinutes ?? ""}
                      onChange={(e) =>
                        updateActivity(activity.id, "averageTimeMinutes", Number(e.target.value))
                      }
                      className={inputClass}
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Custo</label>
                    <input
                      type="number"
                      value={activity.cost ?? ""}
                      onChange={(e) =>
                        updateActivity(activity.id, "cost", Number(e.target.value))
                      }
                      className={inputClass}
                      placeholder="150"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>Responsável</label>
                    <input
                      value={activity.responsible ?? ""}
                      onChange={(e) =>
                        updateActivity(activity.id, "responsible", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Ex: Gerente financeiro"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>Recurso</label>
                    <input
                      value={activity.resource ?? ""}
                      onChange={(e) => updateActivity(activity.id, "resource", e.target.value)}
                      className={inputClass}
                      placeholder="Ex: Equipe financeira"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Volume</label>
                    <input
                      type="number"
                      value={activity.demandVolume ?? ""}
                      onChange={(e) =>
                        updateActivity(activity.id, "demandVolume", Number(e.target.value))
                      }
                      className={inputClass}
                      placeholder="40"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Criticidade</label>
                    <select
                      value={activity.criticality ?? "medium"}
                      onChange={(e) =>
                        updateActivity(activity.id, "criticality", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>Observações</label>
                    <textarea
                      value={activity.observations ?? ""}
                      onChange={(e) =>
                        updateActivity(activity.id, "observations", e.target.value)
                      }
                      className="min-h-16 w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Ex: depende de validação externa, costuma acumular fila…"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
