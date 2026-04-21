"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";
import {
  useCreateReminder,
  useCreateGlobalReminder,
} from "@/lib/tanstack/useReminders";
import { useGetLeads } from "@/lib/tanstack/useLeads";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CreateReminderDialogProps {
  leadId?: string;
  trigger?: React.ReactNode;
}

export function CreateReminderDialog({
  leadId: initialLeadId,
  trigger,
}: CreateReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [title, setTitle] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLeadId || "",
  );

  const { toast } = useToast();

  const { data: leadsData } = useGetLeads({ page: 1, pageSize: 100 });
  const leads = leadsData?.leads ?? [];

  const createLeadReminder = useCreateReminder(initialLeadId || "");
  const createGlobalReminder = useCreateGlobalReminder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeLeadId = initialLeadId || selectedLeadId;
    if (!date || !title || !activeLeadId) return;

    const [hours, minutes] = time.split(":").map(Number);
    const dueAt = new Date(date);
    dueAt.setHours(hours, minutes, 0, 0);
    if (dueAt < new Date()) {
      toast({
        title: "Error",
        description: "Reminder date must be in the future",
        variant: "destructive",
      });
      return;
    }

    const payload = { title, dueAt };

    if (initialLeadId) {
      createLeadReminder.mutate(payload, {
        onSuccess: () => handleSuccess(),
      });
    } else {
      createGlobalReminder.mutate(
        { leadId: activeLeadId, data: payload },
        {
          onSuccess: () => handleSuccess(),
        },
      );
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    setTitle("");
    setDate(undefined);
    setTime("09:00");
    if (!initialLeadId) setSelectedLeadId("");
    toast({
      title: "Success",
      description: "Reminder scheduled successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {!initialLeadId && (
            <div className="space-y-2">
              <Label htmlFor="lead">Select Lead</Label>
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lead to remind about" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">What should we remind you about?</Label>
            <Input
              id="title"
              placeholder="e.g. Follow up on proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      date > addDays(new Date(), 7)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                (initialLeadId
                  ? createLeadReminder.isPending
                  : createGlobalReminder.isPending) ||
                !date ||
                !title ||
                (!initialLeadId && !selectedLeadId)
              }
            >
              {(initialLeadId
                ? createLeadReminder.isPending
                : createGlobalReminder.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Reminder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
