import { Role } from "@/generated/prisma/enums";
import {
  dbListLeads,
  dbCreateLead,
  dbUpdateLead,
  dbGetLeadById,
  dbDeleteLead,
} from "./db";
import { ListLeadsParams, CreateLeadRequest, EditLeadRequest } from "./schema";
import { Prisma, Profile } from "@/generated/prisma/client";
import { ActivityType } from "@/generated/prisma/enums";

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  const where: Prisma.LeadWhereInput = {};

  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
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

  if (profile.role === Role.AGENT && lead.assignedToId !== profile.id) {
    throw new Error("Access denied: You can only view leads assigned to you");
  }

  return lead;
}

import { ActivityService } from "@/services/activity";
import { buildLeadChangeActivities } from "./helpers";
import { prisma } from "@/lib/prisma";

export async function updateLead(
  profile: Profile,
  id: string,
  data: EditLeadRequest,
) {
  const existingLead = await dbGetLeadById(id);

  if (!existingLead) throw new Error("Lead not found");

  if (profile.role === Role.AGENT && existingLead.assignedToId !== profile.id) {
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
    oldAssigneeName: (existingLead as any).assignedTo?.name,
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

  return dbDeleteLead(id);
}
