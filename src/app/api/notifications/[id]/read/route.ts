import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { 
  NotificationService, 
  NotificationSchema 
} from "@/services/notification";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = NotificationSchema.idParam.parse(await params);

    const updated = await NotificationService.markRead(profile, id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
