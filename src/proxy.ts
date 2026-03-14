import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SupabaseServerClient } from "../lib/supabase/server";

export async function proxy(request: NextRequest) {
  const { data } = await (await SupabaseServerClient()).auth.getUser();
  if (!data.user && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (data.user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/*"],
};
