import { createFileRoute } from "@tanstack/react-router";
import { ProjectAnalysesPage } from "../pages/ProjectAnalysesPage";

export const Route = createFileRoute("/_authenticated/projects/$id/analyses")({
  head: () => ({
    meta: [
      { title: "Análises do projeto — EfficiencIA" },
      { name: "description", content: "Histórico de análises do projeto." },
    ],
  }),
  component: ProjectAnalysesPage,
  ssr: false,
});
