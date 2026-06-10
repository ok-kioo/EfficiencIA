import type { ProcessModel } from "../@types/processs";

const STORAGE_KEY = "efficiencia_process";

export function saveProcessLocally(process: ProcessModel) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(process));
}

export function getLocalProcess(): ProcessModel | null {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as ProcessModel;
}

export function clearLocalProcess() {
  localStorage.removeItem(STORAGE_KEY);
}