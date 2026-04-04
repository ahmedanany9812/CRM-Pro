import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { ActivityService, ActivitySchema } from "@/services/activity";
import { createNoteSchema } from "@/services/activity/schema";
import { ActivityType } from "@/generated/prisma/enums";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    const validated = ActivitySchema.getByLeadId.parse({
      leadId: id,
      page: page,
      pageSize: pageSize,
    });

    const activities = await ActivityService.getByLeadId(validated, {
      id: profile.id,
      role: profile.role,
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    return handleRouteError(error);
  }
}

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
      meta: {
        from: null,
        to: validated.content, // Using meta.to as storage for the note content
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
