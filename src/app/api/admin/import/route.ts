import { NextRequest, NextResponse } from "next/server";
import { ImportExportService, ImportExportSchema } from "@/services/import-export";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { Role } from "@/generated/prisma/enums";

/**
 * POST /api/admin/import
 * Processes a batch of leads from a CSV. Gated by ADMIN role.
 */
export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser([Role.ADMIN]);
    const body = await req.json();
    
    // Server-side validation of the whole batch
    const { rows } = ImportExportSchema.import.request.parse(body);
    
    const summary = await ImportExportService.import.process(rows, profile);
    
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return handleRouteError(error);
  }
}
