import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider } from "../contexts/AuthContext";
import { SignupPage } from "../pages/SignupPage";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Cadastro — EfficiencIA" },
      { name: "description", content: "Crie sua conta EfficiencIA." },
    ],
  }),
  component: () => (
    <AuthProvider>
      <SignupPage />
    </AuthProvider>
  ),
});
