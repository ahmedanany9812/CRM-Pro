import { Role } from "@/generated/prisma/enums";
import { UserSnapshot } from "@/utils/authenticateUser";
import { dbGetWonAndTotalLeads, dbGetTotalLeads, dbGetTotalLeadsByStage, dbGetTotalLeadsByStatus, dbGetOverdueRemindersCount, dbCountLeadsCreatedInRange, dbGetTopAgents } from "./db";
import { startOfUtcWeekSunday } from "./helpers";
import { getRoleBaseWhere } from "@/utils/security";

export async function getDashboardData(user: UserSnapshot) {
  const where = {
    ...getRoleBaseWhere(user),
  };

  const now = new Date();
  const thisWeekStartUtc = startOfUtcWeekSunday(now);
  const lastWeekStartUtc = new Date(thisWeekStartUtc);
  lastWeekStartUtc.setUTCDate(lastWeekStartUtc.getUTCDate() - 7);

  const [
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    newLeadsThisWeekCount,
    newLeadsLastWeekCount,
    { total: conversionTotal, won: conversionWon },
  ] = await Promise.all([
    dbGetTotalLeads(where),
    dbGetTotalLeadsByStage(where),
    dbGetTotalLeadsByStatus(where),
    dbGetOverdueRemindersCount(where),
    dbCountLeadsCreatedInRange(where, { gte: thisWeekStartUtc, lte: now }),
    dbCountLeadsCreatedInRange(where, {
      gte: lastWeekStartUtc,
      lt: thisWeekStartUtc,
    }),
    dbGetWonAndTotalLeads(where),
  ]);

  const percentChangeFromLastWeek =
    newLeadsLastWeekCount === 0
      ? null
      : ((newLeadsThisWeekCount - newLeadsLastWeekCount) /
          newLeadsLastWeekCount) *
        100;

  const conversionRate =
    conversionTotal === 0 ? 0 : (conversionWon / conversionTotal) * 100;

  return {
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    newLeadsThisWeek: {
      count: newLeadsThisWeekCount,
      lastWeekCount: newLeadsLastWeekCount,
      percentChangeFromLastWeek,
    },
    conversionRate: {
      percentage: conversionRate,
      won: conversionWon,
      total: conversionTotal,
    },
    topAgents: user.role !== Role.AGENT ? await dbGetTopAgents() : undefined,
  };
}
