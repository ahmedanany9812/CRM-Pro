import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "@/services/admin";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";

/**
 * POST /api/admin/users/[id]/resend-invite
 * Regenerates and sends a fresh magic link invite.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticateUser([Role.ADMIN]);
    const { id } = await params;
    
    await AdminService.user.resendInvite(id);
    
    return NextResponse.json({ success: true, message: "Invitation resent successfully" });
  } catch (error) {
    return handleRouteError(error);
  }
}
