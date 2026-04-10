import { AISchema, AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser();
    const body = await req.json();

    const validatedRequest = AISchema.saveLeadBrief.parse(body);

    const savedBrief = await AIService.saveLeadBrief(validatedRequest, profile as any);

    return NextResponse.json({ success: true, data: savedBrief });
  } catch (error) {
    return handleRouteError(error);
  }
}
