import { useGetLeadReminders, useUpdateReminder } from "@/lib/tanstack/useReminders";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, Bell, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { format, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CreateReminderDialog } from "@/components/reminders/CreateReminderDialog";
import { cn } from "@/lib/utils";

export function LeadReminders({ leadId }: { leadId: string }) {
  const { toast } = useToast();
  const { data, isLoading } = useGetLeadReminders(leadId);
  const updateMutation = useUpdateReminder();

  const reminders = data?.reminders ?? [];

  const handleCancel = (id: string) => {
    updateMutation.mutate({ 
      id,
      data: { status: "CANCELLED" }
    }, {
      onSuccess: () => toast({ title: "Success", description: "Reminder cancelled" }),
      onError: (error: any) => toast({ 
        title: "Error", 
        description: error.message || "Failed to cancel reminder",
        variant: "destructive"
      }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Scheduled Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Manage reminders for following up with this lead.
          </p>
        </div>
        <CreateReminderDialog leadId={leadId} />
      </div>

      {reminders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="mt-4 font-semibold">No reminders scheduled</h4>
            <p className="text-sm text-muted-foreground">
              Add a reminder to get notified about future actions.
            </p>
            <CreateReminderDialog 
              leadId={leadId} 
              trigger={
                <Button variant="outline" className="mt-4">
                  Set First Reminder
                </Button>
              } 
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder: any) => {
            const isOverdue = reminder.status === "PENDING" && isPast(new Date(reminder.dueAt));
            
            return (
              <Card key={reminder.id} className={cn(
                "overflow-hidden transition-colors",
                isOverdue && "border-destructive/50 bg-destructive/5"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "mt-1 flex h-8 w-8 items-center justify-center rounded-full",
                      reminder.status === 'FIRED' && 'bg-green-100 text-green-600',
                      reminder.status === 'CANCELLED' && 'bg-muted text-muted-foreground',
                      reminder.status === 'PENDING' && !isOverdue && 'bg-blue-100 text-blue-600',
                      isOverdue && 'bg-destructive/20 text-destructive'
                    )}>
                      {reminder.status === 'FIRED' ? <CheckCircle2 className="h-4 w-4" /> : 
                       reminder.status === 'CANCELLED' ? <XCircle className="h-4 w-4" /> :
                       isOverdue ? <AlertCircle className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{reminder.title}</h4>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(reminder.dueAt), "PPP")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(reminder.dueAt), "p")}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {reminder.status === 'PENDING' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancel(reminder.id)}
                      >
                        Cancel
                      </Button>
                    )}
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
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
