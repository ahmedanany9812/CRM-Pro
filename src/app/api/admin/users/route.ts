import { NextRequest, NextResponse } from "next/server";
import { AdminService, AdminSchema } from "@/services/admin";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";
import { buildPagination } from "@/lib/pagination";

/**
 * GET /api/admin/users
 * Lists all users in the system. Gated by ADMIN role.
 */
export async function GET(req: NextRequest) {
  try {
    await authenticateUser([Role.ADMIN]);
    
    // Parse pagination params
    const { searchParams } = new URL(req.url);
    const params = AdminSchema.user.list.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    });

    const { users, total } = await AdminService.user.list(params);
    
    return NextResponse.json({ 
      success: true, 
      data: users,
      pagination: buildPagination(total, params.page, params.pageSize)
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * POST /api/admin/users
 * Creates a new user (Supabase Auth + Prisma Profile) and sends an invite email.
 */
export async function POST(req: NextRequest) {
  try {
    await authenticateUser([Role.ADMIN]);
    const body = await req.json();
    const data = AdminSchema.user.create.parse(body);
    
    const user = await AdminService.user.create(data);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
