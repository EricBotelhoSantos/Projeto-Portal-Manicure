import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  getServicesAll,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  serviceValidation,
  updateServiceValidation,
} from "../controllers/service.controller";

const router = Router();

router.get("/", getServicesAll);

router.use(authenticateToken, requireRole(["ADMIN"]));

router.post("/", serviceValidation, createService);
router.put("/:id", updateServiceValidation, updateService);
router.delete("/:id", deleteService);
router.patch("/:id/toggle", toggleServiceStatus);

export default router;
