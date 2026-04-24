import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase/server";
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

export async function authenticateUser(
  allowedRoles?: Role[],
): Promise<Profile> {
  const client = await supabase();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new AuthenticationError("Unauthorized", 401);
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    throw new AuthenticationError("User profile not found", 404);
  }

  if (!profile.isActive) {
    throw new AuthenticationError("User is not active", 403);
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new AuthenticationError("Forbidden: Insufficient permissions", 403);
  }

  return profile as Profile;
}
