import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { getProfile, updateProfile, updateProfileSchema } from "@/services/profile";
import { supabase } from "@/lib/supabase/server";

/**
 * GET /api/profile
 * Returns the current user's profile
 */
export async function GET() {
  try {
    const user = await authenticateUser();
    const profile = await getProfile(user.id);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * PATCH /api/profile
 * Updates the current user's profile and/or password
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateUser();
    const client = await supabase();

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const updatedProfile = await updateProfile(user.id, data, client);

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    return handleRouteError(error);
  }
}
