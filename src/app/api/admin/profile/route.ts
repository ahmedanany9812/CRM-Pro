import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/profile
 * Returns the current authenticated user's profile information.
 */
export async function GET() {
  try {
    const profile = await authenticateUser();
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
