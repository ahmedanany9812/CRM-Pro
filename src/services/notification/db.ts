import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NotificationReadState } from "@/generated/prisma/enums";
import { ListNotificationsResponseData } from "./schema";
import { buildPagination } from "@/lib/pagination";

export const dbCreateNotification = async (
  data: Prisma.NotificationCreateInput,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.notification.create({ data });
};

export const dbListNotificationsForRecipient = async (
  recipientId: string,
  params: { page: number; pageSize: number },
): Promise<ListNotificationsResponseData> => {
  const where: Prisma.NotificationWhereInput = { recipientId };
  const whereUnread: Prisma.NotificationWhereInput = {
    recipientId,
    readState: NotificationReadState.UNREAD,
  };

  const [rows, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: {
        id: true,
        title: true,
        body: true,
        leadId: true,
        readState: true,
        readAt: true,
        createdAt: true,
        lead: { select: { id: true, name: true } },
      },
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: whereUnread }),
  ]);

  return {
    notifications: rows as any,
    pagination: buildPagination(total, params.page, params.pageSize),
    unreadCount,
  };
};

export const dbMarkNotificationReadForRecipient = async (
  id: string,
  recipientId: string,
) => {
  const existing = await prisma.notification.findFirst({
    where: { id, recipientId },
    select: { id: true },
  });

  if (!existing) return null;

  return prisma.notification.update({
    where: { id },
    data: {
      readState: NotificationReadState.READ,
      readAt: new Date(),
    },
  });
};

export const dbMarkAllNotificationsReadForRecipient = async (
  recipientId: string,
) => {
  return prisma.notification.updateMany({
    where: {
      recipientId,
      readState: NotificationReadState.UNREAD,
    },
    data: {
      readState: NotificationReadState.READ,
      readAt: new Date(),
    },
  });
};
