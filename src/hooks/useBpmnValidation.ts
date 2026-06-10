import { useEffect, useRef, useState } from "react";
import type BpmnModelerLib from "bpmn-js/lib/Modeler";
import { toast } from "sonner";

import { validate } from "../lib/bpmn-validation/SemanticValidator";
import type { Violation } from "../lib/bpmn-validation/types";

type Any = any;

interface UseBpmnValidationParams {
  modeler: BpmnModelerLib | null;
}

export function useBpmnValidation({ modeler }: UseBpmnValidationParams) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const overlayIdsRef = useRef<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!modeler) return;
    const eventBus: Any = modeler.get("eventBus");
    const overlays: Any = modeler.get("overlays");

    function clearOverlays() {
      for (const id of overlayIdsRef.current) {
        try {
          overlays.remove(id);
        } catch {
          /* noop */
        }
      }
      overlayIdsRef.current = [];
    }

    function runValidation() {
      const result = validate(modeler);
      setViolations(result);

      clearOverlays();
      // Group by elementId to avoid stacking overlays
      const byElement = new Map<string, Violation[]>();
      for (const v of result) {
        if (!v.elementId) continue;
        const list = byElement.get(v.elementId) || [];
        list.push(v);
        byElement.set(v.elementId, list);
      }
      const elementRegistry: Any = modeler!.get("elementRegistry");
      for (const [elementId, vs] of byElement.entries()) {
        const el = elementRegistry.get(elementId);
        if (!el) continue;
        const hasError = vs.some((v) => v.severity === "error");
        const color = hasError ? "#dc2626" : "#f59e0b";
        const tooltip = vs.map((v) => v.message).join("\n");
        try {
          const id = overlays.add(elementId, "validation", {
            position: { top: -8, right: -8 },
            html: `<div title="${tooltip.replace(/"/g, "&quot;")}" style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px ${color};"></div>`,
          });
          overlayIdsRef.current.push(id);
        } catch {
          /* element may have been removed */
        }
      }
    }

    function scheduleValidation() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(runValidation, 150);
    }

    function onBlocked(payload: Any) {
      toast.error(payload?.message || "Ação bloqueada pelo validador.");
    }

    eventBus.on("commandStack.changed", scheduleValidation);
    eventBus.on("import.done", scheduleValidation);
    eventBus.on("validation.blocked", onBlocked);

    // Initial run
    scheduleValidation();

    return () => {
      eventBus.off("commandStack.changed", scheduleValidation);
      eventBus.off("import.done", scheduleValidation);
      eventBus.off("validation.blocked", onBlocked);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearOverlays();
    };
  }, [modeler]);

  function focusElement(elementId: string) {
    if (!modeler) return;
    try {
      const elementRegistry: Any = modeler.get("elementRegistry");
      const canvas: Any = modeler.get("canvas");
      const selection: Any = modeler.get("selection");
      const el = elementRegistry.get(elementId);
      if (!el) return;
      canvas.scrollToElement(el);
      selection.select(el);
    } catch {
      /* noop */
    }
  }

  return { violations, focusElement };
}
