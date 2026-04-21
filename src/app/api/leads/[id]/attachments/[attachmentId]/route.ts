import { NextRequest, NextResponse } from "next/server";
import { AttachmentService } from "@/services/attachments";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { attachmentId } = await params;

    await AttachmentService.deleteForLead(attachmentId, profile);

    return NextResponse.json({ success: true, message: "Attachment deleted" });
  } catch (error) {
    return handleRouteError(error);
  }
}
