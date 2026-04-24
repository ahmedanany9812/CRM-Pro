"use client";

import { useEffect, Suspense } from "react";
import { supabase } from "../../../lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") ?? "/";

    const handleAuth = async () => {
      let timeout: NodeJS.Timeout;
      let subscription: any;
      console.log("Auth Callback: Starting verification...");
      console.log("Current URL:", window.location.href);

      // 1. Immediate check for existing session
      const { data: { session: immediateSession } } = await supabase.auth.getSession();
      if (immediateSession) {
        console.log("Auth Callback: Immediate session found, redirecting...");
        router.push(next);
        router.refresh();
        return;
      }

      // 2. Handle token_hash from query (for invites)
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      console.log("Auth Callback: Query params -", { token_hash: !!token_hash, type });

      if (token_hash && type) {
        console.log("Auth Callback: Attempting verifyOtp...");
        const { error } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        });

        if (!error) {
          console.log("Auth Callback: verifyOtp successful, redirecting...");
          cleanup();
          router.push(next);
          router.refresh();
          return;
        } else {
          console.error("Auth Callback: verifyOtp error:", error);
        }
      }

      // 3. Handle access_token from Hash (Manual fallback)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      if (access_token && refresh_token) {
        console.log("Auth Callback: Hash tokens detected, forcing setSession...");
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!error) {
          console.log("Auth Callback: setSession successful, redirecting...");
          cleanup();
          router.push(next);
          router.refresh();
          return;
        } else {
          console.error("Auth Callback: setSession error:", error);
        }
      }

      // 4. Fallback listener
      console.log("Auth Callback: Waiting for onAuthStateChange...");
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth Callback: onAuthStateChange event:", event, !!session);
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
          console.log("Auth Callback: Auth state change success, redirecting...");
          cleanup();
          router.push(next);
          router.refresh();
        }
      });
      subscription = authSubscription;

      // 5. Extended Timeout/Fallback
      timeout = setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Auth Callback: Timeout reached, final session check:", !!session);
        if (session) {
          cleanup();
          router.push(next);
          router.refresh();
        } else if (!token_hash && !access_token) {
          console.error("Auth Callback: No session found after 10s");
          router.push("/login?error=Session could not be established. Link may be expired.");
        }
      }, 10000);

      function cleanup() {
        if (subscription) subscription.unsubscribe();
        if (timeout) clearTimeout(timeout);
      }

      return cleanup;
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="relative flex items-center justify-center h-screen bg-background overflow-hidden">
      {/* Decorative Mesh Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.05),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(var(--primary-rgb),0.05),transparent_50%)]" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-primary/5 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center pt-12 pb-10 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight text-primary">
            Finalizing Login
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
            Establishing Secure Connection
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-12 text-center">
          <p className="text-sm text-muted-foreground">
            Please wait while we verify your invitation and prepare your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
