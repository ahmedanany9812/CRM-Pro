import { Lead } from "@/generated/prisma/client";
import { ActivityType } from "@/generated/prisma/enums";
import { CreateActivityRequest } from "@/services/activity";

interface BuildLeadChangeActivitiesParams {
  leadId: string;
  actorId: string;
  existingLead: any;
  newLead: any;
  oldAssigneeName?: string;
  newAssigneeName?: string;
}

export function buildLeadChangeActivities({
  leadId,
  actorId,
  existingLead,
  newLead,
  oldAssigneeName,
  newAssigneeName,
}: BuildLeadChangeActivitiesParams) {
  const activities: CreateActivityRequest[] = [];

  if (newLead.status && newLead.status !== existingLead.status) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STATUS_CHANGE,
      meta: {
        from: existingLead.status,
        to: newLead.status,
      },
    });
  }

  if (newLead.stage && newLead.stage !== existingLead.stage) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.STAGE_CHANGE,
      meta: {
        from: existingLead.stage,
        to: newLead.stage,
      },
    });
  }

  if (
    newLead.assignedToId !== undefined &&
    newLead.assignedToId !== existingLead.assignedToId
  ) {
    activities.push({
      leadId,
      actorId,
      type: ActivityType.ASSIGNMENT_CHANGE,
      meta: {
        from: oldAssigneeName || existingLead.assignedTo?.name || "Unassigned",
        to: newAssigneeName || "Unassigned",
      },
    });
  }

  return activities;
}
