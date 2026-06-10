import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "../contexts/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AuthProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AuthProvider>
  );
}
