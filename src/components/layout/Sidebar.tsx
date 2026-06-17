import { Link, useRouterState } from "@tanstack/react-router";
import { GitBranch, HelpCircle, LayoutDashboard } from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Modelagem", path: "/modeler", icon: GitBranch },
  { label: "Guia", path: "/guia", icon: HelpCircle },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden min-h-screen w-[220px] shrink-0 border-r border-sidebar-border bg-sidebar px-3 py-5 md:block">
      <div className="mb-6 px-2">
        <Link to="/" className="block">
          <h1 className="font-display text-base font-semibold tracking-tight text-foreground">
            EfficiencIA
          </h1>
          <p className="text-[11px] text-muted-foreground">Processos com clareza</p>
        </Link>
      </div>

      <nav className="space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.path ||
            (item.path === "/dashboard" && pathname === "/dashboard/");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition ${
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-0.5 rounded-r bg-accent" />
              )}
              <Icon size={15} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
