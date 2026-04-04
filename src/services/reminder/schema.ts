import { z } from "zod";
import { ReminderStatus } from "@/generated/prisma/enums";

export const createReminderSchema = z.object({
  title: z.string().min(1),
  dueAt: z.coerce.date(),
});

export const updateReminderStatusSchema = z.object({
  status: z.nativeEnum(ReminderStatus),
});

export type CreateReminderRequest = z.infer<typeof createReminderSchema>;
export type UpdateReminderStatusRequest = z.infer<typeof updateReminderStatusSchema>;

export const listLeadRemindersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
});

export const listMyRemindersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ReminderStatus).optional(),
  leadId: z.string().uuid().optional(),
  overdue: z.coerce.boolean().optional(),
});

export const updateReminderSchema = z.object({
  status: z.enum(["CANCELLED"]),
});

export type ListLeadRemindersRequest = z.infer<typeof listLeadRemindersSchema>;
export type ListMyRemindersRequest = z.infer<typeof listMyRemindersSchema>;
export type UpdateReminderRequest = z.infer<typeof updateReminderSchema>;

export const qstashReminderDueSchema = z.object({
  reminderId: z.string().uuid(),
});
