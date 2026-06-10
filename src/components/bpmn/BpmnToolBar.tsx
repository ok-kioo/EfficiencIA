import { Download, FolderOpen, Save } from "lucide-react";

interface BpmnToolbarProps {
  onImport: (file: File) => void;
  onExport: () => void;
  onSave: () => void;
}

export function BpmnToolbar({ onImport, onExport, onSave }: BpmnToolbarProps) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onImport(file);
    }

    event.target.value = "";
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <FolderOpen size={16} />
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Download size={16} />
        Exportar
      </button>

      <button
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        <Save size={16} />
        Salvar processo
      </button>
    </div>
  );
}