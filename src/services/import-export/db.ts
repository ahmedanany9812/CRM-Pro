import { prisma } from "@/lib/prisma";

/**
 * Finds a profile by email. Used for resolving assignees during CSV import.
 */
export async function dbFindProfileByEmail(email: string) {
  return await prisma.profile.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });
}
