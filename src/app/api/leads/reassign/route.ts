import { NextRequest, NextResponse } from "next/server";
import { LeadService } from "@/services/lead";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";
import { z } from "zod";

const reassignSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1),
  assignToId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await authenticateUser([Role.ADMIN, Role.MANAGER]);
    const body = await request.json();
    const validated = reassignSchema.parse(body);

    await LeadService.bulkReassignLeads(profile, validated);

    return NextResponse.json({
      success: true,
      message: `Successfully reassigned ${validated.leadIds.length} leads`,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
