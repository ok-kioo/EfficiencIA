import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { isAuthenticated, isHydrating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isHydrating, isAuthenticated, navigate]);

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
