import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function ForgotPasswordPage(): JSX.Element {
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
      success("Se o e-mail estiver cadastrado, enviaremos as instruções.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao solicitar recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 pb-24 md:pb-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Recuperar senha</h1>
        <p className="mt-1 text-sm text-cocoa-soft">Informe seu e-mail para receber as instruções.</p>
      </div>
      {sent ? (
        <div className="card text-center">
          <p className="font-semibold">Verifique sua caixa de entrada.</p>
          <p className="mt-1 text-sm text-cocoa-soft">Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir sua senha.</p>
          <Link to="/login" className="btn-primary mt-4 w-full">
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="card flex flex-col gap-4" noValidate>
          <Input label="E-mail" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" loading={loading}>
            Enviar instruções
          </Button>
          <Link to="/login" className="text-center text-sm font-semibold text-primary">
            Voltar ao login
          </Link>
        </form>
      )}
    </div>
  );
}
