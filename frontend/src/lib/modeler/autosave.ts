import type { ProcessActivity } from "../../@types/processs";

const KEY_PREFIX = "efficiencia:modeler:draft:";
const LEGACY_KEY = "efficiencia:modeler:draft";

export interface ModelerDraft {
  bpmnXml: string;
  processName: string;
  activities: ProcessActivity[];
  savedAt: number;
}

/** A chave usada para um rascunho. Pass `null` para rascunho sem projeto (modo "novo"). */
export function draftKey(projectId: string | null | undefined): string {
  return KEY_PREFIX + (projectId ?? "__new__");
}

export function loadDraft(projectId: string | null | undefined): ModelerDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModelerDraft;
    if (!parsed?.bpmnXml || typeof parsed.bpmnXml !== "string") return null;
    return parsed;
  } catch (err) {
    console.warn("Não foi possível carregar rascunho do modelador:", err);
    return null;
  }
}

export function saveDraft(
  projectId: string | null | undefined,
  draft: Omit<ModelerDraft, "savedAt">,
): ModelerDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const payload: ModelerDraft = { ...draft, savedAt: Date.now() };
    window.localStorage.setItem(draftKey(projectId), JSON.stringify(payload));
    return payload;
  } catch (err) {
    console.warn("Falha ao salvar rascunho do modelador:", err);
    return null;
  }
}

export function clearDraft(projectId: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(projectId));
  } catch (err) {
    console.warn("Falha ao remover rascunho do modelador:", err);
  }
}

/** Remove TODOS os rascunhos (chaves novas e legadas). Útil ao deslogar. */
export function clearAllDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    const ls = window.localStorage;
    const toRemove: string[] = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (!k) continue;
      if (k === LEGACY_KEY || k.startsWith(KEY_PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => ls.removeItem(k));
  } catch (err) {
    console.warn("Falha ao limpar rascunhos:", err);
  }
}
