import { z } from "zod";
import { NotificationReadState } from "@/generated/prisma/enums";

export const createNotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  recipientId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
});

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export const notificationIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export interface NotificationListItem {
  id: string;
  title: string;
  body: string;
  leadId: string | null;
  readState: NotificationReadState;
  readAt: Date | null;
  createdAt: Date;
  lead: {
    id: string;
    name: string;
  } | null;
}

export interface ListNotificationsResponseData {
  notifications: NotificationListItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
  unreadCount: number;
}

export type CreateNotificationRequest = z.infer<typeof createNotificationSchema>;
