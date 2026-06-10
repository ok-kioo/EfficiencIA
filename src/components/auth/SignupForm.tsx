import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { SignupRequest } from "../../@types/user";

export function SignupForm() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<SignupRequest>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validations, setValidations] = useState({
    passwordLength: false,
    passwordMatch: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validações em tempo real
    if (name === "password") {
      setValidations((prev) => ({
        ...prev,
        passwordLength: value.length >= 8,
        passwordMatch: value === formData.confirmPassword,
      }));
    }

    if (name === "confirmPassword") {
      setValidations((prev) => ({
        ...prev,
        passwordMatch: value === formData.password,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signup(formData);
      navigate({ to: "/" });
    } catch {
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nome Completo
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Seu nome"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Senha */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {validations.passwordLength ? (
            <CheckCircle size={16} className="text-green-600" />
          ) : (
            <CheckCircle size={16} className="text-gray-300" />
          )}
          <span className={validations.passwordLength ? "text-green-600" : "text-gray-600"}>
            Mínimo 8 caracteres
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {formData.confirmPassword && validations.passwordMatch ? (
            <CheckCircle size={16} className="text-green-600" />
          ) : (
            <CheckCircle size={16} className="text-gray-300" />
          )}
          <span className={validations.passwordMatch ? "text-green-600" : "text-gray-600"}>
            Senhas precisam ser iguais
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Cadastrando...
          </>
        ) : (
          "Cadastrar"
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        Já tem uma conta?{" "}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Entre aqui
        </Link>
      </p>
    </form>
  );
}
