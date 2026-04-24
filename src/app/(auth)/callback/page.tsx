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

import { useMutation } from "@tanstack/react-query";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const authMutation = useMutation({
    mutationFn: async () => {
      const next = searchParams.get("next") ?? "/";
      
      // 1. Check for tokens in hash (Client-side only)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!error) return next;
      }

      // 2. Check for existing session as fallback
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return next;

      throw new Error("No session found");
    },
    onSuccess: (next) => {
      router.push(next);
      router.refresh();
    },
    onError: () => {
      router.push("/login?error=Session could not be established. Link may be expired.");
    }
  });

  // Trigger verification once on mount without raw useEffect if possible, 
  // but useEffect is still fine for "on mount" in client components.
  // We'll use a single effect to trigger the mutation.
  useEffect(() => {
    authMutation.mutate();
  }, []);

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
            Please wait while we verify your invitation and prepare your
            dashboard.
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
