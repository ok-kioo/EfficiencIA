import { useState } from "react";
import {
  AlertTriangle,
  Download,
  FolderOpen,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface BpmnToolbarProps {
  onImport: (file: File) => void;
  onExport: () => void;
  onAnalyze: () => void;
  onDiscard: () => void;
  canDiscard: boolean;
  analyzing?: boolean;
}

export function BpmnToolbar({
  onImport,
  onExport,
  onAnalyze,
  onDiscard,
  canDiscard,
  analyzing = false,
}: BpmnToolbarProps) {
  const [discardOpen, setDiscardOpen] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted">
        <FolderOpen size={14} strokeWidth={1.75} />
        Importar
        <input
          type="file"
          accept=".bpmn,.xml"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <button
        type="button"
        onClick={onExport}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted"
      >
        <Download size={14} strokeWidth={1.75} />
        Exportar
      </button>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            disabled={!canDiscard}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            Descartar rascunho
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" />
              Descartar rascunho?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja descartar este rascunho? Essa ação não poderá
              ser desfeita e você voltará ao diagrama padrão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="ml-auto">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={14} strokeWidth={2} />
          {analyzing ? "Analisando…" : "Analisar com IA"}
        </button>
      </div>
    </div>
  );
}
