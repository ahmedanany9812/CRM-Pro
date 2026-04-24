import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NotificationService } from "@/services/notification";

export async function POST(request: NextRequest) {
  try {
    const profile = await authenticateUser();
    
    const result = await NotificationService.markAllRead(profile);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}
