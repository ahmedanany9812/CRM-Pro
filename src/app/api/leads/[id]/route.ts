import { NextResponse } from "next/server";
import { authenticateUser, AuthenticationError } from "@/utils/authenticateUser";
import { 
  getLead, 
  updateLead, 
  deleteLead 
} from "@/services/lead/service";
import { editLeadSchema } from "@/services/lead/schema";

/**
 * GET /api/leads/[id]
 * Fetch a single lead by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await authenticateUser();
    const { id } = await params;

    const lead = await getLead(profile, id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("GET /api/leads/[id] error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/leads/[id]
 * Update a lead's details. Role-scoped.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await authenticateUser();
    const { id } = await params;
    
    const body = await request.json();
    const data = editLeadSchema.parse(body);

    const lead = await updateLead(profile, id, data);
    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete a lead. Manager/Admin only.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await authenticateUser();
    const { id } = await params;

    await deleteLead(profile, id);
    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
