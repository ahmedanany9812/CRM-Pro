import { Role } from "@/generated/prisma/enums";
import { 
  dbListLeads, 
  dbCreateLead, 
  dbUpdateLead, 
  dbGetLeadById, 
  dbDeleteLead 
} from "./db";
import { 
  ListLeadsParams, 
  CreateLeadRequest, 
  EditLeadRequest 
} from "./schema";
import { Prisma, Profile } from "@/generated/prisma/client";

/**
 * Service layer for Leads.
 * Handles business rules and authorization scoping.
 */

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  const where: Prisma.LeadWhereInput = {};
  
  // Scoping: Agents can only see leads assigned to them.
  // Managers and Admins can see all leads.
  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
}

export async function createLead(profile: Profile, data: CreateLeadRequest) {
  // Business Rule: Authorization is handled at the route level (Admin/Manager).
  return dbCreateLead(profile.id, data);
}

export async function getLead(profile: Profile, id: string) {
  const lead = await dbGetLeadById(id);
  
  if (!lead) return null;

  // Scoping: Agents can only fetch leads assigned to them.
  if (profile.role === Role.AGENT && lead.assignedToId !== profile.id) {
    throw new Error("Access denied: You can only view leads assigned to you");
  }

  return lead;
}

export async function updateLead(profile: Profile, id: string, data: EditLeadRequest) {
  const lead = await dbGetLeadById(id);

  if (!lead) throw new Error("Lead not found");

  // Scoping: Agents can only update leads assigned to them.
  if (profile.role === Role.AGENT && lead.assignedToId !== profile.id) {
    throw new Error("Access denied: You can only update leads assigned to you");
  }

  return dbUpdateLead(id, profile.id, data);
}

export async function deleteLead(profile: Profile, id: string) {
  const lead = await dbGetLeadById(id);

  if (!lead) throw new Error("Lead not found");

  // Business Rule: Only managers and admins can delete leads.
  if (profile.role !== Role.ADMIN && profile.role !== Role.MANAGER) {
    throw new Error("Access denied: Only admins and managers can delete leads");
  }

  return dbDeleteLead(id);
}
