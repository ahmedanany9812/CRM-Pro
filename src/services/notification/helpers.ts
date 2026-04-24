import { UserSnapshot } from "@/utils/authenticateUser";

export const validateLeadAccess = async (
  assignedToId: string | null | undefined,
  userSnapshot: UserSnapshot,
) => {
  if (userSnapshot.role === "ADMIN" || userSnapshot.role === "MANAGER") {
    return true;
  }
  return assignedToId === userSnapshot.id;
};
