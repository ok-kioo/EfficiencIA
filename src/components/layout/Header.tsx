import { LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-sm font-medium text-slate-500">
          Plataforma de exploração de cenários organizacionais
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Novo processo
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100">
            <User size={18} className="text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{user?.name}</span>
            <span className="text-xs text-slate-500">{user?.email}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-4 p-2 rounded-lg hover:bg-slate-100 transition text-slate-600 hover:text-red-600"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}