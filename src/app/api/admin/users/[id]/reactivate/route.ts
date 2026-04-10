import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "@/services/admin";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";

/**
 * POST /api/admin/users/[id]/reactivate
 * Reactivates a soft-deleted user. Gated by ADMIN role.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticateUser([Role.ADMIN]);
    const { id } = await params;
    
    const user = await AdminService.user.reactivate(id);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleRouteError(error);
  }
}
