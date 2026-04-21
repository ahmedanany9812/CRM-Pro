"use client";

import { useState } from "react";
import {
  useGetLeadActivities,
  useCreateNote,
} from "@/lib/tanstack/useActivities";
import { Pagination } from "./Pagination";
import { formatDistanceToNow } from "date-fns";
import {
  PlusCircle,
  Pencil,
  Phone,
  CheckCircle,
  ArrowRight,
  User,
  Bell,
  Paperclip,
  Brain,
  Loader2,
  Send,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { ActivityType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LogCallDialog } from "./LogCallDialog";
import { AddNoteDialog } from "./AddNoteDialog";
import { ActivitySummaryItem } from "@/services/activity/schema";

const activityIcons: Record<ActivityType, any> = {
  [ActivityType.LEAD_CREATED]: PlusCircle,
  [ActivityType.NOTE]: Pencil,
  [ActivityType.CALL_ATTEMPT]: Phone,
  [ActivityType.STATUS_CHANGE]: CheckCircle,
  [ActivityType.STAGE_CHANGE]: ArrowRight,
  [ActivityType.ASSIGNMENT_CHANGE]: User,
  [ActivityType.REMINDER_CREATED]: Bell,
  [ActivityType.ATTACHMENT_ADDED]: Paperclip,
  [ActivityType.AI_LEAD_BRIEF_GENERATED]: Brain,
  [ActivityType.AI_FOLLOWUP_DRAFT_GENERATED]: Brain,
};

const activityLabels: Record<ActivityType, string> = {
  [ActivityType.LEAD_CREATED]: "Lead Created",
  [ActivityType.NOTE]: "Note",
  [ActivityType.CALL_ATTEMPT]: "Call Attempt",
  [ActivityType.STATUS_CHANGE]: "Status Change",
  [ActivityType.STAGE_CHANGE]: "Stage Change",
  [ActivityType.ASSIGNMENT_CHANGE]: "Assignment Change",
  [ActivityType.REMINDER_CREATED]: "Reminder Created",
  [ActivityType.ATTACHMENT_ADDED]: "Attachment Added",
  [ActivityType.AI_LEAD_BRIEF_GENERATED]: "AI Lead Brief Generated",
  [ActivityType.AI_FOLLOWUP_DRAFT_GENERATED]: "AI Followup Draft Generated",
};

import { Skeleton } from "@/components/ui/skeleton";

export const Timeline = ({ leadId }: { leadId: string }) => {
  const [page, setPage] = useState(1);
  const [noteContent, setNoteContent] = useState("");
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const pageSize = 10;

  const { data, isLoading, isError } = useGetLeadActivities({
    leadId,
    page,
    pageSize,
  });

  const createNoteMutation = useCreateNote(leadId);

  const handleAddNote = async () => {
    if (!noteContent.trim() || createNoteMutation.isPending) return;

    await createNoteMutation.mutateAsync({ content: noteContent });
    setNoteContent("");
  };

  const activities = data?.activities ?? [];
  const total = data?.pagination.total ?? 0;
  const pageCount = data?.pagination.pages ?? 0;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Button
          variant="outline"
          className="h-14 justify-start gap-3 border-dashed px-4 text-muted-foreground hover:text-foreground"
          onClick={() => setIsLogCallOpen(true)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start translate-y-[-2px]">
            <span className="text-sm font-semibold text-foreground">
              Log Call Attempt
            </span>
            <span className="text-xs">Record the outcome of a call</span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-14 justify-start gap-3 border-dashed px-4 text-muted-foreground hover:text-foreground"
          onClick={() => setIsAddNoteOpen(true)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Pencil className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start text-left translate-y-[-2px]">
            <span className="text-sm font-semibold text-foreground">
              Add Note
            </span>
            <span className="text-xs">Add a private note to this lead</span>
          </div>
        </Button>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-0">
          <Textarea
            placeholder="Write a note about this lead..."
            className="min-h-[100px] border-none bg-transparent p-4 focus-visible:ring-0 resize-none"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <div className="flex items-center justify-between border-t border-primary/10 bg-background/50 px-4 py-2">
            <p className="text-xs text-muted-foreground">
              Notes are visible to all members of your team.
            </p>
            <Button
              size="sm"
              className="px-4"
              onClick={handleAddNote}
              disabled={!noteContent.trim() || createNoteMutation.isPending}
            >
              {createNoteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Post Note
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative mt-8 space-y-0">
        {isLoading ? (
          <div className="relative border-l border-border ml-4 pl-8 space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[48px] flex h-8 w-8 items-center justify-center rounded-full border bg-background ring-4 ring-background">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-10 text-destructive">
            <AlertCircle className="mb-2 h-8 w-8" />
            <p className="text-sm">Failed to load activities</p>
            <Button variant="link" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <p className="text-sm italic">No activities found for this lead</p>
          </div>
        ) : (
          <div className="relative border-l border-border ml-4 pl-8 space-y-8">
            {activities.map((activity: ActivitySummaryItem) => {
              const Icon = activityIcons[activity.type] || MessageSquare;
              const label = activityLabels[activity.type] || "Activity";

              return (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-[48px] flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm ring-4 ring-background">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-x-2">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-semibold text-foreground">
                          {label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {activity.actor.name}
                        </span>
                      </div>
                      <span
                        className="text-xs text-muted-foreground"
                        title={new Date(activity.createdAt).toLocaleString()}
                      >
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {activity.content && (
                      <div className="mt-1 rounded-md bg-muted/30 p-3 text-sm text-foreground/90 border border-border/50">
                        {activity.content}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination
        startItem={startItem}
        endItem={endItem}
        total={total}
        page={page}
        pageCount={pageCount}
        isLoading={isLoading}
        setPage={setPage}
      />

      <LogCallDialog
        open={isLogCallOpen}
        onOpenChange={setIsLogCallOpen}
        leadId={leadId}
      />
      <AddNoteDialog
        open={isAddNoteOpen}
        onOpenChange={setIsAddNoteOpen}
        leadId={leadId}
      />
    </div>
  );
};
