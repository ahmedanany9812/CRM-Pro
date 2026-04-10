import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { LeadStatus, Role, ReminderStatus } from "@/generated/prisma/enums";
import { startOfDay, endOfDay } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function SectionCards() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  });

  if (!profile) return null;

  const today = new Date();
  
  // Define global filters for different roles
  const baseWhere = profile.role === Role.AGENT 
    ? { assignedToId: user.id } 
    : {};

  const [totalLeads, inProgressLeads, wonLeads, remindersToday] = await Promise.all([
    prisma.lead.count({ 
      where: baseWhere 
    }),
    prisma.lead.count({ 
      where: { ...baseWhere, status: LeadStatus.OPEN } 
    }),
    prisma.lead.count({ 
      where: { ...baseWhere, status: LeadStatus.WON } 
    }),
    prisma.reminder.count({
      where: {
        assignedToId: user.id,
        status: ReminderStatus.PENDING,
        dueAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      }
    })
  ]);

  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="@container/card shadow-sm hover:shadow-md transition-shadow border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-xs uppercase tracking-wider">Total Leads</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {totalLeads}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-[11px] text-muted-foreground/60 font-medium pb-4">
            Total pipeline volume
          </CardFooter>
        </Card>
        
        <Card className="@container/card shadow-sm hover:shadow-md transition-shadow border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">In Progress</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {inProgressLeads}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-[11px] text-muted-foreground/60 font-medium pb-4">
            Active deals awaiting action
          </CardFooter>
        </Card>

        <Card className="@container/card shadow-sm hover:shadow-md transition-shadow border-emerald-500/10">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Won Leads</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {wonLeads}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-[11px] text-muted-foreground/60 font-medium pb-4">
            Successfully closed deals
          </CardFooter>
        </Card>
      </div>

      {/* Action Center Section */}
      <div className="p-6 rounded-2xl border bg-orange-500/5 border-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:bg-orange-500/[0.07]">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-600 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-foreground">
              You have {remindersToday} {remindersToday === 1 ? 'task' : 'tasks'} due today
            </h3>
            <p className="text-sm text-muted-foreground/80 font-medium">
              Check your schedule and keep your lead momentum going.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="border-orange-500/20 hover:bg-orange-500/10 gap-2 font-bold px-6 py-5 rounded-xl shadow-sm transition-all group">
          <Link href="/reminders">
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
