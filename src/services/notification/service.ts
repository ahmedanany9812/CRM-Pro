import { Prisma, Profile } from "@/generated/prisma/client";
import { CreateNotificationRequest } from "./schema";
import { 
  dbCreateNotification, 
  dbListNotificationsForRecipient, 
  dbMarkNotificationReadForRecipient 
} from "./db";

export const createNotification = async (
  data: CreateNotificationRequest,
  tx?: Prisma.TransactionClient,
) => {
  return dbCreateNotification(
    {
      title: data.title,
      body: data.body,
      recipient: { connect: { id: data.recipientId } },
      ...(data.leadId ? { lead: { connect: { id: data.leadId } } } : {}),
    },
    tx,
  );
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
