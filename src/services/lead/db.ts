import { prisma } from "@/lib/prisma";
import { 
  ActivityType, 
} from "@/generated/prisma/enums";
import { 
  CreateLeadRequest, 
  EditLeadRequest, 
  ListLeadsParams 
} from "./schema";
import { Prisma } from "@/generated/prisma/client";

export async function dbListLeads(
  where: Prisma.LeadWhereInput,
  params: ListLeadsParams
) {
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total };
}

export async function dbCreateLead(
  actorId: string, 
  data: CreateLeadRequest,
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;
  return await client.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
  });
}

export async function dbUpdateLead(
  id: string,
  actorId: string,
  data: EditLeadRequest,
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;
  return await client.lead.update({
    where: { id },
    data,
  });
}

export async function dbGetLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      reminders: {
        orderBy: {
          dueAt: "asc",
        },
      },
      notifications: {
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function dbDeleteLead(id: string) {
  return prisma.lead.delete({
    where: { id },
  });
}
