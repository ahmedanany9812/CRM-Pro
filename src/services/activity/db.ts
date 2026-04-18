import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function dbCreateActivities(
  activities: Prisma.ActivityCreateManyInput[],
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return await client.activity.createMany({
    data: activities,
  });
}

export async function dbCreateActivity(
  activity: Prisma.ActivityCreateInput,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return await client.activity.create({
    data: activity,
  });
}

export async function dbGetLeadActivities(
  where: Prisma.ActivityWhereInput,
  params: {
    page: number;
    pageSize: number;
  },
) {
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        content: true,
        type: true,
        createdAt: true,
        id: true,
        actor: {
          select: {
            name: true,
          },
        },
      },
      take: params.pageSize,
      skip: (params.page - 1) * params.pageSize,
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    activities,
    total,
  };
}
