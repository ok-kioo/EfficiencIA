import type { ProcessActivity } from "../../@types/processs";

interface ProcessDataPanelProps {
  activities: ProcessActivity[];
  onActivitiesChange: (activities: ProcessActivity[]) => void;
}

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
    <aside className="h-[calc(100vh-150px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Dados operacionais
        </h2>

        <p className="text-sm text-slate-500">
          As atividades são extraídas automaticamente do BPMN.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
          Nenhuma atividade encontrada. Adicione tarefas ao fluxo BPMN.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">
                  {activity.name}
                </p>
                <p className="text-xs text-slate-500">{activity.id}</p>
              </div>

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Tipo da atividade
              </label>
              <select
                value={activity.type}
                onChange={(event) =>
                  updateActivity(activity.id, "type", event.target.value)
                }
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              >
                <option value="manual">Manual</option>
                <option value="approval">Aprovação</option>
                <option value="system">Sistema</option>
                <option value="decision">Decisão</option>
                <option value="integration">Integração</option>
              </select>

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Tempo médio em minutos
              </label>
              <input
                type="number"
                value={activity.averageTimeMinutes ?? ""}
                onChange={(event) =>
                  updateActivity(
                    activity.id,
                    "averageTimeMinutes",
                    Number(event.target.value)
                  )
                }
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: 30"
              />

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Responsável
              </label>
              <input
                value={activity.responsible ?? ""}
                onChange={(event) =>
                  updateActivity(activity.id, "responsible", event.target.value)
                }
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: Gerente financeiro"
              />

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Recurso utilizado
              </label>
              <input
                value={activity.resource ?? ""}
                onChange={(event) =>
                  updateActivity(activity.id, "resource", event.target.value)
                }
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: Equipe financeira"
              />

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Custo estimado
              </label>
              <input
                type="number"
                value={activity.cost ?? ""}
                onChange={(event) =>
                  updateActivity(activity.id, "cost", Number(event.target.value))
                }
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: 150"
              />

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Volume de demanda
              </label>
              <input
                type="number"
                value={activity.demandVolume ?? ""}
                onChange={(event) =>
                  updateActivity(
                    activity.id,
                    "demandVolume",
                    Number(event.target.value)
                  )
                }
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: 40"
              />

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Criticidade
              </label>
              <select
                value={activity.criticality ?? "medium"}
                onChange={(event) =>
                  updateActivity(activity.id, "criticality", event.target.value)
                }
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>

              <label className="mb-1 block text-xs font-medium text-slate-500">
                Observações contextuais
              </label>
              <textarea
                value={activity.observations ?? ""}
                onChange={(event) =>
                  updateActivity(activity.id, "observations", event.target.value)
                }
                className="min-h-20 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: depende de validação externa, costuma acumular fila..."
              />
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}