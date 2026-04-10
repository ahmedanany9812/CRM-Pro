import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { ReminderService, ReminderSchema } from "@/services/reminder";

export async function GET(request: NextRequest) {
  try {
    const profile = await authenticateUser();
    
    const { searchParams } = new URL(request.url);
    const query = ReminderSchema.listMy.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      status: searchParams.get("status") || undefined,
      leadId: searchParams.get("leadId") || undefined,
      overdue: searchParams.has("overdue") ? searchParams.get("overdue") === "true" : undefined,
    });

    const data = await ReminderService.listMy(profile, query);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
