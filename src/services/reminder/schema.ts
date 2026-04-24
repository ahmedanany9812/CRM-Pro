import { z } from "zod";
import { ReminderStatus } from "@/generated/prisma/enums";

export const createReminderSchema = z.object({
  title: z.string().min(1),
  dueAt: z.coerce
    .date()
    .refine((date) => date > new Date(), "Reminder must be in the future")
    .refine(
      (date) => date.getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000,
      "Reminder cannot be more than 7 days in the future",
    ),
  assignedToId: z.string().uuid().optional(),
});

export type CreateReminderRequest = z.infer<typeof createReminderSchema>;

export const qstashReminderDueSchema = z.object({
  reminderId: z.string().uuid(),
});

export type QStashReminderDueRequest = z.infer<typeof qstashReminderDueSchema>;

export const listLeadRemindersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
});

export type ListLeadRemindersRequest = z.infer<typeof listLeadRemindersSchema>;

export const listMyRemindersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
  leadId: z.string().uuid().optional(),
  overdue: z.coerce.boolean().optional(),
});

export type ListMyRemindersRequest = z.infer<typeof listMyRemindersSchema>;

export const updateReminderSchema = z.object({
  status: z.enum(["CANCELLED"]),
});

export type UpdateReminderRequest = z.infer<typeof updateReminderSchema>;
