import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import prisma from "../config/prisma";
import {
  getAvailability,
  upsertAvailability,
  updateAvailability,
  deleteAvailability,
  getBlockedSlots,
  blockDate,
  deleteBlockedSlot,
  getCalendarAvailability,
} from "../services/availability.service";
import {
  getAdminDashboard,
  getAdminAppointmentsByDate,
  confirmAppointment,
  completeAppointmentController,
  cancelAppointmentAdmin,
} from "../controllers/appointment.controller";

const router = Router();

router.use(authenticateToken, requireRole(["ADMIN"]));

router.get("/dashboard", getAdminDashboard);
router.get("/appointments/by-date", getAdminAppointmentsByDate);
router.get("/appointments/:id", async (req, res) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { client: true, service: true },
    });
    if (!appt) {
      res.status(404).json({ message: "Não encontrado" });
      return;
    }
    res.json(appt);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});
router.put("/appointments/:id/confirm", confirmAppointment);
router.put("/appointments/:id/complete", completeAppointmentController);
router.post("/appointments/:id/cancel", cancelAppointmentAdmin);

router.get("/availability", async (_req, res) => {
  try {
    res.json(await getAvailability());
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});
router.post("/availability", async (req, res) => {
  try {
    res.json(await upsertAvailability(req.body));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});
router.put("/availability/:id", async (req, res) => {
  try {
    res.json(await updateAvailability(req.params.id, req.body));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});
router.delete("/availability/:id", async (req, res) => {
  try {
    await deleteAvailability(req.params.id);
    res.json({ message: "Removido" });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});

router.get("/blocked-slots", async (_req, res) => {
  try {
    res.json(await getBlockedSlots());
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});
router.post("/blocked-slots", async (req, res) => {
  try {
    res.json(await blockDate(req.body));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});
router.delete("/blocked-slots/:id", async (req, res) => {
  try {
    await deleteBlockedSlot(req.params.id);
    res.json({ message: "Removido" });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});

router.get("/calendar-availability", async (req, res) => {
  try {
    const { year, month } = req.query;
    res.json(
      await getCalendarAvailability(parseInt(String(year), 10), parseInt(String(month), 10))
    );
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
});

export default router;
