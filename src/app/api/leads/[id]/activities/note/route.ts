import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { ActivityService } from "@/services/activity";
import { createNoteSchema } from "@/services/activity/schema";
import { ActivityType } from "@/generated/prisma/enums";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();
    const body = await request.json();

    const validated = createNoteSchema.parse(body);

    const result = await ActivityService.create([{
      leadId: id,
      actorId: profile.id,
      type: ActivityType.NOTE,
      content: validated.content,
    }]);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: result.count, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}
