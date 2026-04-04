import { 
  createReminder, 
  getReminder, 
  updateReminderStatus, 
  listLeadReminders, 
  listMyReminders, 
  cancelReminder 
} from "./service";

export const ReminderService = {
  create: createReminder,
  get: getReminder,
  updateStatus: updateReminderStatus,
  listLead: listLeadReminders,
  listMy: listMyReminders,
  cancel: cancelReminder,
} as const;

export type { 
  CreateReminderRequest, 
  UpdateReminderStatusRequest,
  ListLeadRemindersRequest,
  ListMyRemindersRequest,
  UpdateReminderRequest
} from "./schema";

import { 
  createReminderSchema, 
  listLeadRemindersSchema, 
  listMyRemindersSchema,
  updateReminderSchema,
  qstashReminderDueSchema
} from "./schema";

export const ReminderSchema = {
  create: createReminderSchema,
  listLead: listLeadRemindersSchema,
  listMy: listMyRemindersSchema,
  update: updateReminderSchema,
  qstash: qstashReminderDueSchema,
} as const;
