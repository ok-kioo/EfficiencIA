import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  FileCode2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { ExportFormat } from "../../utils/bpmnExport";

interface BpmnToolbarProps {
  onImport: (file: File) => void;
  onExport: (format: ExportFormat) => void;
  onAnalyze: () => void;
  onDiscard: () => void;
  canDiscard: boolean;
  analyzing?: boolean;
  /** Quando true, o botão "Analisar" recebe um leve realce de "Recomendado". */
  highlightAnalyze?: boolean;
}

export function BpmnToolbar({
  onImport,
  onExport,
  onAnalyze,
  onDiscard,
  canDiscard,
  analyzing = false,
  highlightAnalyze = false,
}: BpmnToolbarProps) {
  const [discardOpen, setDiscardOpen] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  }

  return (
    <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-2">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            <Download size={14} strokeWidth={1.75} />
            Exportar
            <ChevronDown size={12} strokeWidth={1.75} className="opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onClick={() => onExport("xml")} className="gap-2">
            <FileCode2 size={14} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm">XML (.bpmn)</span>
              <span className="text-[10px] text-muted-foreground">
                Reimportável em qualquer editor BPMN
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("png")} className="gap-2">
            <FileImage size={14} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm">Imagem (.png)</span>
              <span className="text-[10px] text-muted-foreground">
                Boa para apresentações e documentos
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("pdf")} className="gap-2">
            <FileText size={14} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm">PDF (.pdf)</span>
              <span className="text-[10px] text-muted-foreground">
                Pronto para impressão e compartilhamento
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      <div className="ml-auto flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          className={`group relative inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-semibold text-primary-foreground shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
            highlightAnalyze
              ? "bg-gradient-to-r from-primary via-primary to-accent ring-2 ring-accent/40 hover:from-primary-deep hover:to-accent hover:ring-accent/60"
              : "bg-primary hover:bg-primary-deep"
          }`}
        >
          <Sparkles
            size={16}
            strokeWidth={2}
            className={highlightAnalyze ? "animate-pulse" : ""}
          />
          {analyzing ? "Analisando…" : "Analisar com IA"}
          {highlightAnalyze && !analyzing && (
            <span className="ml-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
              Recomendado
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
