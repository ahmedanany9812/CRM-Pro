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
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
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

        <div className="mt-6 border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[180px]">Due Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : reminders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No reminders found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                reminders.map((reminder: any) => {
                  const isOverdue = reminder.status === "PENDING" && isPast(new Date(reminder.dueAt));
                  
                  return (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className={cn(isOverdue && "text-destructive font-semibold")}>
                            {format(new Date(reminder.dueAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(reminder.dueAt), "p")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isOverdue && <AlertCircle className="h-4 w-4 text-destructive" />}
                          {reminder.status === "FIRED" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {reminder.status === "CANCELLED" && <XCircle className="h-4 w-4 text-muted-foreground" />}
                          {reminder.status === "PENDING" && !isOverdue && <Clock className="h-4 w-4 text-blue-500" />}
                          <span>{reminder.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/leads/${reminder.leadId}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {reminder.lead.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            reminder.status === 'PENDING' && !isOverdue && 'bg-blue-100 text-blue-700 hover:bg-blue-100',
                            reminder.status === 'FIRED' && 'bg-green-100 text-green-700 hover:bg-green-100',
                            reminder.status === 'CANCELLED' && 'bg-gray-100 text-gray-700 hover:bg-gray-100',
                            isOverdue && 'bg-destructive text-destructive-foreground hover:bg-destructive'
                          )}
                        >
                          {isOverdue ? "Overdue" : reminder.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {reminder.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleCancel(reminder.id)}
                              disabled={updateMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
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
