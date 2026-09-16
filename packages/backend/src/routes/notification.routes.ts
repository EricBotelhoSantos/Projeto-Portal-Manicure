import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  getNotifications,
  getUnreadNotificationsCount,
  readNotification,
  markAllNotificationsRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticateToken);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadNotificationsCount);
router.get("/:id/read", readNotification);
router.post("/read-all", markAllNotificationsRead);

export default router;
