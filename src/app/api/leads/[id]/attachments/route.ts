import { NextRequest, NextResponse } from "next/server";
import { AttachmentService } from "@/services/attachments";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await authenticateUser();
    const { id: leadId } = await params;
    const attachments = await AttachmentService.listForLead(leadId);
    return NextResponse.json({ success: true, data: attachments });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id: leadId } = await params;
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    const attachment = await AttachmentService.uploadForLead({
      leadId,
      file,
      userSnapshot: profile,
    });

    return NextResponse.json({ success: true, data: attachment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
