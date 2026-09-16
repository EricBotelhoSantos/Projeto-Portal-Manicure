import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ApiError } from "../lib/api";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError("");
    if (!email || !password) {
      setFormError("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      success(`Bem-vinda, ${user.name.split(" ")[0]}!`);
      navigate(user.role === "ADMIN" ? "/admin" : from, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 401 ? "E-mail ou senha incorretos." : err instanceof Error ? err.message : "Erro ao entrar";
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 pb-24 md:pb-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-cocoa-soft">Acesse sua conta para agendar e acompanhar seus horários.</p>
      </div>
      <form onSubmit={submit} className="card flex flex-col gap-4" noValidate>
        <Input label="E-mail" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Senha" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </p>
        )}
        <Button type="submit" loading={loading}>
          Entrar
        </Button>
        <Link to="/recuperar-senha" className="text-center text-sm font-semibold text-primary">
          Esqueci minha senha
        </Link>
      </form>
      <p className="text-center text-sm text-cocoa-soft">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-primary">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
