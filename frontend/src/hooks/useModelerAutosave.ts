import { useEffect, useRef, useState } from "react";
import type { ProcessActivity } from "../@types/processs";
import { clearDraft, saveDraft } from "../lib/modeler/autosave";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface AutosaveInput {
  projectId: string | null | undefined;
  bpmnXml: string;
  processName: string;
  activities: ProcessActivity[];
  enabled?: boolean;
}

export function useModelerAutosave({
  projectId,
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
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const result = saveDraft(projectId, { bpmnXml, processName, activities });
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
  }, [projectId, bpmnXml, processName, activities, enabled]);

  // Reset autosave bookkeeping when switching projects so the saved-time
  // indicator and the "can discard" gate match the new project.
  useEffect(() => {
    firstRunRef.current = true;
    setLastSavedAt(null);
    setStatus("idle");
  }, [projectId]);

  function discard() {
    clearDraft(projectId);
    setLastSavedAt(null);
    setStatus("idle");
  }

  return { status, lastSavedAt, discard };
}
