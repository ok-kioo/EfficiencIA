import { createFileRoute } from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../contexts/AuthContext";
import { SignupPage } from "../pages/SignupPage";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cadastro — EfficiencIA" },
      { name: "description", content: "Crie sua conta EfficiencIA." },
    ],
  }),
  component: () => {
    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";
    const content = (
      <AuthProvider>
        <SignupPage />
      </AuthProvider>
    );
    return clientId ? (
      <GoogleOAuthProvider clientId={clientId}>{content}</GoogleOAuthProvider>
    ) : (
      content
    );
  },
});
