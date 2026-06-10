import { useEffect, useRef } from "react";
import BpmnModelerLib from "bpmn-js/lib/Modeler";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-js.css";

interface BpmnModelerProps {
  xml: string;
  onChange: (xml: string) => void;
  onModelerReady?: (modeler: BpmnModelerLib) => void;
}

export const defaultBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Início" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="120" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export function BpmnModeler({
  xml,
  onChange,
  onModelerReady,
}: BpmnModelerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<BpmnModelerLib | null>(null);
  const importedXmlRef = useRef<string>("");

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const modeler = new BpmnModelerLib({
      container: containerRef.current,
    });

    modelerRef.current = modeler;
    onModelerReady?.(modeler);

    modeler.on("commandStack.changed", async () => {
      const result = await modeler.saveXML({ format: true });

      if (result.xml) {
        onChange(result.xml);
      }
    });

    return () => {
      modeler.destroy();
    };
  }, []);

  useEffect(() => {
    async function importXml() {
      const modeler = modelerRef.current;

      if (!modeler || !xml || importedXmlRef.current === xml) {
        return;
      }

      try {
        await modeler.importXML(xml);
        importedXmlRef.current = xml;

        const canvas = modeler.get("canvas") as {
          zoom: (value: string) => void;
        };

        canvas.zoom("fit-viewport");
      } catch (error) {
        console.error("Erro ao importar BPMN:", error);
      }
    }

    importXml();
  }, [xml]);

  return (
    <div className="h-[calc(100vh-230px)] min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}