import { Role } from "@/generated/prisma/enums";

export type UserSnapshot = {
  id: string;
  role: Role;
};

export const validateLeadAccess = (
  leadAssignedToId: string | null | undefined,
  userSnapshot: UserSnapshot,
) => {
  if (["ADMIN", "MANAGER"].includes(userSnapshot.role)) {
    return true;
  }
  return leadAssignedToId === userSnapshot.id;
};
