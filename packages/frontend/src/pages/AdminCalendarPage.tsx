import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Appointment } from "../lib/types";
import { useToast } from "../context/ToastContext";
import { AppointmentCard } from "../components/AppointmentCard";
import { SkeletonList, EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type View = "day" | "week" | "month";

export function AdminCalendarPage(): JSX.Element {
  const [view, setView] = useState<View>("day");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    setLoading(true);
    const load = async (): Promise<void> => {
      try {
        if (view === "day") {
          setItems(await api.get<Appointment[]>(`/admin/appointments/by-date?date=${date}`));
        } else {
          const data = await api.get<{ appointments: Appointment[]; blockedSlots: unknown[]; availabilities: unknown[] }>(
            `/admin/calendar-availability?year=${date.slice(0, 4)}&month=${Number(date.slice(5, 7))}`
          );
          const all = data.appointments;
          if (view === "week") {
            const start = new Date(`${date}T12:00:00`);
            const dow = start.getDay();
            const sunday = new Date(start);
            sunday.setDate(start.getDate() - dow);
            const saturday = new Date(sunday);
            saturday.setDate(sunday.getDate() + 6);
            setItems(all.filter((a) => {
              const d = new Date(a.date);
              return d >= new Date(sunday.toDateString()) && d <= new Date(`${saturday.toISOString().slice(0, 10)}T23:59:59`);
            }));
          } else {
            setItems(all);
          }
        }
      } catch (e) {
        error(e instanceof Error ? e.message : "Erro ao carregar calendário");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [view, date, error]);

  const grouped = new Map<string, Appointment[]>();
  for (const a of items) {
    const key = a.date.slice(0, 10);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(a);
  }
  const keys = [...grouped.keys()].sort();

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-10">
      <div>
        <Link to="/admin" className="text-sm font-semibold text-primary">‹ Voltar ao painel</Link>
        <h1 className="font-display text-3xl font-bold">Calendário</h1>
      </div>

      <div className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="cal-date">Referência</label>
          <input id="cal-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex gap-1 rounded-xl bg-cream p-1" role="tablist" aria-label="Visualização">
          {([["day", "Dia"], ["week", "Semana"], ["month", "Mês"]] as [View, string][]).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`min-h-[44px] flex-1 cursor-pointer rounded-lg px-5 text-sm font-semibold transition ${
                view === v ? "bg-white text-primary shadow-card" : "text-cocoa-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonList rows={3} />
      ) : keys.length === 0 ? (
        <EmptyState title="Nenhum agendamento no período" hint="A agenda está livre por aqui." />
      ) : (
        keys.map((key) => {
          const dayItems = grouped.get(key) ?? [];
          const label = format(new Date(`${key}T12:00:00`), "EEEE, dd 'de' MMMM", { locale: ptBR });
          return (
            <section key={key} aria-label={label} className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-semibold capitalize">
                {label} <span className="text-sm font-sans font-semibold text-cocoa-soft">({dayItems.length})</span>
              </h2>
              {dayItems.map((a) => (
                <AppointmentCard key={a.id} appointment={a}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cocoa-soft">
                      <strong className="text-cocoa">{a.client?.name}</strong>
                      {a.client?.phone ? ` · ${a.client.phone}` : ""}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                </AppointmentCard>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
