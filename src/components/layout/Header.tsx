import { HelpCircle, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="flex h-[52px] items-center justify-between border-b border-border bg-background px-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Mapeie e melhore seus processos
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/ajuda"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title="Ver a página de ajuda"
        >
          <HelpCircle size={14} strokeWidth={1.75} />
          Ajuda
        </Link>

        <div className="flex items-center gap-2.5 border-l border-border pl-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={14} strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[12px] font-medium text-foreground">{user?.name}</span>
            <span className="text-[10px] text-muted-foreground">{user?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive"
            title="Sair"
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
