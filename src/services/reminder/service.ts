import { prisma } from "@/lib/prisma";
import {
  dbCreateReminder,
  dbUpdateReminderQstashMessageId,
  dbGetReminderById,
  dbUpdateReminderStatus,
  dbListRemindersForLead,
  dbListRemindersForUser,
} from "./db";
import { qstash } from "@/lib/qstash";
import {
  CreateReminderRequest,
  QStashReminderDueRequest,
  ListLeadRemindersRequest,
  ListMyRemindersRequest,
} from "./schema";
import { UserSnapshot } from "@/utils/authenticateUser";
import { validateLeadAccess } from "./helpers";
import { ReminderStatus } from "@/generated/prisma/enums";
import { NotificationService } from "@/services/notification";

export const createReminder = async (
  profile: UserSnapshot,
  leadId: string,
  data: CreateReminderRequest,
) => {
  const assignedToId = data.assignedToId ?? profile.id;

  // Verify the user has access to create reminders for this person
  if (!(await validateLeadAccess(assignedToId, profile))) {
    throw new Error("Unauthorized: Cannot create reminder for this user");
  }

  return await prisma.$transaction(async (tx) => {
    // Step 1: Create the reminder in the database
    const reminder = await dbCreateReminder(
      {
        title: data.title,
        dueAt: data.dueAt,
        assignedTo: { connect: { id: assignedToId } },
        lead: { connect: { id: leadId } },
      },
      tx,
    );

    // Step 2: Schedule the QStash callback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || "";
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_API_URL environment variable must be set");
    }

    const { messageId } = await qstash.publishJSON({
      url: `${baseUrl}/api/upstash/reminder-due`,
      body: { reminderId: reminder.id } as QStashReminderDueRequest,
      notBefore: Math.floor(reminder.dueAt.getTime() / 1000),
    });

    // Step 3: Save the QStash message ID back to the reminder
    return await dbUpdateReminderQstashMessageId(reminder.id, messageId, tx);
  });
};

export const fireReminder = async (reminderId: string) => {
  const reminder = await dbGetReminderById(reminderId);
  if (!reminder) {
    throw new Error("Reminder not found");
  }

  return await prisma.$transaction(async (tx) => {
    try {
      await NotificationService.create(
        {
          title: "Reminder Due",
          body: reminder.title,
          recipientId: reminder.assignedToId,
          leadId: reminder.leadId,
        },
        tx
      );

      // Mark the reminder as FIRED
      await dbUpdateReminderStatus(reminderId, ReminderStatus.FIRED, tx);
    } catch (error) {
      console.error(`[fireReminder] Error during fire process:`, error);
      throw error;
    }
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

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Check access
  if (profile.role !== "ADMIN" && profile.role !== "MANAGER" && lead.assignedToId !== profile.id) {
    throw new Error("Unauthorized");
  }

  return dbListRemindersForLead(leadId, params);
};

export const listMyReminders = async (
  profile: UserSnapshot,
  params: ListMyRemindersRequest,
) => {
  return dbListRemindersForUser(profile.id, params);
};

export const cancelReminder = async (
  profile: UserSnapshot,
  reminderId: string,
) => {
  const reminder = await dbGetReminderById(reminderId);
  if (!reminder) throw new Error("Reminder not found");

  // Check access
  if (profile.role !== "ADMIN" && profile.role !== "MANAGER" && reminder.assignedToId !== profile.id) {
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

    return dbUpdateReminderStatus(reminderId, ReminderStatus.CANCELLED, tx);
  });
};

export const ReminderService = {
  create: createReminder,
  fire: fireReminder,
  listLead: listLeadReminders,
  listMy: listMyReminders,
  cancel: cancelReminder,
} as const;
