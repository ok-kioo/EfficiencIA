export function AnalysisPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Análise do processo
        </h1>
        <p className="text-sm text-slate-500">
          Visualize possíveis gargalos, riscos estruturais e impactos sistêmicos.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Nenhuma análise realizada ainda.
        </p>
      </div>
    </div>
  );
}