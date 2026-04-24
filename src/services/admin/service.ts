import { v4 as uuidv4 } from "uuid";
import { createClient as createSupabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { generateInviteEmailHTML } from "./helpers";
import {
  dbCreateProfile,
  dbDeactivateUser,
  dbFindUserByEmail,
  dbFindUserById,
  dbListAllUsers,
  dbReactivateUser,
  dbUpdateUser,
} from "./db";
import {
  CreateUserSchema,
  UpdateUserSchema,
  ListUsersPaginatedSchema,
} from "./schema";
import { Profile } from "@/generated/prisma/client";

export class AdminServiceError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AdminServiceError";
  }
}

/**
 * Internal helper to generate a magic link and send an invitation email via Resend.
 */
async function sendInvitationEmail(params: {
  email: string;
  name: string;
  type: "invite" | "magiclink" | "recovery";
  isReminder?: boolean;
}) {
  const supabaseAdmin = createSupabaseAdmin();
  const { email, type: preferredType } = params;
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/callback`;
  const options = { redirectTo: redirectUrl };

  let result;
  try {
    // We always prefer 'invite' type for fresh users to get token_hash benefits
    result = await supabaseAdmin.auth.admin.generateLink({ 
      type: preferredType, 
      email, 
      options 
    });
    
    if (result.error?.message?.includes("already been registered")) {
      // Fallback to magiclink if user exists
      result = await supabaseAdmin.auth.admin.generateLink({ 
        type: "magiclink", 
        email, 
        options 
      });
    }
  } catch (err) {
    console.error("Link Generation Exception:", err);
    throw new AdminServiceError("Failed to generate authentication link", 500);
  }

  const { data: linkData, error: linkError } = result;

  if (linkError || !linkData.properties?.action_link) {
    console.error("Link Generation Error:", linkError);
    throw new AdminServiceError(
      linkError?.message || "Failed to generate authentication link",
      500,
    );
  }

  const magicLink = linkData.properties.action_link;
  const subject = params.isReminder
    ? "Reminder: You're invited to Whispyr CRM"
    : "You're invited to Whispyr CRM";

  try {
    await resend.emails.send({
      from: "Whispyr CRM <onboarding@resend.dev>",
      to: params.email,
      subject,
      html: generateInviteEmailHTML(params.name, magicLink, params.isReminder),
    });
  } catch (error) {
    console.error("Email Sending Error:", error);
  }

  return { magicLink };
}

export async function createUser(data: CreateUserSchema) {
  const existingUser = await dbFindUserByEmail(data.email);
  if (existingUser) {
    throw new AdminServiceError("A user with this email already exists", 409);
  }
  const supabaseAdmin = createSupabaseAdmin();
  const tempPassword = uuidv4();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: false,
      user_metadata: { name: data.name },
    });

  if (authError || !authData.user) {
    console.error("Supabase Auth Error:", authError);
    throw new AdminServiceError(
      authError?.message || "Failed to create authentication account",
      500,
    );
  }

  let profile: Profile;
  try {
    profile = (await dbCreateProfile({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
    })) as Profile;
  } catch (error) {
    console.error("Prisma Profile Error:", error);
    throw new AdminServiceError(
      "Auth account created but failed to create profile record",
      500,
    );
  }

  try {
    await sendInvitationEmail({
      email: data.email,
      name: data.name,
      type: "invite",
    });
  } catch (error) {
    console.error("Post-creation invitation error:", error);
  }

  return profile;
}

export async function listUsers(params: ListUsersPaginatedSchema) {
  const skip = (params.page - 1) * params.pageSize;
  return await dbListAllUsers({ skip, take: params.pageSize });
}

export async function getUserById(id: string) {
  const user = await dbFindUserById(id);
  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }
  return user;
}

export async function updateUserById(
  adminId: string,
  targetUserId: string,
  data: UpdateUserSchema,
) {
  if (adminId === targetUserId && data.role) {
    throw new AdminServiceError("You cannot change your own role", 400);
  }

  const user = await dbFindUserById(targetUserId);
  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }

  return await dbUpdateUser(targetUserId, data);
}

export async function deactivateUser(adminId: string, targetUserId: string) {
  if (adminId === targetUserId) {
    throw new AdminServiceError("You cannot deactivate yourself", 400);
  }

  const user = await dbFindUserById(targetUserId);
  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }

  if (!user.isActive) {
    throw new AdminServiceError("User is already inactive", 400);
  }

  return await dbDeactivateUser(targetUserId);
}

export async function reactivateUser(targetUserId: string) {
  const user = await dbFindUserById(targetUserId);
  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }

  if (user.isActive) {
    throw new AdminServiceError("User is already active", 400);
  }

  return await dbReactivateUser(targetUserId);
}

export async function resendInvite(targetUserId: string) {
  const user = await dbFindUserById(targetUserId);
  if (!user) {
    throw new AdminServiceError("User not found", 404);
  }

  if (user.isActive && false) {
    // If we wanted to prevent resending to active users, we'd do it here.
    // However, some systems allow resending if the user lost their access.
    // For now, let's just ensure we use the correct helper.
  }

  await sendInvitationEmail({
    email: user.email,
    name: user.name,
    type: "invite",
    isReminder: true,
  });

  return { success: true, email: user.email };
}
