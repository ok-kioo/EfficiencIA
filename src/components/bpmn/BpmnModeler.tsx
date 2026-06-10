import { useEffect, useRef } from "react";
import type BpmnModelerLib from "bpmn-js/lib/Modeler";

import { customRulesModule } from "../../lib/bpmn-validation";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-js.css";


interface BpmnModelerProps {
  xml: string;
  onChange: (xml: string) => void;
  onModelerReady?: (modeler: BpmnModelerLib) => void;
  validationSeverity?: "error" | "warning" | null;
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

export function BpmnModeler({ xml, onChange, onModelerReady, validationSeverity = null }: BpmnModelerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelerRef = useRef<BpmnModelerLib | null>(null);
  const importedXmlRef = useRef<string>("");
  const xmlRef = useRef(xml);
  xmlRef.current = xml;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    let destroyed = false;
    let modeler: BpmnModelerLib | null = null;

    (async () => {
      const { default: BpmnModelerCtor } = await import("bpmn-js/lib/Modeler");
      if (destroyed || !containerRef.current) return;

      modeler = new BpmnModelerCtor({
        container: containerRef.current,
        additionalModules: [customRulesModule],
      });
      modelerRef.current = modeler;
      onModelerReady?.(modeler);


      modeler.on("commandStack.changed", async () => {
        const result = await modeler!.saveXML({ format: true });
        if (result.xml) onChange(result.xml);
      });

      if (xmlRef.current) {
        try {
          await modeler.importXML(xmlRef.current);
          importedXmlRef.current = xmlRef.current;
          const canvas = modeler.get("canvas") as { zoom: (v: string) => void };
          canvas.zoom("fit-viewport");
        } catch (err) {
          console.error("Erro ao importar BPMN:", err);
        }
      }
    })();

    return () => {
      destroyed = true;
      modeler?.destroy();
      modelerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const modeler = modelerRef.current;
    if (!modeler || !xml || importedXmlRef.current === xml) return;

    (async () => {
      try {
        await modeler.importXML(xml);
        importedXmlRef.current = xml;
        const canvas = modeler.get("canvas") as { zoom: (v: string) => void };
        canvas.zoom("fit-viewport");
      } catch (err) {
        console.error("Erro ao importar BPMN:", err);
      }
    })();
  }, [xml]);

  return (
    <div
      className="bpmn-canvas-frame h-[calc(100vh-230px)] min-h-[520px] overflow-hidden rounded-xl bg-card"
      data-validation={validationSeverity ?? undefined}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

