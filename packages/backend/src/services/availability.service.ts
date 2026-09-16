import { Availability } from "@prisma/client";
import prisma from "../config/prisma";
import { startOfDay } from "date-fns";

interface ConfigAvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  active: boolean;
}

interface BlockDateInput {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

const TIME_RE = /^\d{2}:\d{2}$/;

function assertTime(value: string | null | undefined, label: string): void {
  if (value === null || value === undefined || value === "") return;
  if (!TIME_RE.test(value)) throw new Error(`${label} inválido (use HH:mm)`);
}

export async function getAvailability(): Promise<Availability[]> {
  return prisma.availability.findMany({ orderBy: { dayOfWeek: "asc" } });
}

export async function upsertAvailability(input: ConfigAvailabilityInput): Promise<Availability> {
  const { dayOfWeek, startTime, endTime, breakStart, breakEnd, active } = input;
  if (dayOfWeek < 0 || dayOfWeek > 6) throw new Error("Dia da semana inválido");
  assertTime(startTime, "Horário inicial");
  assertTime(endTime, "Horário final");
  assertTime(breakStart ?? undefined, "Início do intervalo");
  assertTime(breakEnd ?? undefined, "Fim do intervalo");

  const existing = await prisma.availability.findFirst({ where: { dayOfWeek } });
  const data = { dayOfWeek, startTime, endTime, breakStart: breakStart || null, breakEnd: breakEnd || null, active };
  if (existing) return prisma.availability.update({ where: { id: existing.id }, data });
  return prisma.availability.create({ data });
}

export async function updateAvailability(id: string, input: Partial<ConfigAvailabilityInput>): Promise<Availability> {
  const data: Record<string, unknown> = {};
  if (input.startTime !== undefined) {
    assertTime(input.startTime, "Horário inicial");
    data.startTime = input.startTime;
  }
  if (input.endTime !== undefined) {
    assertTime(input.endTime, "Horário final");
    data.endTime = input.endTime;
  }
  if (input.breakStart !== undefined) data.breakStart = input.breakStart || null;
  if (input.breakEnd !== undefined) data.breakEnd = input.breakEnd || null;
  if (input.active !== undefined) data.active = input.active;
  return prisma.availability.update({ where: { id }, data: data as never });
}

export async function deleteAvailability(id: string): Promise<void> {
  await prisma.availability.delete({ where: { id } });
}

export async function getBlockedSlots(): Promise<unknown[]> {
  return prisma.blockedSlot.findMany({ orderBy: [{ date: "desc" }, { startTime: "asc" }] });
}

export async function blockDate(input: BlockDateInput): Promise<unknown> {
  const { date, startTime, endTime, reason } = input;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Data inválida");
  assertTime(startTime, "Horário inicial");
  assertTime(endTime, "Horário final");
  return prisma.blockedSlot.create({
    data: { date: new Date(`${date}T00:00:00`), startTime, endTime, reason },
  });
}

export async function deleteBlockedSlot(id: string): Promise<void> {
  await prisma.blockedSlot.delete({ where: { id } });
}

export async function getCalendarAvailability(year: number, month: number): Promise<unknown[]> {
  const first = startOfDay(new Date(year, month - 1, 1));
  const last = startOfDay(new Date(year, month, 0));
  const availabilities = await prisma.availability.findMany({ where: { active: true } });
  const blocks = await prisma.blockedSlot.findMany({
    where: { date: { gte: first, lte: last } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: first, lte: last }, status: { in: ["PENDING", "CONFIRMED"] } },
    include: { client: true, service: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  void startOfDay;
  return [
    {
      availabilities,
      blockedSlots: blocks,
      appointments,
    },
  ];
}
