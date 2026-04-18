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
import { useCreateNote } from "@/lib/tanstack/useActivities";
import { Loader2, StickyNote } from "lucide-react";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
}

export const AddNoteDialog = ({
  open,
  onOpenChange,
  leadId,
}: AddNoteDialogProps) => {
  const [content, setContent] = useState("");
  const createNoteMutation = useCreateNote(leadId);

  const handleAddNote = async () => {
    if (!content.trim() || createNoteMutation.isPending) return;

    await createNoteMutation.mutateAsync({ content });

    setContent("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <StickyNote className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Add Note</DialogTitle>
          </div>
          <DialogDescription>
            Add a private note to this lead. Only your team can see this.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="content">
              Note Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Start typing your note here..."
              className="resize-none min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddNote}
            disabled={!content.trim() || createNoteMutation.isPending}
          >
            {createNoteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
