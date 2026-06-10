import { useEffect, useMemo, useRef, useState } from "react";
import BpmnModelerLib from "bpmn-js/lib/Modeler";
import { toast } from "sonner";

import { BpmnModeler, defaultBpmnXml } from "../components/bpmn/BpmnModeler";
import { BpmnToolbar } from "../components/bpmn/BpmnToolBar";
import { ProcessDataPanel } from "../components/process/ProcessDataPanel";
import { ValidationPanel } from "../components/bpmn/ValidationPanel";
import type { ProcessActivity, ProcessModel } from "../@types/processs";
import {
  extractActivitiesFromBpmn,
  mergeExtractedActivities,
} from "../utils/bpmnUtils";
import { downloadFile } from "../utils/downloadFile";
import { saveProcessLocally } from "../services/processService";
import { loadDraft } from "../lib/modeler/autosave";
import { useModelerAutosave } from "../hooks/useModelerAutosave";
import { useBpmnValidation } from "../hooks/useBpmnValidation";

export function ModelerPage() {
  // Restore from localStorage on first render (client-only).
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

  async function handleSave() {
    const m = modelerRef.current;
    if (!m) return;
    const result = await m.saveXML({ format: true });
    if (!result.xml) return;

    const errorCount = violations.filter((v) => v.severity === "error").length;
    if (errorCount > 0) {
      const ok = window.confirm(
        `O diagrama possui ${errorCount} erro(s) de validação. Deseja salvar mesmo assim?`
      );
      if (!ok) return;
    }

    const process: ProcessModel = {
      name: processName,
      bpmnXml: result.xml,
      activities,
    };

    saveProcessLocally(process);
    toast.success("Processo salvo localmente.");
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
          ? `Salvo automaticamente às ${new Date(lastSavedAt).toLocaleTimeString()}`
          : "Autosave ativo";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modelagem do processo</h1>
          <p className="text-sm text-slate-500">
            Desenhe o fluxo BPMN e complemente cada atividade com dados operacionais.
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <span
              className={`inline-flex items-center gap-1.5 ${
                status === "error" ? "text-red-600" : ""
              }`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  status === "saving"
                    ? "bg-amber-400 animate-pulse"
                    : status === "error"
                      ? "bg-red-500"
                      : "bg-emerald-500"
                }`}
              />
              {autosaveLabel}
            </span>
            {lastSavedAt && (
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Descartar rascunho
              </button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Nome do processo
          </label>
          <input
            value={processName}
            onChange={(event) => setProcessName(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <BpmnToolbar onImport={handleImport} onExport={handleExport} onSave={handleSave} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <BpmnModeler
          xml={bpmnXml}
          onChange={handleBpmnChange}
          onModelerReady={handleModelerReady}
        />

        <div className="flex flex-col gap-6">
          <ProcessDataPanel
            activities={activities}
            onActivitiesChange={setActivities}
          />
          <ValidationPanel violations={violations} onFocus={focusElement} />
        </div>
      </div>
    </div>
  );
}
