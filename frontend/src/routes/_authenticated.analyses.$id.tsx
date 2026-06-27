import { createFileRoute } from "@tanstack/react-router";
import { AnalysisDetailPage } from "../pages/AnalysisDetailPage";

export const Route = createFileRoute("/_authenticated/analyses/$id")({
  head: () => ({
    meta: [
      { title: "Análise — EfficiencIA" },
      { name: "description", content: "Resultado da análise do processo." },
    ],
  }),
  component: AnalysisDetailPage,
  ssr: false,
});
