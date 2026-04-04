import { NextResponse } from "next/server";
import { AuthenticationError } from "./authenticateUser";

export function handleRouteError(error: any) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
  }
  
  if (error.name === "ZodError") {
    return NextResponse.json({ success: false, error: error.flatten().fieldErrors }, { status: 400 });
  }

  // Handle other types of errors if necessary
  if (error.message === "Lead not found") {
    return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
  }

  console.error("Route Error:", error);
  return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
}
