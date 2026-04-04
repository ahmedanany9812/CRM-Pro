"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLogCallAttempt } from "@/lib/tanstack/useActivities";
import { Loader2, PhoneCall } from "lucide-react";

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

export const LogCallDialog = ({ open, onOpenChange, leadId }: LogCallDialogProps) => {
  const [outcome, setOutcome] = useState<string>("");
  const [notes, setNotes] = useState("");
  const logCallMutation = useLogCallAttempt(leadId);

  const handleLogCall = async () => {
    if (!outcome || logCallMutation.isPending) return;

    await logCallMutation.mutateAsync({ 
      outcome: outcome as any, 
      notes: notes.trim() || undefined 
    });
    
    // Reset and close
    setOutcome("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PhoneCall className="h-5 w-5" />
             </div>
             <DialogTitle className="text-xl font-bold">Log Call Attempt</DialogTitle>
          </div>
          <DialogDescription>
            Record the outcome of your latest contact attempt with this lead.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="outcome">Call Outcome <span className="text-destructive">*</span></Label>
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
              placeholder="Summary of the conversation or reason for no answer..."
              className="resize-none min-h-[120px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
