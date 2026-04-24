import { NextRequest } from "next/server";
import { ImportExportService } from "@/services/import-export";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";

import { listLeadsQuerySchema } from "@/services/lead/schema";

/**
 * GET /api/leads/export
 * Exports leads to CSV. 
 * Role-scoped: Agents export their own leads, Managers/Admins everything.
 */
export async function GET(req: NextRequest) {
  try {
    const profile = await authenticateUser([Role.AGENT, Role.MANAGER, Role.ADMIN]);
    
    // Parse filters from URL
    const { searchParams } = new URL(req.url);
    const filters = listLeadsQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      stage: searchParams.get("stage") || undefined,
      status: searchParams.get("status") || undefined,
    });

    const csv = await ImportExportService.export.process(profile, filters);
    
    const date = new Date().toISOString().split("T")[0];
    const filename = `leads-export-${date}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
