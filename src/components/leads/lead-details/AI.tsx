"use client";

import { useState } from "react";
import {
  useGenerateLeadBrief,
  useSaveLeadBrief,
  useGetLeadBrief,
} from "@/lib/tanstack/useAI";
import { BriefContent } from "./BriefContent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  History,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LeadBrief } from "@/services/ai/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AI({ leadId }: { leadId: string }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<LeadBrief | null>(null);

  const { data: savedBriefRow, isLoading: isFetchingSaved } =
    useGetLeadBrief(leadId);
  const generateMutation = useGenerateLeadBrief();
  const saveMutation = useSaveLeadBrief();

  const handleGenerate = () => {
    generateMutation.mutate(leadId, {
      onSuccess: (brief) => {
        setCurrentBrief(brief);
        setPreviewOpen(true);
      },
    });
  };

  const handleSave = () => {
    if (!currentBrief) return;
    saveMutation.mutate(
      { leadId, brief: currentBrief },
      {
        onSuccess: () => {
          setPreviewOpen(false);
        },
      },
    );
  };

  if (isFetchingSaved) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const savedBrief = savedBriefRow?.brief as LeadBrief | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            AI Sales Assistant
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/10 font-normal"
            >
              BETA
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate insights and follow-up strategies based on lead history.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="gap-2"
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {savedBrief ? "Regenerate Brief" : "Generate Lead Brief"}
        </Button>
      </div>

      {!savedBrief && !generateMutation.isPending && (
        <Alert className="bg-muted/50 border-dashed">
          <History className="h-4 w-4" />
          <AlertTitle>No brief generated yet</AlertTitle>
          <AlertDescription>
            Click the button above to have AI analyze this lead's activity
            history and suggest next steps.
          </AlertDescription>
        </Alert>
      )}

      {savedBrief && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Last saved: {format(new Date(savedBriefRow!.createdAt), "PPP p")}
            </span>
            <span className="italic">
              AI suggestions can be wrong. Always verify before taking action.
            </span>
          </div>
          <BriefContent brief={savedBrief} />
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generated Lead Brief
            </DialogTitle>
          </DialogHeader>

          <Alert
            variant="destructive"
            className="bg-amber-50 border-amber-200 text-amber-800"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs">
              AI-generated content. Review carefully before saving to the lead's
              permanent record.
            </AlertDescription>
          </Alert>

          <ScrollArea className="h-[60vh] pr-4 mt-4">
            {currentBrief && <BriefContent brief={currentBrief} />}
          </ScrollArea>

          <DialogFooter className="mt-6 flex items-center justify-between sm:justify-between w-full">
            <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Saving will add a log to the activity timeline.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Discard
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save to Lead
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
