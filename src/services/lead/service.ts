import { Role, ActivityType } from "@/generated/prisma/enums";
import {
  dbListLeads,
  dbCreateLead,
  dbUpdateLead,
  dbGetLeadById,
  dbDeleteLead,
} from "./db";
import { ListLeadsParams, CreateLeadRequest, EditLeadRequest } from "./schema";
import { Prisma, Profile } from "@/generated/prisma/client";
import { ActivityService } from "@/services/activity";
import { buildLeadChangeActivities } from "./helpers";
import { prisma } from "@/lib/prisma";
import { getRoleBaseWhere, hasLeadAccess } from "@/utils/security";

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  const where: Prisma.LeadWhereInput = {
    ...getRoleBaseWhere(profile),
  };

  if (params.stage) {
    where.stage = params.stage;
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
      { phone: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const { leads, total } = await dbListLeads(where, params);

  return {
    leads,
    pagination: {
      total,
      page: params.page,
      pageSize: params.pageSize,
      pages: Math.ceil(total / params.pageSize),
    },
  };
}

export async function createLead(profile: Profile, data: CreateLeadRequest) {
  return await prisma.$transaction(async (tx) => {
    const lead = await dbCreateLead(profile.id, data, tx);

    await ActivityService.create(
      [
        {
          leadId: lead.id,
          actorId: profile.id,
          type: ActivityType.LEAD_CREATED,
        },
      ],
      tx,
    );

    return lead;
  });
}

export async function getLead(profile: Profile, id: string) {
  const lead = await dbGetLeadById(id);

  if (!lead) return null;

  if (!hasLeadAccess(profile, lead.assignedToId)) {
    throw new Error("Access denied: You can only view leads assigned to you");
  }

  return lead;
}

export async function updateLead(
  profile: Profile,
  id: string,
  data: EditLeadRequest,
) {
  const existingLead = await dbGetLeadById(id);

  if (!existingLead) throw new Error("Lead not found");

  if (!hasLeadAccess(profile, existingLead.assignedToId)) {
    throw new Error("Access denied: You can only update leads assigned to you");
  }

  let newAssigneeName: string | undefined;
  if (data.assignedToId && data.assignedToId !== existingLead.assignedToId) {
    const newAssignee = await prisma.profile.findUnique({
      where: { id: data.assignedToId },
      select: { name: true },
    });
    newAssigneeName = newAssignee?.name;
  }

  const activities = buildLeadChangeActivities({
    leadId: id,
    actorId: profile.id,
    existingLead,
    newLead: data,
    oldAssigneeName: existingLead.assignedTo?.name,
    newAssigneeName,
  });

  return await prisma.$transaction(async (tx) => {
    const updatedLead = await dbUpdateLead(id, profile.id, data, tx);

    if (activities.length > 0) {
      const activitiesCreated = await ActivityService.create(activities, tx);
      if (!activitiesCreated.success) {
        throw new Error("Failed to create activities");
      }
    }

    return updatedLead;
  });
}

export async function deleteLead(profile: Profile, id: string) {
  const lead = await dbGetLeadById(id);

  if (!lead) throw new Error("Lead not found");

  if (profile.role !== Role.ADMIN && profile.role !== Role.MANAGER) {
    throw new Error("Access denied: Only admins and managers can delete leads");
  }

  return await dbDeleteLead(id);
}

export async function bulkReassignLeads(
  profile: Profile,
  data: { leadIds: string[]; assignToId: string },
) {
  if (profile.role !== Role.ADMIN && profile.role !== Role.MANAGER) {
    throw new Error("Access denied: Only admins and managers can reassign leads");
  }

  const targetAgent = await prisma.profile.findUnique({
    where: { id: data.assignToId },
    select: { id: true, name: true, isActive: true },
  });

  if (!targetAgent || !targetAgent.isActive) {
    throw new Error("Target agent not found or inactive");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current assignments for activity logging in one batch
    const currentLeads = await tx.lead.findMany({
      where: { id: { in: data.leadIds } },
      select: { id: true, assignedToId: true },
    });

    if (currentLeads.length === 0) return;

    // 2. Perform bulk update
    await tx.lead.updateMany({
      where: { id: { in: data.leadIds } },
      data: { assignedToId: data.assignToId },
    });

    // 3. Create activities in one batch
    const activities = currentLeads.map((lead) => ({
      leadId: lead.id,
      actorId: profile.id,
      type: ActivityType.ASSIGNMENT_CHANGE,
      meta: {
        from: lead.assignedToId || "unassigned",
        to: data.assignToId,
      },
      content: `Reassigned to ${targetAgent.name}`,
    }));

    const activityResult = await ActivityService.create(activities, tx);
    if (!activityResult.success) {
      throw new Error("Failed to log reassignment activities");
    }

    return { count: currentLeads.length };
  });
}
