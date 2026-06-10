import { useEffect, useRef, useState } from "react";
import BpmnModelerLib from "bpmn-js/lib/Modeler";

import {
  BpmnModeler,
  defaultBpmnXml,
} from "../components/bpmn/BpmnModeler";
import { BpmnToolbar } from "../components/bpmn/BpmnToolBar";
import { ProcessDataPanel } from "../components/process/ProcessDataPanel";
import type { ProcessActivity, ProcessModel } from "../@types/processs";
import {
  extractActivitiesFromBpmn,
  mergeExtractedActivities,
} from "../utils/bpmnUtils";
import { downloadFile } from "../utils/downloadFile";
import { saveProcessLocally } from "../services/processService";

export function ModelerPage() {
  const [processName, setProcessName] = useState("Novo processo");
  const [bpmnXml, setBpmnXml] = useState(defaultBpmnXml);
  const [activities, setActivities] = useState<ProcessActivity[]>([]);
  const modelerRef = useRef<BpmnModelerLib | null>(null);

  useEffect(() => {
    const extractedActivities = extractActivitiesFromBpmn(bpmnXml);
    const mergedActivities = mergeExtractedActivities(
      activities,
      extractedActivities
    );

    setActivities(mergedActivities);
  }, [bpmnXml]);

  function handleModelerReady(modeler: BpmnModelerLib) {
    modelerRef.current = modeler;
  }

  async function handleImport(file: File) {
    const content = await file.text();
    setBpmnXml(content);
  }

  async function handleExport() {
    const modeler = modelerRef.current;

    if (!modeler) {
      return;
    }

    const result = await modeler.saveXML({ format: true });

    if (!result.xml) {
      return;
    }

    downloadFile(`${processName}.bpmn`, result.xml, "application/xml");
  }

  async function handleSave() {
    const modeler = modelerRef.current;

    if (!modeler) {
      return;
    }

    const result = await modeler.saveXML({ format: true });

    if (!result.xml) {
      return;
    }

    const process: ProcessModel = {
      name: processName,
      bpmnXml: result.xml,
      activities,
    };

    saveProcessLocally(process);
    alert("Processo salvo localmente.");
  }

  function handleBpmnChange(xml: string) {
    setBpmnXml(xml);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Modelagem do processo
          </h1>

          <p className="text-sm text-slate-500">
            Desenhe o fluxo BPMN e complemente cada atividade com dados
            operacionais.
          </p>
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

      <BpmnToolbar
        onImport={handleImport}
        onExport={handleExport}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <BpmnModeler
          xml={bpmnXml}
          onChange={handleBpmnChange}
          onModelerReady={handleModelerReady}
        />

        <ProcessDataPanel
          activities={activities}
          onActivitiesChange={setActivities}
        />
      </div>
    </div>
  );
}