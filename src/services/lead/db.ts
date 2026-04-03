import { prisma } from "@/lib/prisma";
import { 
  ActivityType, 
} from "@/generated/prisma/enums";
import { 
  CreateLeadRequest, 
  EditLeadRequest, 
  ListLeadsParams 
} from "./schema";
import { Prisma } from "@/generated/prisma/client";

/**
 * Pure database layer for Leads.
 * Handles atomic transactions for Leads and related Activities.
 */

export async function dbListLeads(
  where: Prisma.LeadWhereInput,
  params: ListLeadsParams
) {
  return prisma.lead.findMany({
    where,
    take: params.pageSize,
    skip: (params.page - 1) * params.pageSize,
    orderBy: { createdAt: "desc" },
  });
}

export async function dbCreateLead(actorId: string, data: CreateLeadRequest) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the Lead
    const lead = await tx.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });

    // 2. Log creation activity
    await tx.activity.create({
      data: {
        leadId: lead.id,
        actorId: actorId,
        type: ActivityType.LEAD_CREATED,
        content: data.note || `Lead created by user ${actorId}`,
      },
    });

    return lead;
  });
}

export async function dbUpdateLead(
  id: string,
  actorId: string,
  data: EditLeadRequest
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get current lead state to log specific changes
    const currentLead = await tx.lead.findUnique({
      where: { id },
    });

    if (!currentLead) {
      throw new Error("Lead not found");
    }

    // 2. Perform the update
    const updatedLead = await tx.lead.update({
      where: { id },
      data,
    });

    // 3. Log activities for changed fields (status/stage/assigned)
    const activities = [];

    // Status Change
    if (data.status && data.status !== currentLead.status) {
      activities.push({
        leadId: id,
        actorId,
        type: ActivityType.STATUS_CHANGE,
        content: `Status changed from ${currentLead.status} to ${data.status}`,
        metadata: { from: currentLead.status, to: data.status },
      });
    }

    // Stage Change
    if (data.stage && data.stage !== currentLead.stage) {
      activities.push({
        leadId: id,
        actorId,
        type: ActivityType.STAGE_CHANGE,
        content: `Stage changed from ${currentLead.stage} to ${data.stage}`,
        metadata: { from: currentLead.stage, to: data.stage },
      });
    }

    // Assignment Change
    if (data.assignedToId !== undefined && data.assignedToId !== currentLead.assignedToId) {
      activities.push({
        leadId: id,
        actorId,
        type: ActivityType.ASSIGNMENT_CHANGE,
        content: `Lead assignedToId changed from ${currentLead.assignedToId || "None"} to ${data.assignedToId || "None"}`,
        metadata: { from: currentLead.assignedToId, to: data.assignedToId },
      });
    }

    if (activities.length > 0) {
      await tx.activity.createMany({
        data: activities,
      });
    } else if (Object.keys(data).length > 0) {
       // Log a generic update if no specific tracked fields changed but other data did
       await tx.activity.create({
         data: {
           leadId: id,
           actorId,
           type: ActivityType.NOTE,
           content: "Lead details updated",
         }
       });
    }

    return updatedLead;
  });
}

export async function dbGetLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
  });
}

export async function dbDeleteLead(id: string) {
  return prisma.lead.delete({
    where: { id },
  });
}
