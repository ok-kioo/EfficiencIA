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
  const markedRef = useRef<Map<string, string>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!modeler) return;
    const eventBus: Any = modeler.get("eventBus");
    const canvas: Any = modeler.get("canvas");
    const elementRegistry: Any = modeler.get("elementRegistry");

    function clearMarkers() {
      for (const [elementId, cls] of markedRef.current.entries()) {
        const el = elementRegistry.get(elementId);
        if (el) {
          try {
            canvas.removeMarker(el, cls);
          } catch {
            /* element removed */
          }
        }
      }
      markedRef.current.clear();
    }

    function runValidation() {
      const result = validate(modeler);
      setViolations(result);

      clearMarkers();
      // Pick worst severity per element
      const worst = new Map<string, "error" | "warning">();
      for (const v of result) {
        if (!v.elementId) continue;
        if (v.severity === "error") {
          worst.set(v.elementId, "error");
        } else if (v.severity === "warning" && worst.get(v.elementId) !== "error") {
          worst.set(v.elementId, "warning");
        }
      }
      for (const [elementId, severity] of worst.entries()) {
        const el = elementRegistry.get(elementId);
        if (!el) continue;
        const cls = severity === "error" ? "validation-error" : "validation-warning";
        try {
          canvas.addMarker(el, cls);
          markedRef.current.set(elementId, cls);
        } catch {
          /* noop */
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

    scheduleValidation();

    return () => {
      eventBus.off("commandStack.changed", scheduleValidation);
      eventBus.off("import.done", scheduleValidation);
      eventBus.off("validation.blocked", onBlocked);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearMarkers();
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
