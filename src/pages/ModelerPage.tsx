import { useEffect, useMemo, useRef, useState } from "react";
import BpmnModelerLib from "bpmn-js/lib/Modeler";
import { toast } from "sonner";

import { BpmnModeler, defaultBpmnXml } from "../components/bpmn/BpmnModeler";
import { BpmnToolbar } from "../components/bpmn/BpmnToolBar";
import { ProcessDataPanel } from "../components/process/ProcessDataPanel";
import { ValidationPanel } from "../components/bpmn/ValidationPanel";
import type { ProcessActivity } from "../@types/processs";
import {
  extractActivitiesFromBpmn,
  mergeExtractedActivities,
} from "../utils/bpmnUtils";
import { downloadFile } from "../utils/downloadFile";
import { loadDraft } from "../lib/modeler/autosave";
import { useModelerAutosave } from "../hooks/useModelerAutosave";
import { useBpmnValidation } from "../hooks/useBpmnValidation";

export function ModelerPage() {
  const initial = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        bpmnXml: defaultBpmnXml,
        processName: "Novo processo",
        activities: [] as ProcessActivity[],
        restored: false,
      };
    }
    const draft = loadDraft();
    if (draft) {
      return {
        bpmnXml: draft.bpmnXml,
        processName: draft.processName || "Novo processo",
        activities: draft.activities || [],
        restored: true,
      };
    }
    return {
      bpmnXml: defaultBpmnXml,
      processName: "Novo processo",
      activities: [],
      restored: false,
    };
  }, []);

  const [processName, setProcessName] = useState(initial.processName);
  const [bpmnXml, setBpmnXml] = useState(initial.bpmnXml);
  const [activities, setActivities] = useState<ProcessActivity[]>(initial.activities);
  const [modeler, setModeler] = useState<BpmnModelerLib | null>(null);
  const modelerRef = useRef<BpmnModelerLib | null>(null);
  const restoredToastRef = useRef(false);

  const { status, lastSavedAt, discard } = useModelerAutosave({
    bpmnXml,
    processName,
    activities,
  });

  const { violations, focusElement } = useBpmnValidation({ modeler });

  useEffect(() => {
    if (initial.restored && !restoredToastRef.current) {
      restoredToastRef.current = true;
      toast.success("Rascunho restaurado do navegador.");
    }
  }, [initial.restored]);

  useEffect(() => {
    const extractedActivities = extractActivitiesFromBpmn(bpmnXml);
    setActivities((current) => mergeExtractedActivities(current, extractedActivities));
  }, [bpmnXml]);

  function handleModelerReady(m: BpmnModelerLib) {
    modelerRef.current = m;
    setModeler(m);
  }

  async function handleImport(file: File) {
    const content = await file.text();
    setBpmnXml(content);
  }

  async function handleExport() {
    const m = modelerRef.current;
    if (!m) return;
    const result = await m.saveXML({ format: true });
    if (!result.xml) return;
    downloadFile(`${processName}.bpmn`, result.xml, "application/xml");
  }

  function handleBpmnChange(xml: string) {
    setBpmnXml(xml);
  }

  function handleDiscardDraft() {
    if (!window.confirm("Descartar o rascunho salvo e voltar ao diagrama padrão?")) return;
    discard();
    setBpmnXml(defaultBpmnXml);
    setProcessName("Novo processo");
    setActivities([]);
    toast.success("Rascunho descartado.");
  }

  const autosaveLabel =
    status === "saving"
      ? "Salvando…"
      : status === "error"
        ? "Falha ao salvar automaticamente"
        : lastSavedAt
          ? `Salvo às ${new Date(lastSavedAt).toLocaleTimeString()}`
          : "Autosave ativo";

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Modelagem do processo
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Desenhe o fluxo BPMN e complemente cada atividade com dados operacionais.
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground tabular">
            <span
              className={`inline-flex items-center gap-1.5 ${
                status === "error" ? "text-destructive" : ""
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  status === "saving"
                    ? "bg-accent animate-pulse"
                    : status === "error"
                      ? "bg-destructive"
                      : "bg-primary"
                }`}
              />
              {autosaveLabel}
            </span>
            {lastSavedAt && (
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-[11px] font-medium text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline"
              >
                Descartar rascunho
              </button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nome do processo
          </label>
          <input
            value={processName}
            onChange={(event) => setProcessName(event.target.value)}
            className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <BpmnToolbar onImport={handleImport} onExport={handleExport} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_400px]">
        <BpmnModeler
          xml={bpmnXml}
          onChange={handleBpmnChange}
          onModelerReady={handleModelerReady}
        />

        <div className="flex flex-col gap-5">
          <ValidationPanel violations={violations} onFocus={focusElement} />
          <ProcessDataPanel
            activities={activities}
            onActivitiesChange={setActivities}
          />
        </div>
      </div>
    </div>
  );
}
