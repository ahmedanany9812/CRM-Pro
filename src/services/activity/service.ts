import { Prisma } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/enums";
import { dbCreateActivities, dbGetLeadActivities } from "./db";
import { 
  createManyActivitiesSchema, 
  CreateActivityRequest, 
  GetLeadActivitiesRequest 
} from "./schema";
import { buildActivityContent } from "./helpers";
import { buildPagination } from "@/lib/pagination";

export type UserSnapshot = {
  id: string;
  role: Role;
};

export async function createActivities(
  request: CreateActivityRequest[],
  tx?: Prisma.TransactionClient
) {
  const validated = createManyActivitiesSchema.safeParse(request);
  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const activitiesToCreate: Prisma.ActivityCreateManyInput[] = [];
  for (const activity of (validated.data as any)) {
    const content = buildActivityContent(activity.type, activity.meta as any, activity.content);
    activitiesToCreate.push({
      leadId: activity.leadId,
      actorId: activity.actorId,
      content,
      type: activity.type,
      metadata: activity.meta as any,
    });
  }

  const countCreated = await dbCreateActivities(activitiesToCreate, tx);

  return {
    success: true as const,
    count: countCreated.count,
  };
}

export async function getLeadActivities(
  request: GetLeadActivitiesRequest,
  userSnapshot: UserSnapshot
) {
  const where: Prisma.ActivityWhereInput = {
    leadId: request.leadId,
  };

  if (userSnapshot.role === Role.AGENT) {
    where.lead = {
      assignedToId: userSnapshot.id,
    };
  }

  const result = await dbGetLeadActivities(where, {
    page: request.page,
    pageSize: request.pageSize,
  });

  return {
    activities: result.activities,
    pagination: buildPagination(result.total, request.page, request.pageSize),
  };
}
