import { createFileRoute } from "@tanstack/react-router";
import { ModelerPage } from "../pages/ModelerPage";

export const Route = createFileRoute("/_authenticated/modeler")({
  head: () => ({
    meta: [
      { title: "Modelagem BPMN — EfficiencIA" },
      { name: "description", content: "Modele processos organizacionais em BPMN." },
    ],
  }),
  component: ModelerPage,
  ssr: false,
});
