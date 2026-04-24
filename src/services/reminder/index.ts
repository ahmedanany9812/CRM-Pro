import {
  createReminder,
  fireReminder,
  listLeadReminders,
  listMyReminders,
  cancelReminder,
} from "./service";

export const ReminderService = {
  create: createReminder,
  fire: fireReminder,
  listLead: listLeadReminders,
  listMy: listMyReminders,
  cancel: cancelReminder,
} as const;

export type {
  CreateReminderRequest,
  QStashReminderDueRequest,
  ListLeadRemindersRequest,
  ListMyRemindersRequest,
  UpdateReminderRequest,
} from "./schema";

export { createReminderSchema, qstashReminderDueSchema } from "./schema";

import {
  createReminderSchema,
  qstashReminderDueSchema,
  listLeadRemindersSchema,
  listMyRemindersSchema,
  updateReminderSchema,
} from "./schema";

export const ReminderSchema = {
  create: createReminderSchema,
  listLead: listLeadRemindersSchema,
  listMy: listMyRemindersSchema,
  update: updateReminderSchema,
  qstash: qstashReminderDueSchema,
} as const;
