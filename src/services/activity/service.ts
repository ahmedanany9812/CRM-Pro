import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ActivityType } from "@/generated/prisma/enums";
import { dbCreateActivities, dbGetLeadActivities } from "./db";
import {
  createManyActivitiesSchema,
  CreateActivityRequest,
  GetLeadActivitiesRequest,
} from "./schema";
import { buildActivityContent } from "./helpers";
import { buildPagination } from "@/lib/pagination";
import { UserSnapshot } from "@/utils/authenticateUser";
import { getRoleBaseWhere } from "@/utils/security";

export async function createActivities(
  request: CreateActivityRequest[],
  tx?: Prisma.TransactionClient,
) {
  const validated = createManyActivitiesSchema.safeParse(request);
  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const activitiesToCreate: Prisma.ActivityCreateManyInput[] = [];
  for (const activity of validated.data) {
    const content = buildActivityContent(
      activity.type,
      activity.meta as { from: unknown; to: unknown },
      activity.content,
    );
    activitiesToCreate.push({
      leadId: activity.leadId,
      actorId: activity.actorId,
      content,
      type: activity.type,
      metadata: activity.meta as Prisma.InputJsonValue,
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
  userSnapshot: UserSnapshot,
) {
  const where: Prisma.ActivityWhereInput = {
    leadId: request.leadId,
    ...getRoleBaseWhere(userSnapshot, "lead.assignedToId"),
  };

  const result = await dbGetLeadActivities(where, {
    page: request.page,
    pageSize: request.pageSize,
  });

  return {
    activities: result.activities,
    pagination: buildPagination(result.total, request.page, request.pageSize),
  };
}

/**
 * Creates an AI-related activity in the timeline.
 */
export async function createAIActivity(
  request: {
    type: ActivityType;
    leadId: string;
    actorId: string;
    content: string;
  },
) {
  return await prisma.activity.create({
    data: {
      type: request.type,
      leadId: request.leadId,
      actorId: request.actorId,
      content: request.content,
    },
  });
}
