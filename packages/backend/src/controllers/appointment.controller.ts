import { Request, Response } from "express";
import { body } from "express-validator";
import { AuthenticatedRequest } from "../types/express";
import {
  getAvailableServices,
  getAvailableTimeSlots,
  createAppointment,
  getClientAppointments,
  getAppointmentById,
  cancelAppointmentByClient,
  cancelAppointmentByAdmin,
  confirmAppointment as confirmAppointmentService,
  completeAppointment,
  getTodayAppointments,
  getUpcomingAppointments,
  getAllFutureAppointments,
  getAppointmentStats,
  getAppointmentsByDate,
  generateCalendar,
} from "../services/appointment.service";
import { validateRequest } from "../middleware/validation.middleware";

export const bookAppointmentValidation = [
  body("serviceId").notEmpty().withMessage("ID do serviço é obrigatório"),
  body("date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Data inválida (use AAAA-MM-DD)"),
  body("startTime").matches(/^\d{2}:\d{2}$/).withMessage("Horário inválido (use HH:mm)"),
  validateRequest,
];

export async function getServices(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await getAvailableServices());
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function getTimeSlots(req: Request, res: Response): Promise<void> {
  const { date, serviceId } = req.query;
  if (!date || !serviceId) {
    res.status(400).json({ message: "Data e serviceId são obrigatórios" });
    return;
  }
  try {
    res.json(await getAvailableTimeSlots(String(date), String(serviceId)));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function bookAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  const { serviceId, date, startTime, notes, photoUrl } = req.body;
  try {
    const appointment = await createAppointment({
      clientId: req.user.id,
      serviceId,
      date,
      startTime,
      notes,
      photoUrl,
    });
    res.status(201).json(appointment);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    const status = /disponível|Conflito|bloqueado|funcionamento|intervalo|espaço/i.test(msg) ? 409 : 400;
    res.status(status).json({ message: msg });
  }
}

export async function getMyAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    res.json(await getClientAppointments(req.user.id));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function getMyAppointmentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    const appointment = await getAppointmentById(req.params.id, req.user.id, req.user.role);
    if (!appointment) {
      res.status(404).json({ message: "Agendamento não encontrado" });
      return;
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function cancelMyAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    const { reason, customReason } = req.body;
    if (!reason && !customReason) {
      res.status(400).json({ message: "Motivo do cancelamento é obrigatório" });
      return;
    }
    res.json(await cancelAppointmentByClient(req.params.id, req.user.id, reason, customReason));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function getCalendar(req: Request, res: Response): Promise<void> {
  const { year, month } = req.query;
  if (!year || !month) {
    res.status(400).json({ message: "Ano e mês são obrigatórios" });
    return;
  }
  try {
    res.json(await generateCalendar(parseInt(String(year), 10), parseInt(String(month), 10)));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function getAdminAppointmentsByDate(req: Request, res: Response): Promise<void> {
  const { date } = req.query;
  if (!date) {
    res.status(400).json({ message: "Data é obrigatória" });
    return;
  }
  try {
    res.json(await getAppointmentsByDate(String(date)));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function confirmAppointment(req: Request, res: Response): Promise<void> {
  try {
    res.json(await confirmAppointmentService(req.params.id));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function completeAppointmentController(req: Request, res: Response): Promise<void> {
  try {
    res.json(await completeAppointment(req.params.id));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function cancelAppointmentAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ message: "Motivo do cancelamento é obrigatório" });
      return;
    }
    res.json(await cancelAppointmentByAdmin(req.params.id, reason));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function getAdminDashboard(_req: Request, res: Response): Promise<void> {
  try {
    const [todayAppointments, upcoming, future, stats] = await Promise.all([
      getTodayAppointments(),
      getUpcomingAppointments(10),
      getAllFutureAppointments(),
      getAppointmentStats(),
    ]);
    res.json({ todayAppointments, upcoming, future, stats });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}
