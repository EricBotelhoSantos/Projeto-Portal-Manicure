import { Request, Response } from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
} from "../services/notification.service";

export async function getNotifications(req: Request, res: Response): Promise<void> {
  const { user } = req as any;
  if (!user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    const { unread } = req.query;
    const notifications = await getUserNotifications(user.id, unread === "true");
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUnreadNotificationsCount(req: Request, res: Response): Promise<void> {
  const { user } = req as any;
  if (!user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    const count = await getUnreadCount(user.id);
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function readNotification(req: Request, res: Response): Promise<void> {
  const { user } = req as any;
  if (!user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    const notification = await markAsRead(req.params.id, user.id);
    res.json(notification);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Notificação não encontrada" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}

export async function markAllNotificationsRead(req: Request, res: Response): Promise<void> {
  const { user } = req as any;
  if (!user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    const result = await markAllAsRead(user.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createNotificationController(req: Request, res: Response): Promise<void> {
  try {
    const notification = await createNotification(req.body);
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
