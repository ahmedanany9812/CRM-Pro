import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { UpdateUserSchema } from "./schema";

export async function dbFindUserByEmail(email: string) {
  return await prisma.profile.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function dbFindUserById(id: string) {
  return await prisma.profile.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function dbListAllUsers(params: { skip: number; take: number }) {
  const [users, total] = await Promise.all([
    prisma.profile.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.profile.count(),
  ]);

  return { users, total };
}

export async function dbCreateProfile(data: {
  id: string;
  email: string;
  name: string;
  role: Role;
}) {
  return prisma.profile.create({
    data: {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function dbUpdateUser(id: string, data: UpdateUserSchema) {
  return prisma.profile.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function dbDeactivateUser(userId: string) {
  return prisma.profile.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function dbReactivateUser(userId: string) {
  return prisma.profile.update({
    where: { id: userId },
    data: { isActive: true },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}
