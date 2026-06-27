import type { ProcessActivity } from "../../@types/processs";

const STORAGE_KEY = "efficiencia:modeler:draft";

export interface ModelerDraft {
  bpmnXml: string;
  processName: string;
  activities: ProcessActivity[];
  savedAt: number;
}

export function loadDraft(): ModelerDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModelerDraft;
    if (!parsed?.bpmnXml || typeof parsed.bpmnXml !== "string") return null;
    return parsed;
  } catch (err) {
    console.warn("Não foi possível carregar rascunho do modelador:", err);
    return null;
  }
}

export function saveDraft(draft: Omit<ModelerDraft, "savedAt">): ModelerDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const payload: ModelerDraft = { ...draft, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch (err) {
    console.warn("Falha ao salvar rascunho do modelador:", err);
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Falha ao remover rascunho do modelador:", err);
  }
}
