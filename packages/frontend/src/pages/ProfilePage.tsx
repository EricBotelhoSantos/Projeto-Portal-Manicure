import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function ProfilePage(): JSX.Element {
  const { user, refresh, logout } = useAuth();
  const { success, error } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/profile", { name: name.trim(), phone: phone.trim(), email: email.trim() });
      await refresh();
      success("Perfil atualizado.");
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 pb-24 md:pb-10">
      <h1 className="font-display text-3xl font-bold">Meu perfil</h1>
      <form onSubmit={save} className="card flex flex-col gap-4" noValidate>
        <Input label="Nome" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Telefone" name="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="E-mail" name="email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" loading={saving}>
          Salvar alterações
        </Button>
      </form>
      <Button variant="secondary" onClick={logout}>
        Sair da conta
      </Button>
    </div>
  );
}
