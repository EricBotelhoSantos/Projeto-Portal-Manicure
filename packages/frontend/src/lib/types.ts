export type Role = "CLIENT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  image: string | null;
  active: boolean;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED_CLIENT"
  | "CANCELLED_ADMIN"
  | "COMPLETED";

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  photoUrl: string | null;
  status: AppointmentStatus;
  cancellationReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  client?: User;
  service?: Service;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface CalendarDay {
  date: string;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  disabled: boolean;
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  active: boolean;
}

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface DashboardData {
  todayAppointments: Appointment[];
  upcoming: Appointment[];
  future: Appointment[];
  stats: {
    todayTotal: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
}

export const CANCEL_REASONS = [
  "Imprevisto",
  "Compromisso",
  "Problema pessoal",
  "Preciso remarcar",
  "Não poderei comparecer",
  "Outro",
] as const;

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED_CLIENT: "Cancelado pela cliente",
  CANCELLED_ADMIN: "Cancelado",
  COMPLETED: "Concluído",
};

export const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DAY_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
