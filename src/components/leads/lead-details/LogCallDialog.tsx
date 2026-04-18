"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogCallAttempt } from "@/lib/tanstack/useActivities";
import { useGenerateCallFollowup } from "@/lib/tanstack/useAI";
import { useCreateReminder } from "@/lib/tanstack/useReminders";
import {
  Loader2,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Lightbulb,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CallFollowUp } from "@/services/ai/schema";
import { format } from "date-fns";

interface LogCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
}

const OUTCOMES = [
  { value: "NO_ANSWER", label: "No Answer" },
  { value: "ANSWERED", label: "Answered" },
  { value: "WRONG_NUMBER", label: "Wrong Number" },
  { value: "BUSY", label: "Busy" },
  { value: "CALL_BACK_LATER", label: "Call Back Later" },
];

export const LogCallDialog = ({
  open,
  onOpenChange,
  leadId,
}: LogCallDialogProps) => {
  const [step, setStep] = useState<"log" | "suggest" | "review">("log");
  const [outcome, setOutcome] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [followup, setFollowup] = useState<CallFollowUp | null>(null);

  const logCallMutation = useLogCallAttempt(leadId);
  const generateFollowupMutation = useGenerateCallFollowup(leadId);
  const createReminderMutation = useCreateReminder(leadId);

  const handleLogCall = async () => {
    if (!outcome || logCallMutation.isPending) return;

    await logCallMutation.mutateAsync({
      outcome: outcome as any,
      notes: notes.trim() || undefined,
    });

    setStep("suggest");
  };

  const handleGetSuggestion = () => {
    generateFollowupMutation.mutate(
      {
        callOutcome: outcome,
        agentNotes: notes,
      },
      {
        onSuccess: (data) => {
          setFollowup(data);
          setStep("review");
        },
      },
    );
  };

  const handleCreateReminder = () => {
    if (!followup) return;

    createReminderMutation.mutate(
      {
        title: followup.suggestedReminder.title,
        dueAt: followup.suggestedReminder.suggestedDueAt,
      } as any,
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    setStep("log");
    setOutcome("");
    setNotes("");
    setFollowup(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        className={
          step === "review" ? "max-w-3xl max-h-[95vh]" : "sm:max-w-[425px]"
        }
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {step === "log" ? (
                <PhoneCall className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold">
              {step === "log" && "Log Call Attempt"}
              {step === "suggest" && "Call Logged!"}
              {step === "review" && "AI Follow-up Strategy"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {step === "log" &&
              "Record the outcome of your latest contact attempt with this lead."}
            {step === "suggest" &&
              "Would you like AI to suggest a follow-up script and next steps?"}
            {step === "review" &&
              "Review the AI-generated follow-up strategy below."}
          </DialogDescription>
        </DialogHeader>

        {step === "log" && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="outcome">
                Call Outcome <span className="text-destructive">*</span>
              </Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger id="outcome">
                  <SelectValue placeholder="Select call outcome" />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Summary of the conversation..."
                className="resize-none min-h-[120px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === "suggest" && (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 bg-green-50 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Call activity has been saved. The AI can help you draft a script
              and schedule the next follow-up.
            </p>
          </div>
        )}

        {step === "review" && followup && (
          <div className="space-y-4 py-4">
            <Alert className="bg-primary/5 border-primary/20 text-primary-foreground border">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-primary">
                AI suggestions can be wrong. Review and verify before taking
                action.
              </AlertDescription>
            </Alert>

            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-6">
                {/* Script Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">
                      Suggested Call Script
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">
                        Opening
                      </Label>
                      <p className="text-sm mt-1 bg-muted/30 p-2 rounded border-l-2 border-primary italic">
                        "{followup.callScript.opening}"
                      </p>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">
                        Questions to Ask
                      </Label>
                      <ul className="mt-1 space-y-1">
                        {followup.callScript.questions.map((q, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-primary font-bold">
                              {i + 1}.
                            </span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">
                        Objection Handlers
                      </Label>
                      <div className="mt-1 grid gap-2">
                        {followup.callScript.objectionHandlers.map((obj, i) => (
                          <div
                            key={i}
                            className="text-xs p-2 rounded bg-muted/50 border"
                          >
                            <p className="font-semibold text-destructive">
                              If: {obj.objection}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                              Say: {obj.response}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <CardTitle className="text-sm font-semibold">
                        Next Step
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{followup.recommendedNextStep}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-semibold">
                        Suggested Reminder
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm font-bold">
                        {followup.suggestedReminder.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(
                          followup.suggestedReminder.suggestedDueAt,
                          "PPP",
                        )}
                      </div>
                      <p className="text-xs italic text-muted-foreground">
                        {followup.suggestedReminder.note}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step === "log" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleLogCall}
                disabled={!outcome || logCallMutation.isPending}
              >
                {logCallMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Log Call
              </Button>
            </>
          )}

          {step === "suggest" && (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Skip
              </Button>
              <Button
                onClick={handleGetSuggestion}
                disabled={generateFollowupMutation.isPending}
                className="gap-2"
              >
                {generateFollowupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Get AI Suggestion
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Discard Suggestions
              </Button>
              <Button
                onClick={handleCreateReminder}
                disabled={createReminderMutation.isPending}
                className="gap-2"
              >
                {createReminderMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                Create Scheduled Reminder
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
