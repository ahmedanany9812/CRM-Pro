import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "./schema";
import { Prisma } from "@/generated/prisma/client";

export async function dbGetProfileById(id: string) {
  return prisma.profile.findUnique({
    where: { id },
  });
}

export async function dbUpdateProfile(
  id: string,
  data: UpdateProfileSchema,
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;
  return client.profile.update({
    where: { id },
    data: {
      name: data.name,
    },
  });
}
