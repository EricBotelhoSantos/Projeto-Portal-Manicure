import { STATUS_LABEL, type AppointmentStatus } from "../lib/types";

const STYLES: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED_CLIENT: "bg-red-100 text-red-700",
  CANCELLED_ADMIN: "bg-red-100 text-red-700",
  COMPLETED: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: AppointmentStatus }): JSX.Element {
  return <span className={`chip ${STYLES[status]}`}>{STATUS_LABEL[status]}</span>;
}
