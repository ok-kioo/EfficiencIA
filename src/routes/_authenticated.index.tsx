import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "../pages/DashboardPage";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EfficiencIA" },
      { name: "description", content: "Visão geral dos processos e cenários organizacionais." },
    ],
  }),
  component: DashboardPage,
});
