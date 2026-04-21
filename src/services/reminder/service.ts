import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  dbUpsertReminder,
  dbUpdateReminder,
  dbGetReminderById,
  dbListRemindersForLead,
  dbListRemindersForUser,
} from "./db";
import { qstash } from "@/lib/qstash";
import {
  CreateReminderRequest,
  ListLeadRemindersRequest,
  ListMyRemindersRequest,
} from "./schema";
import { UserSnapshot } from "@/utils/authenticateUser";
import { getRoleBaseWhere, hasLeadAccess } from "@/utils/security";
import { ReminderStatus } from "@/generated/prisma/enums";

export const createReminder = async (
  profile: UserSnapshot,
  leadId: string,
  data: CreateReminderRequest,
) => {
  return await prisma.$transaction(async (tx) => {
    const reminder = await dbUpsertReminder(
      {
        title: data.title,
        dueAt: data.dueAt,
        lead: { connect: { id: leadId } },
        assignedTo: { connect: { id: profile.id } },
      },
      tx,
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "";
    if (!baseUrl) {
      console.warn(
        "No base URL found for QStash callback. Reminders will not fire correctly.",
      );
    }

    const { messageId } = await qstash.publishJSON({
      url: `${baseUrl}/api/upstash/reminder-due`,
      body: { reminderId: reminder.id },
      notBefore: Math.floor(data.dueAt.getTime() / 1000),
    });

    return await dbUpdateReminder(
      reminder.id,
      { qstashMessageId: messageId },
      tx,
    );
  });
};

export const listLeadReminders = async (
  profile: UserSnapshot,
  leadId: string,
  params: ListLeadRemindersRequest,
) => {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { assignedToId: true },
  });

  if (!lead || !hasLeadAccess(profile, lead.assignedToId)) {
    throw new Error("Unauthorized or lead not found");
  }

  return dbListRemindersForLead(leadId, params);
};

export const listMyReminders = async (
  profile: UserSnapshot,
  params: ListMyRemindersRequest,
) => {
  return dbListRemindersForUser(profile.id, {
    ...params,
    ...getRoleBaseWhere(profile, "lead.assignedToId"),
  });
};

export const cancelReminder = async (
  profile: UserSnapshot,
  reminderId: string,
) => {
  const reminder = await dbGetReminderById(reminderId);
  if (!reminder) throw new Error("Reminder not found");

  if (!hasLeadAccess(profile, reminder.assignedToId)) {
    throw new Error("Unauthorized");
  }

  if (reminder.status !== ReminderStatus.PENDING) {
    throw new Error("Only pending reminders can be cancelled");
  }

  return await prisma.$transaction(async (tx) => {
    if (reminder.qstashMessageId) {
      try {
        await qstash.messages.delete(reminder.qstashMessageId);
      } catch (e) {
        console.error("Failed to delete QStash message:", e);
      }
    }

    return dbUpdateReminder(
      reminderId,
      { status: ReminderStatus.CANCELLED },
      tx,
    );
  });
};

export const getReminder = async (id: string) => {
  return dbGetReminderById(id);
};

export const updateReminderStatus = async (
  id: string,
  status: ReminderStatus,
  tx?: Prisma.TransactionClient,
) => {
  return dbUpdateReminder(id, { status }, tx);
};
