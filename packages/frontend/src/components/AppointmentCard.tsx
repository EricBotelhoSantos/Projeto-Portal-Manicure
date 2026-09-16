import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

function fmtDate(iso: string): string {
  return format(new Date(iso), "EEEE, dd 'de' MMMM", { locale: ptBR });
}

function fmtTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function AppointmentCard({
  appointment,
  children,
}: {
  appointment: Appointment;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <article className="card flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug">
            {appointment.service?.name ?? "Serviço"}
          </h3>
          <p className="text-sm capitalize text-cocoa-soft">{fmtDate(appointment.date)}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cocoa-soft">
        <span className="font-semibold text-cocoa">
          {fmtTime(appointment.startTime)} – {fmtTime(appointment.endTime)}
        </span>
        {appointment.service && (
          <span>
            R$ {Number(appointment.service.price).toFixed(2).replace(".", ",")} · {appointment.service.durationMinutes} min
          </span>
        )}
      </div>
      {appointment.notes && (
        <p className="rounded-xl bg-cream px-3 py-2 text-sm text-cocoa-soft">
          <span className="font-semibold text-cocoa">Observação: </span>
          {appointment.notes}
        </p>
      )}
      {appointment.cancellationReason && (
        <p className="text-xs text-cocoa-soft">Motivo: {appointment.cancellationReason}</p>
      )}
      {children}
    </article>
  );
}
