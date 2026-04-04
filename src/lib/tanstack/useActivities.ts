import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { 
  GetLeadActivitiesRequest, 
  ListLeadActivitiesResponseData,
  CreateNoteRequest,
  CreateCallAttemptRequest
} from "@/services/activity/schema";

/**
 * Hook to fetch activities for a lead with pagination.
 */
export function useGetLeadActivities(params: GetLeadActivitiesRequest) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => 
      apiClient<{ success: boolean; data: ListLeadActivitiesResponseData }>(`leads/${params.leadId}/activities`, {
        params: {
          page: params.page.toString(),
          pageSize: params.pageSize.toString(),
        }
      }),
    select: (response) => response.data,
    enabled: !!params.leadId,
  });
}

/**
 * Hook to create a new note for a lead.
 */
export function useCreateNote(leadId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNoteRequest) => 
      apiClient(`leads/${leadId}/activities`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate activities for this lead
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

/**
 * Hook to log a call attempt for a lead.
 */
export function useLogCallAttempt(leadId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCallAttemptRequest) => 
      apiClient(`leads/${leadId}/activities/call-attempt`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate activities for this lead
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
