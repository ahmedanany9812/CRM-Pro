import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { LeadBrief, CallFollowUp } from "@/services/ai/schema";

export function useGenerateLeadBrief() {
  return useMutation({
    mutationFn: async (leadId: string): Promise<LeadBrief> => {
      const response = await apiClient<any>("ai/lead-brief", {
        method: "POST",
        body: JSON.stringify({ leadId }),
      });
      return response.data;
    },
  });
}

export function useSaveLeadBrief() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { leadId: string; brief: LeadBrief }) => {
      const response = await apiClient<any>("ai/lead-brief/save", {
        method: "POST",
        body: JSON.stringify(args),
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lead-brief", variables.leadId] });
    },
  });
}

export function useGetLeadBrief(leadId: string) {
  return useQuery({
    queryKey: ["lead-brief", leadId],
    queryFn: async () => {
      const response = await apiClient<any>(`leads/${leadId}/lead-brief`);
      return response.data;
    },
  });
}

export function useGenerateCallFollowup(leadId: string) {
  return useMutation({
    mutationFn: async (args: {
      callOutcome: string;
      agentNotes?: string;
    }): Promise<CallFollowUp> => {
      const response = await apiClient<any>("ai/call-followup", {
        method: "POST",
        body: JSON.stringify({ leadId, ...args }),
      });
      return response.data;
    },
  });
}
