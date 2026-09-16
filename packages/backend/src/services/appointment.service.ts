import { PrismaClient, AppointmentStatus, Service } from "@prisma/client";
import prisma from "../config/prisma";
import {
  startOfDay,
  format,
  addMinutes,
  getDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

void PrismaClient;

interface CreateAppointmentInput {
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  notes?: string;
  photoUrl?: string;
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

function parseToDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export async function getAvailableServices(): Promise<Service[]> {
  return prisma.service.findMany({ where: { active: true }, orderBy: { price: "asc" } });
}

async function hasOverlap(date: Date, start: Date, end: Date): Promise<boolean> {
  const existing = await prisma.appointment.findFirst({
    where: {
      date,
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
  });
  return !!existing;
}

async function isBlocked(date: Date, startMin: number, endMin: number): Promise<boolean> {
  const blocks = await prisma.blockedSlot.findMany({ where: { date } });
  return blocks.some((b) => {
    const bs = toMinutes(b.startTime);
    const be = toMinutes(b.endTime);
    return startMin < be && endMin > bs;
  });
}

export async function checkSlotAvailability(
  date: string,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  const appointmentDate = parseToDate(date);
  const start = combineDateAndTime(date, startTime);
  const end = addMinutes(start, durationMinutes);
  const startMin = toMinutes(startTime);
  const endMin = startMin + durationMinutes;

  if (await hasOverlap(appointmentDate, start, end)) return false;
  if (await isBlocked(appointmentDate, startMin, endMin)) return false;
  return true;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<unknown> {
  const { clientId, serviceId, date, startTime, notes, photoUrl } = input;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) throw new Error("Serviço não encontrado ou inativo");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Data inválida");
  if (!/^\d{2}:\d{2}$/.test(startTime)) throw new Error("Horário inválido");

  const appointmentDate = parseToDate(date);
  if (appointmentDate < startOfDay(new Date())) throw new Error("Não é possível agendar em datas passadas");

  const startDateTime = combineDateAndTime(date, startTime);
  const endDateTime = addMinutes(startDateTime, service.durationMinutes);

  // Garante que o serviço termina no mesmo dia
  if (format(endDateTime, "yyyy-MM-dd") !== date) throw new Error("Horário sem espaço suficiente para concluir o serviço");

  // Valida contra horário de funcionamento + intervalo
  const dayOfWeek = getDay(appointmentDate);
  const availability = await prisma.availability.findFirst({ where: { dayOfWeek, active: true } });
  if (!availability) throw new Error("Data sem atendimento");
  const sMin = toMinutes(startTime);
  const eMin = sMin + service.durationMinutes;
  if (sMin < toMinutes(availability.startTime) || eMin > toMinutes(availability.endTime)) {
    throw new Error("Horário fora do funcionamento");
  }
  if (availability.breakStart && availability.breakEnd) {
    const bs = toMinutes(availability.breakStart);
    const be = toMinutes(availability.breakEnd);
    if (sMin < be && eMin > bs) throw new Error("Horário conflita com o intervalo");
  }

  return prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        date: appointmentDate,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        AND: [{ startTime: { lt: endDateTime } }, { endTime: { gt: startDateTime } }],
      },
    });
    if (conflict) throw new Error("Conflito de horário detectado. Por favor, escolha outro horário.");

    const blocks = await tx.blockedSlot.findMany({ where: { date: appointmentDate } });
    if (blocks.some((b) => sMin < toMinutes(b.endTime) && eMin > toMinutes(b.startTime))) {
      throw new Error("Horário bloqueado pela manicure");
    }

    const appointment = await tx.appointment.create({
      data: {
        clientId,
        serviceId,
        date: appointmentDate,
        startTime: startDateTime,
        endTime: endDateTime,
        notes,
        photoUrl,
        status: AppointmentStatus.PENDING,
      },
      include: { client: true, service: true },
    });

    await tx.notification.create({
      data: {
        userId: clientId,
        title: "Solicitação enviada!",
        message: `Aguarde a confirmação da manicure para ${service.name}.`,
        type: "APPOINTMENT_NEW",
        link: `/meus-agendamentos`,
      },
    });

    const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          title: "Novo agendamento",
          message: `${appointment.client.name} agendou ${service.name} para ${format(appointmentDate, "dd/MM/yyyy")} às ${startTime}.`,
          type: "APPOINTMENT_NEW",
          link: `/admin`,
        },
      });
    }

    return appointment;
  });
}

export async function getClientAppointments(clientId: string): Promise<unknown[]> {
  return prisma.appointment.findMany({
    where: { clientId },
    include: { service: true },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });
}

export async function getAppointmentById(id: string, userId: string, role: string): Promise<unknown | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { client: true, service: true },
  });
  if (!appointment) return null;
  if (role === "CLIENT" && appointment.clientId !== userId) return null;
  return appointment;
}

export async function cancelAppointmentByClient(
  appointmentId: string,
  clientId: string,
  reason: string,
  customReason?: string
): Promise<unknown> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: true, service: true },
  });
  if (!appointment || appointment.clientId !== clientId) throw new Error("Agendamento não encontrado");
  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    throw new Error("Este agendamento não pode ser cancelado");
  }
  const finalReason = reason === "Outro" && customReason ? customReason : reason;
  if (!finalReason) throw new Error("Motivo do cancelamento é obrigatório");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED_CLIENT",
        cancellationReason: finalReason,
        cancelledBy: "CLIENT",
        cancelledAt: new Date(),
      },
    });

    const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          title: "Cliente cancelou agendamento",
          message: `${appointment.client.name} cancelou ${appointment.service.name} (${finalReason}).`,
          type: "APPOINTMENT_CANCELLED",
          link: `/admin`,
        },
      });
    }
    await tx.notification.create({
      data: {
        userId: clientId,
        title: "Agendamento cancelado",
        message: `Seu agendamento de ${appointment.service.name} foi cancelado.`,
        type: "APPOINTMENT_CANCELLED",
        link: `/meus-agendamentos`,
      },
    });
    return updated;
  });
}

export async function cancelAppointmentByAdmin(appointmentId: string, reason: string): Promise<unknown> {
  if (!reason) throw new Error("Motivo do cancelamento é obrigatório");
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: true, service: true },
  });
  if (!appointment) throw new Error("Agendamento não encontrado");
  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    throw new Error("Este agendamento não pode ser cancelado");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED_ADMIN",
        cancellationReason: reason,
        cancelledBy: "ADMIN",
        cancelledAt: new Date(),
      },
    });
    await tx.notification.create({
      data: {
        userId: appointment.clientId,
        title: "Agendamento cancelado",
        message: `Sua reserva de ${appointment.service.name} foi cancelada pela manicure. Motivo: ${reason}`,
        type: "APPOINTMENT_CANCELLED",
        link: `/meus-agendamentos`,
      },
    });
    return updated;
  });
}

export async function confirmAppointment(appointmentId: string): Promise<unknown> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: true, service: true },
  });
  if (!appointment) throw new Error("Agendamento não encontrado");
  if (appointment.status !== "PENDING") throw new Error("Apenas agendamentos pendentes podem ser confirmados");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });
    await tx.notification.create({
      data: {
        userId: appointment.clientId,
        title: "Agendamento confirmado",
        message: `Olá, ${appointment.client.name}! Seu agendamento para ${appointment.service.name}, no dia ${format(appointment.date, "dd/MM/yyyy")}, às ${formatTime(appointment.startTime)}, foi confirmado.`,
        type: "APPOINTMENT_CONFIRMED",
        link: `/meus-agendamentos`,
      },
    });
    return updated;
  });
}

export async function completeAppointment(appointmentId: string): Promise<unknown> {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED" },
  });
}

export async function getAvailableTimeSlots(date: string, serviceId: string): Promise<TimeSlot[]> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("Serviço não encontrado");

  const appointmentDate = parseToDate(date);
  if (appointmentDate < startOfDay(new Date())) return [];

  const availability = await prisma.availability.findFirst({
    where: { dayOfWeek: getDay(appointmentDate), active: true },
  });
  if (!availability) return [];

  const existing = await prisma.appointment.findMany({
    where: { date: appointmentDate, status: { in: ["PENDING", "CONFIRMED"] } },
  });
  const blocks = await prisma.blockedSlot.findMany({ where: { date: appointmentDate } });

  const open = toMinutes(availability.startTime);
  const close = toMinutes(availability.endTime);
  const breakS = availability.breakStart ? toMinutes(availability.breakStart) : null;
  const breakE = availability.breakEnd ? toMinutes(availability.breakEnd) : null;

  const slots: TimeSlot[] = [];
  for (let s = open; s + service.durationMinutes <= close; s += 30) {
    const e = s + service.durationMinutes;
    if (breakS !== null && breakE !== null && s < breakE && e > breakS) continue;

    const slotStart = new Date(appointmentDate);
    slotStart.setHours(Math.floor(s / 60), s % 60, 0, 0);
    const slotEnd = new Date(appointmentDate);
    slotEnd.setHours(Math.floor(e / 60), e % 60, 0, 0);

    const overlap = existing.some((a) => slotStart < a.endTime && slotEnd > a.startTime);
    if (overlap) {
      slots.push({ time: `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`, available: false });
      continue;
    }
    const blocked = blocks.some((b) => s < toMinutes(b.endTime) && e > toMinutes(b.startTime));
    const time = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    slots.push({ time, available: !blocked });
  }
  return slots;
}

export async function generateCalendar(year: number, month: number): Promise<CalendarDay[]> {
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const today = startOfDay(new Date());

  const availabilities = await prisma.availability.findMany({ where: { active: true } });
  const openDays = new Set(availabilities.map((a) => a.dayOfWeek));

  return allDays.map((day) => {
    const d = startOfDay(day);
    const isPast = d < today;
    const disabled = isPast || !openDays.has(getDay(d));
    return {
      date: format(d, "yyyy-MM-dd"),
      day: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      isCurrentMonth: d.getMonth() === month - 1,
      isToday: d.getTime() === today.getTime(),
      isPast,
      disabled,
    };
  });
}

export async function getAppointmentsByDate(date: string): Promise<unknown[]> {
  return prisma.appointment.findMany({
    where: { date: parseToDate(date) },
    include: { client: true, service: true },
    orderBy: { startTime: "asc" },
  });
}

export async function getTodayAppointments(): Promise<unknown[]> {
  return prisma.appointment.findMany({
    where: { date: startOfDay(new Date()), status: { in: ["PENDING", "CONFIRMED"] } },
    include: { client: true, service: true },
    orderBy: { startTime: "asc" },
  });
}

export async function getUpcomingAppointments(limit = 10): Promise<unknown[]> {
  return prisma.appointment.findMany({
    where: { date: { gte: startOfDay(new Date()) }, status: { in: ["PENDING", "CONFIRMED"] } },
    include: { client: true, service: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: limit,
  });
}

export async function getAllFutureAppointments(): Promise<unknown[]> {
  return prisma.appointment.findMany({
    where: { date: { gte: startOfDay(new Date()) } },
    include: { client: true, service: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 200,
  });
}

export async function getAppointmentStats(): Promise<unknown> {
  const today = startOfDay(new Date());
  const [todayTotal, pending, confirmed, cancelled, completed] = await Promise.all([
    prisma.appointment.count({ where: { date: today, status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: { in: ["CANCELLED_CLIENT", "CANCELLED_ADMIN"] } } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
  ]);
  return { todayTotal, pending, confirmed, cancelled, completed };
}
