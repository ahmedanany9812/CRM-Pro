"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message") || searchParams.get("error");
    if (message) {
      toast.error(message);
      // Clear the message from the URL using Next.js router
      router.replace("/login");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-background overflow-hidden">
      {/* Decorative Mesh Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.05),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(var(--primary-rgb),0.05),transparent_50%)]" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-primary/5 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center pt-10 pb-6 space-y-1">
          <CardTitle className="text-5xl font-bold tracking-tight text-primary">
            CRM Pro
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
            Enterprise Client Management
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                Authorized Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-background/50 border-primary/10 focus-visible:ring-primary/20 transition-all rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" title="Enter your secure password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                Access Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-background/50 border-primary/10 focus-visible:ring-primary/20 transition-all rounded-xl"
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl text-destructive text-xs font-semibold animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold h-12 text-sm uppercase tracking-widest transition-all rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                "Establish Session"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
