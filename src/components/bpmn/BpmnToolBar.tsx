import { Download, FolderOpen } from "lucide-react";

interface BpmnToolbarProps {
  onImport: (file: File) => void;
  onExport: () => void;
}

export function BpmnToolbar({ onImport, onExport }: BpmnToolbarProps) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted">
        <FolderOpen size={14} strokeWidth={1.75} />
        Importar BPMN
        <input
          type="file"
          accept=".bpmn,.xml"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <button
        onClick={onExport}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted"
      >
        <Download size={14} strokeWidth={1.75} />
        Exportar
      </button>
    </div>
  );
}
