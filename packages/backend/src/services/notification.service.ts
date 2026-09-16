import { Notification } from "@prisma/client";
import prisma from "../config/prisma";

export async function getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
  const where: any = { userId };
  if (unreadOnly) where.read = false;
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAsRead(notificationId: string, userId: string): Promise<Notification> {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return { count: result.count };
}

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type as any,
      link: input.link,
    },
  });
}
