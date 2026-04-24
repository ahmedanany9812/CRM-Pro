import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { 
  NotificationService, 
  NotificationSchema 
} from "@/services/notification";

export async function GET(request: NextRequest) {
  try {
    const profile = await authenticateUser();
    
    const { searchParams } = new URL(request.url);
    const params = NotificationSchema.list.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    });

    const data = await NotificationService.list(profile, params);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
