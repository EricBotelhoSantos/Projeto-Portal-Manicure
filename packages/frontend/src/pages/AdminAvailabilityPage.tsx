import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { DAY_FULL, type Availability, type BlockedSlot } from "../lib/types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { SkeletonList, EmptyState } from "../components/EmptyState";

interface DayForm {
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  active: boolean;
}

export function AdminAvailabilityPage(): JSX.Element {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [forms, setForms] = useState<Record<number, DayForm>>({});
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);
  const { success, error } = useToast();

  const load = useCallback(async () => {
    try {
      const [av, bl] = await Promise.all([
        api.get<Availability[]>("/admin/availability"),
        api.get<BlockedSlot[]>("/admin/blocked-slots"),
      ]);
      setAvailability(av);
      const next: Record<number, DayForm> = {};
      for (let d = 0; d <= 6; d++) {
        const found = av.find((a) => a.dayOfWeek === d);
        next[d] = {
          startTime: found?.startTime ?? "08:00",
          endTime: found?.endTime ?? "18:00",
          breakStart: found?.breakStart ?? "12:00",
          breakEnd: found?.breakEnd ?? "13:00",
          active: found ? found.active : d !== 0,
        };
      }
      setForms(next);
      setBlocks(bl);
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveDay = async (day: number): Promise<void> => {
    const f = forms[day];
    if (!f) return;
    setSavingDay(day);
    try {
      await api.post("/admin/availability", {
        dayOfWeek: day,
        startTime: f.startTime,
        endTime: f.endTime,
        breakStart: f.breakStart || null,
        breakEnd: f.breakEnd || null,
        active: f.active,
      });
      success(`${DAY_FULL[day]} atualizado.`);
      await load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSavingDay(null);
    }
  };

  const addBlock = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!blockDate || !blockStart || !blockEnd) {
      error("Informe data, início e fim do bloqueio.");
      return;
    }
    setBlocking(true);
    try {
      await api.post("/admin/blocked-slots", {
        date: blockDate,
        startTime: blockStart,
        endTime: blockEnd,
        reason: blockReason.trim() || undefined,
      });
      success("Horário bloqueado.");
      setBlockDate("");
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
      await load();
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao bloquear");
    } finally {
      setBlocking(false);
    }
  };

  const removeBlock = async (id: string): Promise<void> => {
    if (!window.confirm("Remover este bloqueio?")) return;
    try {
      await api.del(`/admin/blocked-slots/${id}`);
      success("Bloqueio removido.");
      await load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao remover");
    }
  };

  void availability;

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-10">
      <div>
        <Link to="/admin" className="text-sm font-semibold text-primary">‹ Voltar ao painel</Link>
        <h1 className="font-display text-3xl font-bold">Dias e horários</h1>
        <p className="text-sm text-cocoa-soft">Configure o funcionamento semanal e bloqueie datas específicas.</p>
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : (
        <section aria-label="Funcionamento semanal" className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold">Funcionamento semanal</h2>
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const f = forms[day];
            if (!f) return null;
            return (
              <div key={day} className="card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">{DAY_FULL[day]}</p>
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={f.active}
                      onChange={(e) => setForms({ ...forms, [day]: { ...f, active: e.target.checked } })}
                      className="h-5 w-5 accent-[#C14A6E]"
                    />
                    Atende
                  </label>
                </div>
                {f.active && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Abertura" type="time" value={f.startTime} onChange={(e) => setForms({ ...forms, [day]: { ...f, startTime: e.target.value } })} />
                      <Input label="Fechamento" type="time" value={f.endTime} onChange={(e) => setForms({ ...forms, [day]: { ...f, endTime: e.target.value } })} />
                      <Input label="Intervalo início" type="time" value={f.breakStart} onChange={(e) => setForms({ ...forms, [day]: { ...f, breakStart: e.target.value } })} />
                      <Input label="Intervalo fim" type="time" value={f.breakEnd} onChange={(e) => setForms({ ...forms, [day]: { ...f, breakEnd: e.target.value } })} />
                    </div>
                  </>
                )}
                <Button onClick={() => void saveDay(day)} loading={savingDay === day} className="min-h-[44px] py-2 text-sm">
                  Salvar {DAY_FULL[day]}
                </Button>
              </div>
            );
          })}
        </section>
      )}

      <section aria-label="Bloqueios" className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Bloquear data / horário</h2>
        <form onSubmit={addBlock} className="card flex flex-col gap-3">
          <Input label="Data" type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Início" type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} />
            <Input label="Fim" type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
          </div>
          <Input label="Motivo (opcional)" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Ex.: feriado, curso, folga" />
          <Button type="submit" loading={blocking}>Bloquear horário</Button>
        </form>

        {blocks.length === 0 ? (
          <EmptyState title="Nenhum bloqueio" hint="Bloqueios impedem novos agendamentos no período." />
        ) : (
          <div className="flex flex-col gap-2">
            {blocks.map((b) => (
              <div key={b.id} className="card flex items-center justify-between gap-3 py-3">
                <div className="text-sm">
                  <p className="font-semibold">{b.date.slice(0, 10).split("-").reverse().join("/")} · {b.startTime}–{b.endTime}</p>
                  {b.reason && <p className="text-cocoa-soft">{b.reason}</p>}
                </div>
                <Button variant="ghost" onClick={() => void removeBlock(b.id)} className="min-h-[44px] px-3 text-sm text-red-600">
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
