import { UserPlus } from "lucide-react";
import { SignupForm } from "../components/auth/SignupForm";

export function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <UserPlus className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">EfficiencIA</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Crie sua conta
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Comece a usar EfficiencIA para otimizar seus processos de negócio
        </p>

        {/* Formulário de Cadastro */}
        <SignupForm />

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  );
}
