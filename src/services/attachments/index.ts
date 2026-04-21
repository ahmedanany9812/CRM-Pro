import { uploadAttachmentSchema } from "./schema";
import { listForLead, uploadForLead, deleteForLead } from "./service";
export type { AttachmentListItem } from "./schema";

export const AttachmentService = {
  listForLead,
  uploadForLead,
  deleteForLead,
} as const;

export const AttachmentSchema = {
  uploadForLead: uploadAttachmentSchema,
} as const;
