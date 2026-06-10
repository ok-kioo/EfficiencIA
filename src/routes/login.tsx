import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider } from "../contexts/AuthContext";
import { LoginPage } from "../pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — EfficiencIA" },
      { name: "description", content: "Acesse sua conta EfficiencIA." },
    ],
  }),
  component: () => (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  ),
});
