import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider } from "../contexts/AuthContext";
import { LoginPage } from "../pages/LoginPage";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — EfficiencIA" },
      { name: "description", content: "Acesse sua conta EfficiencIA." },
    ],
  }),
  component: () => {
    const content = (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    return content
  }
});
