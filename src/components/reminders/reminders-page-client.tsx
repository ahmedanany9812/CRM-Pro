"use client";

import { useState } from "react";
import { 
  useGetMyReminders, 
  useUpdateReminder 
} from "@/lib/tanstack/useReminders";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isPast } from "date-fns";
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CreateReminderDialog } from "./CreateReminderDialog";
import { Pagination } from "@/components/leads/lead-details/Pagination";

export function RemindersPageClient() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  const { data, isLoading } = useGetMyReminders({
    page,
    pageSize,
    status: (activeTab === "ALL" || activeTab === "OVERDUE" || activeTab === "UPCOMING") 
      ? undefined 
      : (activeTab as any),
    overdue: activeTab === "OVERDUE" ? true : activeTab === "UPCOMING" ? false : undefined,
  });

  const updateMutation = useUpdateReminder();

  const handleCancel = (id: string) => {
    updateMutation.mutate({ 
      id,
      data: { status: "CANCELLED" }
    }, {
      onSuccess: () => toast({ title: "Success", description: "Reminder cancelled" }),
    });
  };

  const reminders = data?.reminders ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Stay on top of your follow-ups and scheduled tasks.
          </p>
        </div>
        <CreateReminderDialog />
      </div>

      <Tabs defaultValue="ALL" onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
          <TabsTrigger value="OVERDUE">Overdue</TabsTrigger>
          <TabsTrigger value="FIRED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>

        <div className="mt-6 border rounded-xl overflow-hidden bg-card shadow-sm transition-all">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] font-bold text-foreground">Due Date</TableHead>
                <TableHead className="font-bold text-foreground">Title</TableHead>
                <TableHead className="font-bold text-foreground">Lead</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground/50" />
                  </TableCell>
                </TableRow>
              ) : reminders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Clock className="h-8 w-8 text-muted-foreground/30" />
                       <div className="flex flex-col gap-1">
                         <p className="font-semibold text-foreground">No reminders found</p>
                         <p className="text-sm">You're all caught up for this filter.</p>
                       </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reminders.map((reminder: any) => {
                  const isOverdue = reminder.status === "PENDING" && isPast(new Date(reminder.dueAt));
                  
                  return (
                    <TableRow key={reminder.id} className="group transition-colors hover:bg-muted/30">
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className={cn("font-bold text-sm", isOverdue && "text-destructive")}>
                            {format(new Date(reminder.dueAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground/70 uppercase">
                            {format(new Date(reminder.dueAt), "p")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          {isOverdue && <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />}
                          {reminder.status === "FIRED" && <CheckCircle2 className="h-4 w-4 text-success" />}
                          {reminder.status === "CANCELLED" && <XCircle className="h-4 w-4 text-muted-foreground/50" />}
                          {reminder.status === "PENDING" && !isOverdue && <Clock className="h-4 w-4 text-blue-500" />}
                          <span className="font-medium text-foreground/90">{reminder.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Link 
                          href={`/leads/${reminder.leadId}`}
                          className="flex items-center gap-1.5 text-primary hover:underline font-bold transition-all"
                        >
                          {reminder.lead.name}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </Link>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={isOverdue ? "destructive" : "secondary"}
                          className={cn(
                            "px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px]",
                            reminder.status === 'PENDING' && !isOverdue && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                            reminder.status === 'FIRED' && 'bg-success/10 text-success border-success/20',
                            reminder.status === 'CANCELLED' && 'bg-muted text-muted-foreground border-transparent',
                          )}
                        >
                          {isOverdue ? "Overdue" : reminder.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {reminder.status === 'PENDING' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 text-destructive hover:bg-destructive/10 font-bold text-xs"
                              onClick={() => handleCancel(reminder.id)}
                              disabled={updateMutation.isPending}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      <div className="mt-4">
        <Pagination 
          page={page}
          pageCount={pageCount}
          total={total}
          startItem={(page - 1) * pageSize + 1}
          endItem={Math.min(page * pageSize, total)}
          isLoading={isLoading}
          setPage={setPage}
        />
      </div>
    </div>
  );
}
