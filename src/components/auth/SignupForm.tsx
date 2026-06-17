import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { SignupRequest } from "../../@types/user";
import { GoogleButton } from "./GoogleButton";

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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setValidations((prev) => ({
        ...prev,
        passwordLength: value.length >= 8,
        passwordMatch: value === formData.confirmPassword,
      }));
    }
    if (name === "confirmPassword") {
      setValidations((prev) => ({ ...prev, passwordMatch: value === formData.password }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate({ to: "/dashboard" });
    } catch {
      /* erro tratado no contexto */
    }
  };

  const isFormValid =
    formData.name && formData.email && formData.password && formData.confirmPassword;

  const inputClass =
    "h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className={labelClass}>Nome completo</label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} strokeWidth={1.75} />
          <input id="name" name="name" type="text" placeholder="Seu nome" value={formData.name} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} strokeWidth={1.75} />
          <input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={16} strokeWidth={1.75} />
          <input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
          <CheckCircle size={12} className={validations.passwordLength ? "text-primary" : "text-muted-foreground/40"} />
          <span className={validations.passwordLength ? "text-primary" : "text-muted-foreground"}>
            Mínimo 8 caracteres
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>Confirmar senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={16} strokeWidth={1.75} />
          <input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
          <CheckCircle size={12} className={formData.confirmPassword && validations.passwordMatch ? "text-primary" : "text-muted-foreground/40"} />
          <span className={validations.passwordMatch ? "text-primary" : "text-muted-foreground"}>
            Senhas precisam ser iguais
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={14} strokeWidth={1.75} />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary-deep disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader size={14} className="animate-spin" />
            Cadastrando…
          </>
        ) : (
          "Cadastrar"
        )}
      </button>

      <GoogleButton />

      <p className="text-center text-xs text-muted-foreground">
        Já tem uma conta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Entre aqui
        </Link>
      </p>
    </form>
  );
}
