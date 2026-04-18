import { createActivities, getLeadActivities } from "./service";
import {
  getLeadActivitiesSchema,
  createNoteSchema,
  createCallAttemptSchema,
} from "./schema";

export const ActivityService = {
  create: createActivities,
  getByLeadId: getLeadActivities,
} as const;

export const ActivitySchema = {
  getByLeadId: getLeadActivitiesSchema,
  createNote: createNoteSchema,
  createCallAttempt: createCallAttemptSchema,
} as const;

export type {
  CreateActivityRequest,
  GetLeadActivitiesRequest,
  CreateNoteRequest,
  CreateCallAttemptRequest,
} from "./schema";
