import { AIService } from "@/services/ai";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = await params;

    const brief = await AIService.getLastLeadBrief(id, profile as any);

    return NextResponse.json({ success: true, data: brief });
  } catch (error) {
    return handleRouteError(error);
  }
}
