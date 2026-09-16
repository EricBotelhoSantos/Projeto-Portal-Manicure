import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { SkeletonList, EmptyState } from "../components/EmptyState";

interface Form {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  active: boolean;
}

const EMPTY: Form = { name: "", description: "", price: "", durationMinutes: "60", active: true };

export function AdminServicesPage(): JSX.Element {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { id?: string; form: Form }>(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const load = useCallback(async () => {
    try {
      setServices(await api.get<Service[]>("/services"));
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = (): void => setModal({ form: EMPTY });
  const openEdit = (s: Service): void =>
    setModal({
      id: s.id,
      form: {
        name: s.name,
        description: s.description ?? "",
        price: String(s.price),
        durationMinutes: String(s.durationMinutes),
        active: s.active,
      },
    });

  const save = async (): Promise<void> => {
    if (!modal) return;
    const { form, id } = modal;
    if (!form.name.trim() || !form.price || !form.durationMinutes) {
      error("Preencha nome, preço e duração.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: form.price,
        durationMinutes: Number(form.durationMinutes),
        active: form.active,
      };
      if (id) await api.put(`/services/${id}`, payload);
      else await api.post("/services", payload);
      success(id ? "Serviço atualizado." : "Serviço criado.");
      setModal(null);
      await load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao salvar serviço");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s: Service): Promise<void> => {
    try {
      await api.patch(`/services/${s.id}/toggle`);
      success(s.active ? "Serviço desativado." : "Serviço ativado.");
      await load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao alterar status");
    }
  };

  const remove = async (s: Service): Promise<void> => {
    if (!window.confirm(`Excluir "${s.name}"?`)) return;
    try {
      await api.del(`/services/${s.id}`);
      success("Serviço excluído.");
      await load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-10">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Link to="/admin" className="text-sm font-semibold text-primary">‹ Voltar ao painel</Link>
          <h1 className="font-display text-3xl font-bold">Serviços</h1>
        </div>
        <Button onClick={openNew} className="min-h-[44px] px-4 py-2 text-sm">Novo serviço</Button>
      </div>

      {loading ? (
        <SkeletonList rows={3} />
      ) : services.length === 0 ? (
        <EmptyState title="Nenhum serviço cadastrado" hint="Cadastre o primeiro serviço para começar a receber agendamentos." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <article key={s.id} className={`card flex flex-col gap-1.5 ${s.active ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">{s.name}</h2>
                <span className={`chip ${s.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                  {s.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              {s.description && <p className="text-sm text-cocoa-soft">{s.description}</p>}
              <p className="text-sm font-semibold text-primary-dark">
                R$ {Number(s.price).toFixed(2).replace(".", ",")} · {s.durationMinutes} min
              </p>
              <div className="mt-1 flex gap-2">
                <Button variant="secondary" onClick={() => openEdit(s)} className="min-h-[44px] flex-1 py-2 text-sm">Editar</Button>
                <Button variant="secondary" onClick={() => void toggle(s)} className="min-h-[44px] flex-1 py-2 text-sm">
                  {s.active ? "Desativar" : "Ativar"}
                </Button>
                <Button variant="ghost" onClick={() => void remove(s)} className="min-h-[44px] px-3 py-2 text-sm text-red-600">
                  Excluir
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={modal !== null} title={modal?.id ? "Editar serviço" : "Novo serviço"} onClose={() => setModal(null)}>
        {modal && (
          <div className="flex flex-col gap-4">
            <Input label="Nome" value={modal.form.name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, name: e.target.value } })} />
            <div>
              <label className="label" htmlFor="svc-desc">Descrição</label>
              <textarea
                id="svc-desc"
                className="input min-h-[88px] resize-y"
                value={modal.form.description}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, description: e.target.value } })}
                maxLength={500}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Preço (R$)" type="number" min="0" step="0.01" inputMode="decimal" value={modal.form.price} onChange={(e) => setModal({ ...modal, form: { ...modal.form, price: e.target.value } })} />
              <Input label="Duração (min)" type="number" min="5" max="480" inputMode="numeric" value={modal.form.durationMinutes} onChange={(e) => setModal({ ...modal, form: { ...modal.form, durationMinutes: e.target.value } })} />
            </div>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={modal.form.active}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, active: e.target.checked } })}
                className="h-5 w-5 accent-[#C14A6E]"
              />
              Serviço ativo (visível para clientes)
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setModal(null)} className="flex-1" disabled={saving}>Cancelar</Button>
              <Button onClick={save} loading={saving} className="flex-1">Salvar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
