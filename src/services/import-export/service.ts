import { Profile, Prisma } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { CSVLeadRow, ImportSummary } from "./schema";
import { dbFindProfileByEmail } from "./db";
import * as LeadService from "@/services/lead/service";
import { buildCSVString } from "./helpers";

/**
 * Processes a batch of validated CSV rows.
 * Resolves assignees by email and creates leads using LeadService.
 */
export async function processImport(
  rows: CSVLeadRow[],
  importerProfile: Profile
): Promise<ImportSummary> {
  let importedCount = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      // Resolve assignee by email (if provided)
      let assignedToId: string | undefined;
      if (row.assigneeEmail) {
        const assignee = await dbFindProfileByEmail(row.assigneeEmail);

        if (!assignee) {
          errors.push(`Row (${row.phone}): Assignee "${row.assigneeEmail}" not found`);
          continue;
        }
        if (!assignee.isActive) {
          errors.push(`Row (${row.phone}): Assignee "${row.assigneeEmail}" is deactivated`);
          continue;
        }
        assignedToId = assignee.id;
      }

      // Create lead (reuses LeadService — activities get logged automatically)
      // Note: LeadService.createLead takes CreateLeadRequest which matches CSVLeadRow largely
      // but we need to pass assignedToId if resolved
      const lead = await LeadService.createLead(importerProfile, {
        phone: row.phone,
        name: row.name,
        email: row.email || undefined,
      });

      // Reassign if assignee was specified
      if (assignedToId) {
        await LeadService.updateLead(importerProfile, lead.id, { assignedToId });
      }

      importedCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Row (${row.phone}): ${message}`);
    }
  }

  return { importedCount, totalProcessed: rows.length, errors };
}

/**
 * Exports leads to a CSV string.
 * Role-scoped: Agents only get their own leads, Managers/Admins get everything.
 */
export async function processExport(profile: Profile): Promise<string> {
  const where: Prisma.LeadWhereInput =
    profile.role === Role.AGENT ? { assignedToId: profile.id } : {};

  const leads = await prisma.lead.findMany({
    where,
    select: {
      phone: true,
      name: true,
      email: true,
      assignedTo: { select: { email: true } },
      stage: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = leads.map((lead) => ({
    phone: lead.phone,
    name: lead.name,
    email: lead.email ?? "",
    assigneeEmail: lead.assignedTo?.email ?? "",
    stage: lead.stage,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
  }));

  return buildCSVString(
    rows,
    ["phone", "name", "email", "assigneeEmail", "stage", "status", "createdAt"]
  );
}
