import { NextResponse } from "next/server";
import { AuthenticationError } from "./authenticateUser";
import { AdminServiceError } from "@/services/admin";

export function handleRouteError(error: any) {
  if (
    error instanceof AuthenticationError ||
    error instanceof AdminServiceError
  ) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode },
    );
  }

  if (error.name === "ZodError" || error.constructor.name === "ZodError") {
    return NextResponse.json(
      { success: false, error: error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (error.message === "Lead not found") {
    return NextResponse.json(
      { success: false, error: "Lead not found" },
      { status: 404 },
    );
  }

  console.error("Route Error:", error);
  return NextResponse.json(
    { success: false, error: error.message || "Internal Server Error" },
    { status: 500 },
  );
}
