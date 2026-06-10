import { LogIn } from "lucide-react";
import { LoginForm } from "../components/auth/LoginForm";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <LogIn className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">EfficiencIA</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Bem-vindo de volta
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Entre com suas credenciais para acessar a plataforma
        </p>

        {/* Formulário de Login */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Ao fazer login, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  );
}
