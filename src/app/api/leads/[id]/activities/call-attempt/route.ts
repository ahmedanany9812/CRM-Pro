import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { ActivityService } from "@/services/activity";
import { createCallAttemptSchema } from "@/services/activity/schema";
import { ActivityType } from "@/generated/prisma/enums";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();
    const body = await request.json();

    const validated = createCallAttemptSchema.parse(body);

    const content = validated.notes
      ? `${validated.outcome} — ${validated.notes}`
      : validated.outcome;

    const result = await ActivityService.create([{
      leadId: id,
      actorId: profile.id,
      type: ActivityType.CALL_ATTEMPT,
      meta: {
        from: null,
        to: content, // Storing final message in to
      }
    }]);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    return handleRouteError(error);
  }
}
