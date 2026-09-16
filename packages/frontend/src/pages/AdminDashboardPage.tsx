import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Appointment, DashboardData } from "../lib/types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { AppointmentCard } from "../components/AppointmentCard";
import { Modal } from "../components/Modal";
import { SkeletonList, EmptyState } from "../components/EmptyState";
import { format } from "date-fns";

type Tab = "today" | "upcoming" | "all";

export function AdminDashboardPage(): JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("today");
  const [byDate, setByDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dateList, setDateList] = useState<Appointment[]>([]);
  const [loadingDate, setLoadingDate] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [acting, setActing] = useState(false);
  const { success, error } = useToast();

  const load = useCallback(async () => {
    try {
      setData(await api.get<DashboardData>("/admin/dashboard"));
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao carregar painel");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setLoadingDate(true);
    api
      .get<Appointment[]>(`/admin/appointments/by-date?date=${byDate}`)
      .then(setDateList)
      .catch(() => setDateList([]))
      .finally(() => setLoadingDate(false));
  }, [byDate]);

  const act = async (fn: () => Promise<unknown>, okMsg: string): Promise<void> => {
    setActing(true);
    try {
      await fn();
      success(okMsg);
      setCancelId(null);
      setCancelReason("");
      await load();
      setDateList(await api.get<Appointment[]>(`/admin/appointments/by-date?date=${byDate}`));
    } catch (e) {
      error(e instanceof Error ? e.message : "Operação falhou");
    } finally {
      setActing(false);
    }
  };

  const list: Appointment[] =
    tab === "today" ? (data?.todayAppointments ?? []) : tab === "upcoming" ? (data?.upcoming ?? []) : (data?.future ?? []);
  const stats = data?.stats;

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold">Painel da manicure</h1>
          <p className="text-sm text-cocoa-soft">Gerencie agendamentos, serviços e horários.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/calendario" className="btn-secondary min-h-[44px] py-2 text-sm">Calendário</Link>
          <Link to="/admin/servicos" className="btn-secondary min-h-[44px] py-2 text-sm">Serviços</Link>
          <Link to="/admin/horarios" className="btn-secondary min-h-[44px] py-2 text-sm">Horários</Link>
        </div>
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : (
        <>
          <section aria-label="Resumo" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              ["Hoje", stats?.todayTotal ?? 0],
              ["Pendentes", stats?.pending ?? 0],
              ["Confirmados", stats?.confirmed ?? 0],
              ["Cancelados", stats?.cancelled ?? 0],
              ["Concluídos", stats?.completed ?? 0],
            ].map(([label, value]) => (
              <div key={label as string} className="card px-4 py-3 text-center">
                <p className="font-display text-2xl font-bold text-primary-dark">{value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-soft">{label}</p>
              </div>
            ))}
          </section>

          <section aria-label="Por data" className="card flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="label" htmlFor="admin-date">Ver agendamentos de um dia</label>
              <input id="admin-date" type="date" className="input" value={byDate} onChange={(e) => setByDate(e.target.value)} />
            </div>
            <div className="flex gap-1 rounded-xl bg-cream p-1" role="tablist" aria-label="Visão">
              {([["today", "Hoje"], ["upcoming", "Próximos"], ["all", "Todos"]] as [Tab, string][]).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`min-h-[44px] flex-1 cursor-pointer rounded-lg px-4 text-sm font-semibold transition sm:flex-none ${
                    tab === t ? "bg-white text-primary shadow-card" : "text-cocoa-soft"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Agendamentos do dia selecionado" className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">Dia {byDate.split("-").reverse().join("/")}</h2>
            {loadingDate ? (
              <SkeletonList rows={2} />
            ) : dateList.length === 0 ? (
              <EmptyState title="Nenhum agendamento neste dia" hint="Aproveite para organizar o espaço ou abrir a agenda." />
            ) : (
              dateList.map((a) => (
                <AppointmentCard key={a.id} appointment={a}>
                  <p className="text-sm text-cocoa-soft">
                    Cliente: <strong className="text-cocoa">{a.client?.name}</strong>
                    {a.client?.phone ? ` · ${a.client.phone}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {a.status === "PENDING" && (
                      <Button onClick={() => void act(() => api.put(`/admin/appointments/${a.id}/confirm`), "Agendamento confirmado.")} disabled={acting} className="min-h-[44px] flex-1 py-2 text-sm">
                        Confirmar
                      </Button>
                    )}
                    {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                      <>
                        <Button variant="secondary" onClick={() => void act(() => api.put(`/admin/appointments/${a.id}/complete`), "Atendimento concluído.")} disabled={acting} className="min-h-[44px] flex-1 py-2 text-sm">
                          Concluir
                        </Button>
                        <Button variant="danger" onClick={() => setCancelId(a.id)} disabled={acting} className="min-h-[44px] flex-1 py-2 text-sm">
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </AppointmentCard>
              ))
            )}
          </section>

          <section aria-label={tab === "today" ? "Agendamentos de hoje" : tab === "upcoming" ? "Próximos agendamentos" : "Todos os próximos"} className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">
              {tab === "today" ? "Agendamentos de hoje" : tab === "upcoming" ? "Próximos agendamentos" : "Agenda futura"}
            </h2>
            {list.length === 0 ? (
              <EmptyState title="Nada por aqui" hint="Novos agendamentos das clientes aparecem automaticamente." />
            ) : (
              list.slice(0, 20).map((a) => (
                <AppointmentCard key={a.id} appointment={a}>
                  <p className="text-sm text-cocoa-soft">
                    Cliente: <strong className="text-cocoa">{a.client?.name}</strong>
                    {a.client?.phone ? ` · ${a.client.phone}` : ""}
                  </p>
                </AppointmentCard>
              ))
            )}
          </section>
        </>
      )}

      <Modal open={cancelId !== null} title="Cancelar agendamento" onClose={() => setCancelId(null)}>
        <label className="label" htmlFor="admin-cancel-reason">Motivo do cancelamento (obrigatório)</label>
        <textarea
          id="admin-cancel-reason"
          className="input min-h-[88px] resize-y"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Ex.: imprevisto no salão, manutenção, feriado…"
          maxLength={300}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={() => setCancelId(null)} className="flex-1" disabled={acting}>
            Voltar
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={!cancelReason.trim()}
            loading={acting}
            onClick={() => {
              if (cancelId) void act(() => api.post(`/admin/appointments/${cancelId}/cancel`, { reason: cancelReason.trim() }), "Agendamento cancelado e cliente notificada.");
            }}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
