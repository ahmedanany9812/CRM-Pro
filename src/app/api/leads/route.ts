import { NextResponse } from "next/server";
import { authenticateUser, AuthenticationError } from "@/utils/authenticateUser";
import { 
  listLeads, 
  createLead 
} from "@/services/lead/service";
import { 
  listLeadsQuerySchema, 
  createLeadSchema 
} from "@/services/lead/schema";
import { Role } from "@/generated/prisma/enums";

/**
 * GET /api/leads
 * Fetch leads with role-based scoping and pagination.
 */
export async function GET(request: Request) {
  try {
    const profile = await authenticateUser();
    
    // Parse query params for pagination
    const { searchParams } = new URL(request.url);
    const params = listLeadsQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search") || undefined,
      stage: searchParams.get("stage") || undefined,
      status: searchParams.get("status") || undefined,
    });

    const { leads, pagination } = await listLeads(profile, params);
    return NextResponse.json({ success: true, data: leads, pagination });
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/leads
 * Create a new lead. Only Managers and Admins.
 */
export async function POST(request: Request) {
  try {
    const profile = await authenticateUser([Role.ADMIN, Role.MANAGER]);
    
    const body = await request.json();
    const data = createLeadSchema.parse(body);

    const lead = await createLead(profile, data);
    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
