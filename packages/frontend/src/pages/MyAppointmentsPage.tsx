import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Appointment } from "../lib/types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { AppointmentCard } from "../components/AppointmentCard";
import { CancelModal } from "../components/CancelModal";
import { SkeletonList, EmptyState } from "../components/EmptyState";
import { startOfDay } from "date-fns";

export function MyAppointmentsPage(): JSX.Element {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { success, error } = useToast();

  const load = useCallback(async () => {
    try {
      setAppointments(await api.get<Appointment[]>("/appointments/my-appointments"));
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (reason: string): Promise<void> => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.post(`/appointments/my-appointments/${cancelId}/cancel`, { reason });
      success("Agendamento cancelado. O horário foi liberado.");
      setCancelId(null);
      await load();
    } catch (e) {
      error(e instanceof Error ? e.message : "Não foi possível cancelar");
    } finally {
      setCancelling(false);
    }
  };

  const today = startOfDay(new Date());
  const upcoming = appointments.filter(
    (a) => (a.status === "PENDING" || a.status === "CONFIRMED") && new Date(a.date) >= today
  );
  const past = appointments.filter(
    (a) => !((a.status === "PENDING" || a.status === "CONFIRMED") && new Date(a.date) >= today)
  );

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Meus agendamentos</h1>
        <p className="text-sm text-cocoa-soft">Acompanhe, confirme e cancele seus horários.</p>
      </div>

      {loading ? (
        <SkeletonList rows={3} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="Você ainda não possui agendamentos."
          hint="Escolha um serviço e reserve seu horário em menos de 1 minuto."
          action={
            <Link to="/agendar" className="btn-primary mt-3 min-h-[44px] py-2 text-sm">
              Agendar horário
            </Link>
          }
        />
      ) : (
        <>
          <section aria-label="Próximos agendamentos" className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">Próximos ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-cocoa-soft">Nenhum agendamento futuro.</p>
            ) : (
              upcoming.map((a) => (
                <AppointmentCard key={a.id} appointment={a}>
                  <div className="mt-1 flex gap-2">
                    <Button variant="secondary" onClick={() => setCancelId(a.id)} className="min-h-[44px] flex-1 py-2 text-sm">
                      Cancelar agendamento
                    </Button>
                  </div>
                </AppointmentCard>
              ))
            )}
          </section>

          {past.length > 0 && (
            <section aria-label="Histórico" className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold">Histórico</h2>
              {past.map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))}
            </section>
          )}
        </>
      )}

      <CancelModal open={cancelId !== null} loading={cancelling} onClose={() => setCancelId(null)} onConfirm={cancel} />
    </div>
  );
}
