import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { Role } from "@/generated/prisma/enums";
import { Profile } from "@/generated/prisma/client";

export type UserSnapshot = {
  id: string;
  role: Role;
};

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Reusable helper to authenticate a user and fetch their profile.
 * Optionally checks if the user has one of the allowed roles.
 */
export async function authenticateUser(allowedRoles?: Role[]): Promise<Profile> {
  // 1. Get session from Supabase
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError("Unauthorized", 401);
  }

  // 2. Fetch profile from Prisma
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    throw new AuthenticationError("User profile not found", 404);
  }

  if (!profile.isActive) {
    throw new AuthenticationError("User is not active", 403);
  }

  // 3. Optional role check
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new AuthenticationError("Forbidden: Insufficient permissions", 403);
  }

  return profile as Profile;
}
