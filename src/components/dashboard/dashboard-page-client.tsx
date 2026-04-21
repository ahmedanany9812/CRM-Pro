"use client";

import { useDashboardOverview } from "@/lib/tanstack/useDashboardOverview";
import { AlertCircle, Percent, UserPlus, Users } from "lucide-react";
import { useMemo } from "react";
import KpiCard from "./KpiCard";
import { Role } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import ByStageBreakdown from "./ByStageBreakdown";
import ByStatusDistribution from "./ByStatusDistribution";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function formatWeekOverWeekSubtext(
  percentChange: number | null,
): string | undefined {
  if (percentChange === null) {
    return "No prior week data";
  }
  const sign = percentChange > 0 ? "+" : "";
  return `${sign}${percentChange.toFixed(1)}% vs last week`;
}

export function DashboardPageClient({ role }: { role: Role }) {
  const { data, isLoading, error } = useDashboardOverview();

  const { subHeaderText, chartsGridStyle } = useMemo(() => {
    return {
      subHeaderText: "Review the current state of the pipeline in your organization.",
      chartsGridStyle: "lg:grid-cols-4",
    };
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data)
    return (
      <div className="p-8 text-center text-destructive font-medium">
        Error: {error?.message ?? "Unknown error"}
      </div>
    );

  return (
    <div className="space-y-10 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl opacity-30 pointer-events-none" />

      <div className="space-y-3">
        <h1 className="text-5xl font-black tracking-tight bg-linear-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent pb-1">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2 tracking-wide uppercase">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          {subHeaderText}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Leads"
          value={data.totalLeads}
          icon={<Users className="h-5 w-5 text-primary/80" />}
        />
        <KpiCard
          label="New Leads"
          value={data.newLeadsThisWeek.count}
          icon={<UserPlus className="h-5 w-5 text-primary/80" />}
          subValue={formatWeekOverWeekSubtext(
            data.newLeadsThisWeek.percentChangeFromLastWeek,
          )}
        />
        <KpiCard
          label="Conversion Rate"
          value={`${data.conversionRate.percentage.toFixed(1)}%`}
          icon={<Percent className="h-5 w-5 text-primary/80" />}
          subValue={`${data.conversionRate.won} won / ${data.conversionRate.total} total`}
        />
        <KpiCard
          label="Overdue Reminders"
          value={data.overdueRemindersCount}
          icon={<AlertCircle className="h-5 w-5 text-destructive/80" />}
        />
      </div>

      <div className={cn("grid gap-8", chartsGridStyle)}>
        <ByStageBreakdown data={data.totalLeadsByStage} />
        <ByStatusDistribution data={data.totalLeadsByStatus} />
      </div>

      {role !== "AGENT" && data.topAgents && data.topAgents.length > 0 && (
          <Card className="col-span-1 lg:col-span-4 border-none shadow-xl bg-linear-to-br from-card to-card/50 overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold tracking-tight">Top Performing Agents</CardTitle>
                <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">
                  Active This Period
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {data.topAgents.map((agent) => (
                <div key={agent.id} className="group relative p-5 rounded-2xl border border-border/50 bg-background/40 transition-all duration-300">
                  <p className="text-base font-bold">{agent.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black tabular-nums">{agent.wonCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      Wins / {agent.leadsCount} Total
                    </span>
                  </div>
                  <div className="mt-4 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-primary to-primary/60 transition-all duration-1000 ease-out" 
                      style={{ width: `${(agent.wonCount / (agent.leadsCount || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
}
