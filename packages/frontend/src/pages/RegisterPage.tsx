import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !email.trim() || password.length < 6) {
      setFormError("Preencha nome, e-mail válido e senha com pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, password });
      success(`Conta criada. Bem-vinda, ${user.name.split(" ")[0]}!`);
      navigate(user.role === "ADMIN" ? "/admin" : "/agendar", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta";
      setFormError(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 pb-24 md:pb-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Criar conta</h1>
        <p className="mt-1 text-sm text-cocoa-soft">Leva menos de 1 minuto para começar a agendar.</p>
      </div>
      <form onSubmit={submit} className="card flex flex-col gap-4" noValidate>
        <Input label="Nome completo" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Telefone / WhatsApp" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
        <Input label="E-mail" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Senha" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} helper="Mínimo de 6 caracteres" required />
        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </p>
        )}
        <Button type="submit" loading={loading}>
          Criar conta
        </Button>
      </form>
      <p className="text-center text-sm text-cocoa-soft">
        Já tem conta?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}
