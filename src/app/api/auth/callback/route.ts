import { supabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") || "invite";
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const client = await supabase();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (token_hash && type) {
    const client = await supabase();
    const { error } = await client.auth.verifyOtp({
      type: type as any,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If we reach here, either it was a hash-based login (client only) 
  // or something went wrong. Redirect to the client-side callback page
  // to handle hash fallback or show error.
  return NextResponse.redirect(`${origin}/callback?${searchParams.toString()}`);
}
