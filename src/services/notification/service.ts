import { Prisma, Profile } from "@/generated/prisma/client";
import { CreateNotificationRequest } from "./schema";
import {
  dbCreateNotification,
  dbListNotificationsForRecipient,
  dbMarkNotificationReadForRecipient,
  dbMarkAllNotificationsReadForRecipient,
} from "./db";

export const createNotification = async (
  data: CreateNotificationRequest,
  tx?: Prisma.TransactionClient,
) => {
  console.log(
    `[NotificationService.create] Creating notification`,
    {
      title: data.title,
      body: data.body,
      recipientId: data.recipientId,
      leadId: data.leadId,
    }
  );

  try {
    const result = await dbCreateNotification(
      {
        title: data.title,
        body: data.body,
        recipient: { connect: { id: data.recipientId } },
        ...(data.leadId ? { lead: { connect: { id: data.leadId } } } : {}),
      },
      tx,
    );
    console.log(`[NotificationService.create] Notification created successfully:`, result);
    return result;
  } catch (error) {
    console.error(
      `[NotificationService.create] Error creating notification:`,
      error
    );
    throw error;
  }
};

export const listNotifications = async (
  profile: Profile,
  params: { page: number; pageSize: number },
) => {
  return dbListNotificationsForRecipient(profile.id, params);
};

export const markNotificationRead = async (profile: Profile, id: string) => {
  const updated = await dbMarkNotificationReadForRecipient(id, profile.id);
  if (!updated) {
    throw new Error("Notification not found or access denied");
  }
  return updated;
};

export const markAllNotificationsRead = async (profile: Profile) => {
  return dbMarkAllNotificationsReadForRecipient(profile.id);
};
