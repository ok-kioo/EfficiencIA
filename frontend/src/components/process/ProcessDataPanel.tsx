import type { ProcessActivity } from "../../@types/processs";

interface ProcessDataPanelProps {
  activities: ProcessActivity[];
  selectedElementId: string | null;
  onActivitiesChange: (activities: ProcessActivity[]) => void;
}

const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";
const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

export function ProcessDataPanel({
  activities,
  selectedElementId,
  onActivitiesChange,
}: ProcessDataPanelProps) {
  function updateActivity(
    id: string,
    field: keyof ProcessActivity,
    value: string | number,
  ) {
    const updatedActivities = activities.map((activity) =>
      activity.id === id ? { ...activity, [field]: value } : activity,
    );
    onActivitiesChange(updatedActivities);
  }

  const activity = selectedElementId
    ? activities.find((a) => a.id === selectedElementId) ?? null
    : null;

  if (!activity) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background/50 px-3 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          {selectedElementId
            ? "Esta etapa ainda não tem dados — clique nela no diagrama para começar."
            : "Selecione uma etapa do fluxo para informar dados operacionais."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="mb-3">
        <p className="text-[13px] font-semibold text-foreground">{activity.name}</p>
        <p className="text-[10px] text-muted-foreground tabular">Etapa do fluxo</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className={labelClass}>Tipo de etapa</label>
          <select
            value={activity.type}
            onChange={(e) => updateActivity(activity.id, "type", e.target.value)}
            className={inputClass}
          >
            <option value="manual">Manual (alguém executa)</option>
            <option value="approval">Aprovação</option>
            <option value="system">Sistema (automática)</option>
            <option value="decision">Decisão</option>
            <option value="integration">Integração com outro sistema</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Tempo médio (min)</label>
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
          <label className={labelClass}>Custo (R$)</label>
          <input
            type="number"
            value={activity.cost ?? ""}
            onChange={(e) => updateActivity(activity.id, "cost", Number(e.target.value))}
            className={inputClass}
            placeholder="150"
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Responsável</label>
          <input
            value={activity.responsible ?? ""}
            onChange={(e) => updateActivity(activity.id, "responsible", e.target.value)}
            className={inputClass}
            placeholder="Ex: Gerente financeiro"
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Área / recurso</label>
          <input
            value={activity.resource ?? ""}
            onChange={(e) => updateActivity(activity.id, "resource", e.target.value)}
            className={inputClass}
            placeholder="Ex: Equipe financeira"
          />
        </div>

        <div>
          <label className={labelClass}>Volume por mês</label>
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
            onChange={(e) => updateActivity(activity.id, "criticality", e.target.value)}
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
            onChange={(e) => updateActivity(activity.id, "observations", e.target.value)}
            className="min-h-16 w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Ex: depende de validação externa, costuma acumular fila…"
          />
        </div>
      </div>
    </div>
  );
}
