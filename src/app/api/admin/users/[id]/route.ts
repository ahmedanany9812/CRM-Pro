import { NextRequest, NextResponse } from "next/server";
import { AdminService, AdminSchema } from "@/services/admin";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";

/**
 * PATCH /api/admin/users/[id]
 * Updates a user's profile. Gated by ADMIN role.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await authenticateUser([Role.ADMIN]);
    const { id } = await params;
    const body = await req.json();
    const data = AdminSchema.user.update.parse(body);
    
    const user = await AdminService.user.update(admin.id, id, data);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleRouteError(error);
  }
}
