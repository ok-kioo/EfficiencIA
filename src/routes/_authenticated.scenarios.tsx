import { createFileRoute } from "@tanstack/react-router";
import { ScenariosPage } from "../pages/ScenariosPage";

export const Route = createFileRoute("/_authenticated/scenarios")({
  head: () => ({
    meta: [
      { title: "Cenários — EfficiencIA" },
      { name: "description", content: "Explore cenários alternativos com IA." },
    ],
  }),
  component: ScenariosPage,
});
