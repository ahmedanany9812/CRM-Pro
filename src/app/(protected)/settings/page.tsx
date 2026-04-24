"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, User, ShieldCheck } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/lib/tanstack/useProfile";

export default function SettingsPage() {
  const { data: profile, isLoading: isFetching } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync local name state with profile data
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await updateProfile.mutateAsync({ 
        name, 
        password: password || undefined, 
        confirmPassword: confirmPassword || undefined 
      });
      toast.success("Settings updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    }
  };

  return (
    <div className="p-8 w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Update your personal information and security preferences in one place.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Settings Card */}
        <Card className="lg:col-span-2 shadow-lg border-primary/5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="size-4 text-primary" />
              </div>
              <CardTitle className="text-lg">General Settings</CardTitle>
            </div>
            <CardDescription>
              Manage your public name and account password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-primary/10"
                    disabled={isFetching}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">New Password (optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-primary/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 border-primary/10"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  className="px-8" 
                  disabled={updateProfile.isPending || isFetching}
                >
                  {updateProfile.isPending ? "Saving..." : "Save All Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info/Stats Card (Aesthetic) */}
        <div className="space-y-4">
          <Card className="shadow-lg border-primary/5 bg-linear-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="size-4 text-primary" />
                <CardTitle className="text-sm font-medium">
                  Security Status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    Session Security
                  </p>
                  <p className="text-sm font-medium text-emerald-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Connection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/5 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <User className="size-4 text-primary" />
                <CardTitle className="text-sm font-medium">
                  Profile Integrity
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your profile data is encrypted and synced across all your
                devices securely.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
