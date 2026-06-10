import { Link } from "@tanstack/react-router";
import { BarChart3, GitBranch, WandSparkles } from "lucide-react";

export function DashboardPage() {
  return (
    <div>
      <section className="mb-8 rounded-2xl bg-slate-900 p-8 text-white">
        <h1 className="mb-2 text-3xl font-bold">
          Explore cenários organizacionais antes da execução
        </h1>

        <p className="max-w-2xl text-slate-300">
          Modele processos, informe dados operacionais e receba análises
          inteligentes sobre possíveis gargalos, riscos e alternativas.
        </p>

        <Link
          to="/modeler"
          className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Criar novo processo
        </Link>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <GitBranch className="mb-4" />
          <h2 className="mb-2 font-semibold">Modelagem BPMN</h2>
          <p className="text-sm text-slate-500">
            Desenhe ou importe fluxos organizacionais para análise.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <BarChart3 className="mb-4" />
          <h2 className="mb-2 font-semibold">Análise estrutural</h2>
          <p className="text-sm text-slate-500">
            Identifique padrões que podem gerar gargalos e baixa eficiência.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <WandSparkles className="mb-4" />
          <h2 className="mb-2 font-semibold">Exploração com IA</h2>
          <p className="text-sm text-slate-500">
            Gere hipóteses, explicações e cenários alternativos com apoio de IA.
          </p>
        </div>
      </div>
    </div>
  );
}