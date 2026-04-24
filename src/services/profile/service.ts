import { dbGetProfileById, dbUpdateProfile } from "./db";
import { UpdateProfileSchema } from "./schema";
import { Profile } from "@/generated/prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getProfile(userId: string): Promise<Profile | null> {
  return dbGetProfileById(userId);
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileSchema,
  supabase?: SupabaseClient
): Promise<Profile> {
  // 1. Update Password if provided
  if (data.password && supabase) {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    if (error) throw error;
  }

  // 2. Update DB Profile if name provided
  if (data.name) {
    return dbUpdateProfile(userId, data);
  }

  // Return existing profile if no name update was made
  const profile = await dbGetProfileById(userId);
  if (!profile) throw new Error("Profile not found");
  return profile;
}
