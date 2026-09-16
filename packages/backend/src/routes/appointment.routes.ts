import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  getServices,
  getTimeSlots,
  bookAppointment,
  getMyAppointments,
  getMyAppointmentById,
  cancelMyAppointment,
  getCalendar,
  bookAppointmentValidation,
} from "../controllers/appointment.controller";

const router = Router();

router.get("/services", getServices);
router.get("/time-slots", getTimeSlots);
router.get("/calendar", getCalendar);

router.use(authenticateToken);

router.get("/my-appointments", getMyAppointments);
router.get("/my-appointments/:id", getMyAppointmentById);
router.post("/my-appointments/:id/cancel", cancelMyAppointment);
router.post("/book", bookAppointmentValidation, bookAppointment);

export default router;
