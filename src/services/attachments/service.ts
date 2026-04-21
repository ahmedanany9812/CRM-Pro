import {
  deleteLeadAttachment,
  getLeadAttachmentSignedUrl,
  uploadLeadAttachment,
} from "@/lib/supabase/storage";
import {
  dbCreateAttachment,
  dbDeleteAttachment,
  dbFindAttachmentById,
  dbGetLeadById,
  dbListAttachmentsForLead,
} from "./db";
import {
  ALLOWED_MIME_TYPES,
  AttachmentListItem,
  MAX_FILE_SIZE_BYTES,
} from "./schema";
import { UserSnapshot } from "@/utils/authenticateUser";
import { buildStoragePath } from "./helpers";
import { prisma } from "@/lib/prisma";
import { ActivityService } from "../activity";
import { ActivityType } from "@/generated/prisma/enums";

export class AttachmentServiceError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AttachmentServiceError";
  }
}

export async function listForLead(
  leadId: string,
): Promise<AttachmentListItem[]> {
  const rows = await dbListAttachmentsForLead(leadId);

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      createdAt: row.createdAt,
      uploadedBy: row.uploadedBy,
      downloadUrl: await getLeadAttachmentSignedUrl(row.storagePath),
    })),
  );
}

export async function uploadForLead(input: {
  leadId: string;
  file: File;
  userSnapshot: UserSnapshot;
}) {
  const { leadId, file, userSnapshot } = input;

  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AttachmentServiceError(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes`,
      400,
    );
  }

  // 2. Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new AttachmentServiceError(
      `File type ${file.type} is not allowed.`,
      400,
    );
  }

  // 3. Validate lead exists
  const lead = await dbGetLeadById(leadId);
  if (!lead) {
    throw new AttachmentServiceError("Lead not found", 404);
  }

  // 4. Upload file to Storage
  const storagePath = buildStoragePath(lead.id, file.name);
  await uploadLeadAttachment(storagePath, file);

  try {
    // 5. Create database record + activity in one transaction
    const attachment = await prisma.$transaction(async (tx) => {
      const attachment = await dbCreateAttachment(
        {
          leadId,
          uploadedById: userSnapshot.id,
          fileName: file.name,
          storagePath,
          mimeType: file.type,
          sizeBytes: file.size,
        },
        tx,
      );

      await ActivityService.create(
        [
          {
            actorId: userSnapshot.id,
            leadId,
            type: ActivityType.ATTACHMENT_ADDED,
            content: `Uploaded attachment: ${file.name}`,
          },
        ],
        tx,
      );

      return attachment;
    });

    return attachment;
  } catch (error) {
    // 6. Cleanup: delete orphaned file if DB write fails
    console.error(error);
    await deleteLeadAttachment(storagePath);
    throw new AttachmentServiceError("Failed to upload attachment", 500);
  }
}

export async function deleteForLead(
  attachmentId: string,
  userSnapshot: UserSnapshot,
) {
  const attachment = await dbFindAttachmentById(attachmentId);
  if (!attachment) {
    throw new AttachmentServiceError("Attachment not found", 404);
  }

  // Storage cleanup FIRST
  await deleteLeadAttachment(attachment.storagePath);

  // DB cleanup
  return await dbDeleteAttachment(attachmentId);
}
