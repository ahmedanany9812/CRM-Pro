import { Role } from "@/generated/prisma/enums";

interface UserProfile {
  id: string;
  role: Role;
}

export type PrismaWhere = {
  [key: string]: string | number | boolean | null | undefined | PrismaWhere;
};

export function getRoleBaseWhere(
  profile: UserProfile,
  relationPath: string = "assignedToId"
): PrismaWhere {
  if (profile.role !== Role.AGENT) {
    return {};
  }

  if (relationPath.includes(".")) {
    const parts = relationPath.split(".");
    const result: PrismaWhere = {};
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      current[part] = {};
      current = current[part] as PrismaWhere;
    }
    
    current[parts[parts.length - 1]] = profile.id;
    return result;
  }

  return { [relationPath]: profile.id };
}

export function hasLeadAccess(profile: UserProfile, assignedToId: string | null) {
  if (profile.role !== Role.AGENT) {
    return true;
  }
  return assignedToId === profile.id;
}
