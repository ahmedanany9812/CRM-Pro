import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { ReminderService, ReminderSchema } from "@/services/reminder";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = await params;
    
    const body = await request.json();
    const { status } = ReminderSchema.update.parse(body);

    if (status === "CANCELLED") {
      const data = await ReminderService.cancel(profile, id);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  } catch (error) {
    return handleRouteError(error);
  }
}
