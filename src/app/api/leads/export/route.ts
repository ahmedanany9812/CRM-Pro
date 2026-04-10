import { NextRequest } from "next/server";
import { ImportExportService } from "@/services/import-export";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";

/**
 * GET /api/leads/export
 * Exports leads to CSV. 
 * Role-scoped: Agents export their own leads, Managers/Admins everything.
 */
export async function GET(req: NextRequest) {
  try {
    const profile = await authenticateUser([Role.AGENT, Role.MANAGER, Role.ADMIN]);
    
    const csv = await ImportExportService.export.process(profile);
    
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
