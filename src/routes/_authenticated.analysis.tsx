import { createFileRoute } from "@tanstack/react-router";
import { AnalysisPage } from "../pages/AnalysisPage";

export const Route = createFileRoute("/_authenticated/analysis")({
  head: () => ({
    meta: [
      { title: "Análise — EfficiencIA" },
      { name: "description", content: "Analise estruturalmente seus processos." },
    ],
  }),
  component: AnalysisPage,
});
