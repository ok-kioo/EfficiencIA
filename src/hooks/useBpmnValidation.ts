import { useEffect, useMemo, useRef, useState } from "react";
import type BpmnModelerLib from "bpmn-js/lib/Modeler";
import { toast } from "sonner";

import { validate } from "../lib/bpmn-validation/SemanticValidator";
import type { Violation } from "../lib/bpmn-validation/types";

type Any = any;

interface UseBpmnValidationParams {
  modeler: BpmnModelerLib | null;
}

export type ValidationSeverity = "error" | "warning" | null;

export function useBpmnValidation({ modeler }: UseBpmnValidationParams) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!modeler) return;
    const eventBus: Any = modeler.get("eventBus");

    function runValidation() {
      const result = validate(modeler);
      setViolations(result);
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
    };
  }, [modeler]);

  const worstSeverity = useMemo<ValidationSeverity>(() => {
    if (violations.some((v) => v.severity === "error")) return "error";
    if (violations.some((v) => v.severity === "warning")) return "warning";
    return null;
  }, [violations]);

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

  return { violations, focusElement, worstSeverity };
}
