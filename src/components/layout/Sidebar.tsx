import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  GitBranch,
  LayoutDashboard,
  WandSparkles,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Modelagem", path: "/modeler", icon: GitBranch },
  { label: "Análise", path: "/analysis", icon: BarChart3 },
  { label: "Cenários", path: "/scenarios", icon: WandSparkles },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-4 md:block">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900">EfficiencIA</h1>
        <p className="text-sm text-slate-500">Modelagem organizacional</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
