import { NextResponse } from "next/server";
import { AuthenticationError } from "./authenticateUser";
import { AdminServiceError } from "@/services/admin";
import { AttachmentServiceError } from "@/services/attachments/service";

export function handleRouteError(error: unknown) {
  if (
    error instanceof AuthenticationError ||
    error instanceof AdminServiceError ||
    error instanceof AttachmentServiceError
  ) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode },
    );
  }

  const err = error as {
    name?: string;
    message?: string;
    statusCode?: number;
    constructor?: { name: string };
    flatten?: () => { fieldErrors: Record<string, string[]> };
  };

  if (err.name === "ZodError" || err.constructor?.name === "ZodError") {
    return NextResponse.json(
      { success: false, error: err.flatten?.().fieldErrors },
      { status: 400 },
    );
  }

  if (err.message === "Lead not found") {
    return NextResponse.json(
      { success: false, error: "Lead not found" },
      { status: 404 },
    );
  }

  console.error("Route Error:", error);
  return NextResponse.json(
    { success: false, error: err.message || "Internal Server Error" },
    { status: err.statusCode || 500 },
  );
}
