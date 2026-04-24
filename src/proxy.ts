import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { supabase, response: supabaseResponse } = createClient(request);

  // Use getUser() for secure session validation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/leads") ||
    request.nextUrl.pathname.startsWith("/reminders") ||
    request.nextUrl.pathname.startsWith("/users");

  if (user) {
    // If user is logged in, check if they are active
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { isActive: true },
    });

    if (profile && !profile.isActive) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("message", "Your account is inactive.");
      return NextResponse.redirect(url);
    }

    // If logged in and trying to access login page, redirect to home
    if (request.nextUrl.pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  } else if (isProtectedRoute) {
    // If not logged in and accessing protected route, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
