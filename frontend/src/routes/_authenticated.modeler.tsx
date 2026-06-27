import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ModelerPage } from "../pages/ModelerPage";

const modelerSearchSchema = z.object({
  projectId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/modeler")({
  head: () => ({
    meta: [
      { title: "Modelagem BPMN — EfficiencIA" },
      { name: "description", content: "Modele processos organizacionais em BPMN." },
    ],
  }),
  validateSearch: modelerSearchSchema,
  component: ModelerPage,
  ssr: false,
});
