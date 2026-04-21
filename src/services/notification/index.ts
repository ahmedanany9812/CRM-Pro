import { Profile } from "@/generated/prisma/client";
import {
  createNotification,
  listNotifications,
  markNotificationRead,
} from "./service";
import {
  createNotificationSchema,
  listNotificationsQuerySchema,
  notificationIdParamsSchema,
} from "./schema";

export const NotificationService = {
  create: createNotification,
  list: listNotifications,
  markRead: markReadNotification,
};

export function markReadNotification(profile: Profile, id: string) {
  return markNotificationRead(profile, id);
}

export const NotificationSchema = {
  create: createNotificationSchema,
  list: listNotificationsQuerySchema,
  idParam: notificationIdParamsSchema,
} as const;

export type {
  CreateNotificationRequest,
  NotificationListItem,
  ListNotificationsResponseData,
} from "./schema";
