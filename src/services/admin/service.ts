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
      email_confirm: true,
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

  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: data.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });

  if (linkError || !linkData.properties?.action_link) {
    console.error("Magic Link Error:", linkError);
    return profile;
  }

  try {
    const magicLink = linkData.properties.action_link;
    await resend.emails.send({
      from: "Whispyr CRM <onboarding@resend.dev>",
      to: data.email,
      subject: "You're invited to Whispyr CRM",
      html: generateInviteEmailHTML(data.name, magicLink),
    });
  } catch (error) {
    console.error("Email Sending Error:", error);
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

  const supabaseAdmin = createSupabaseAdmin();

  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });

  if (linkError || !linkData.properties?.action_link) {
    console.error("Magic Link Error (Resend Invite):", linkError);
    throw new AdminServiceError(
      linkError?.message || "Failed to generate invitation link",
      500,
    );
  }

  const magicLink = linkData.properties.action_link;
  await resend.emails.send({
    from: "Whispyr CRM <onboarding@resend.dev>",
    to: user.email,
    subject: "Reminder: You're invited to Whispyr CRM",
    html: generateInviteEmailHTML(user.name, magicLink),
  });

  return { success: true, email: user.email };
}
