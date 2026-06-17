import { createFileRoute } from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";
    const content = (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    return clientId ? (
      <GoogleOAuthProvider clientId={clientId}>{content}</GoogleOAuthProvider>
    ) : (
      content
    );
  },
});
