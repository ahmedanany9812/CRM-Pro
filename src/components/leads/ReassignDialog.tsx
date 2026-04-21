"use client";

import { useState } from "react";
import { useGetUsers } from "@/lib/tanstack/useUsers";
import { useReassignLeads } from "@/lib/tanstack/useReassignLeads";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReassignDialogProps {
  selectedLeadIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReassignDialog({
  selectedLeadIds,
  open,
  onOpenChange,
  onSuccess,
}: ReassignDialogProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const { data: users, isLoading: isLoadingUsers } = useGetUsers();
  const reassignMutation = useReassignLeads();

  const activeAgents = users?.filter((u: any) => u.role === "AGENT") || [];

  const handleReassign = () => {
    if (!selectedAgentId) {
      toast.error("Please select an agent");
      return;
    }

    reassignMutation.mutate(
      {
        leadIds: selectedLeadIds,
        assignToId: selectedAgentId,
      },
      {
        onSuccess: () => {
          toast.success(`Succesfully reassigned ${selectedLeadIds.length} leads`);
          setSelectedAgentId("");
          onSuccess();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to reassign leads");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reassign Leads</DialogTitle>
          <DialogDescription>
            Selected {selectedLeadIds.length} leads. Choose an agent to reassign them to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agent">Target Agent</Label>
            <Select
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
              disabled={isLoadingUsers || reassignMutation.isPending}
            >
              <SelectTrigger id="agent">
                <SelectValue placeholder="Select an agent..." />
              </SelectTrigger>
              <SelectContent>
                {activeAgents.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={reassignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReassign}
            disabled={!selectedAgentId || reassignMutation.isPending}
            className="gap-2"
          >
            {reassignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Reassign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
