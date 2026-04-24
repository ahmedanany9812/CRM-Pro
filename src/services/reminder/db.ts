import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ReminderStatus } from "@/generated/prisma/enums";

export const dbCreateReminder = async (
  reminder: Prisma.ReminderCreateInput,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.create({ data: reminder });
};

export const dbUpdateReminderQstashMessageId = async (
  reminderId: string,
  qstashMessageId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.update({
    where: { id: reminderId },
    data: { qstashMessageId },
  });
};

export const dbGetReminderById = async (id: string) => {
  return prisma.reminder.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
};

export const dbUpdateReminder = async (
  id: string,
  data: Prisma.ReminderUpdateInput,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.update({
    where: { id },
    data,
  });
};

export const dbUpdateReminderStatus = async (
  id: string,
  status: ReminderStatus,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.update({
    where: { id },
    data: { status },
  });
};

export const dbListRemindersForLead = async (
  leadId: string,
  params: { page: number; pageSize: number; status?: ReminderStatus },
) => {
  const where: Prisma.ReminderWhereInput = {
    leadId,
    ...(params.status ? { status: params.status } : {}),
  };

  const [reminders, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      orderBy: { dueAt: "desc" },
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      include: {
        lead: { select: { id: true, name: true } },
      },
    }),
    prisma.reminder.count({ where }),
  ]);

  return { reminders, total };
};

export const dbListRemindersForUser = async (
  userId: string,
  params: {
    page: number;
    pageSize: number;
    status?: ReminderStatus;
    leadId?: string;
    overdue?: boolean;
  },
) => {
  const where: Prisma.ReminderWhereInput = {
    assignedToId: userId,
    ...(params.status ? { status: params.status } : {}),
    ...(params.leadId ? { leadId: params.leadId } : {}),
    ...(params.overdue !== undefined
      ? {
          status: "PENDING",
          dueAt: params.overdue ? { lt: new Date() } : { gt: new Date() },
        }
      : {}),
  };

  const [reminders, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      orderBy: { dueAt: "desc" },
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      include: {
        lead: { select: { id: true, name: true } },
      },
    }),
    prisma.reminder.count({ where }),
  ]);

  return { reminders, total };
};
