import { useEffect, useRef, useState } from "react";
import type { ProcessActivity } from "../@types/processs";
import { clearDraft, saveDraft } from "../lib/modeler/autosave";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface AutosaveInput {
  bpmnXml: string;
  processName: string;
  activities: ProcessActivity[];
  enabled?: boolean;
}

export function useModelerAutosave({
  bpmnXml,
  processName,
  activities,
  enabled = true,
}: AutosaveInput) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    // Skip the very first render so we don't overwrite the restored draft
    // with the same content immediately.
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const result = saveDraft({ bpmnXml, processName, activities });
      if (result) {
        setLastSavedAt(result.savedAt);
        setStatus("saved");
      } else {
        setStatus("error");
      }
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [bpmnXml, processName, activities, enabled]);

  function discard() {
    clearDraft();
    setLastSavedAt(null);
    setStatus("idle");
  }

  return { status, lastSavedAt, discard };
}
