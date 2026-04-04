import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { leadIdParamsSchema } from "@/services/lead/schema";
import { 
  ReminderService, 
  CreateReminderRequest,
  ListLeadRemindersRequest 
} from "@/services/reminder";
import { ReminderSchema } from "@/services/reminder";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    
    const { searchParams } = new URL(request.url);
    const query = ReminderSchema.listLead.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      status: searchParams.get("status") || undefined,
    });

    const data = await ReminderService.listLead(profile, id, query);

    return NextResponse.json({ success: true, data });
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
    const { id } = leadIdParamsSchema.parse(await params);
    const body = await request.json();

    const validatedData = ReminderSchema.create.parse(body);

    const reminder = await ReminderService.create(
      profile,
      id,
      validatedData,
    );

    return NextResponse.json({ success: true, data: reminder });
  } catch (error) {
    return handleRouteError(error);
  }
}
