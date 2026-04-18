import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  GetLeadActivitiesRequest,
  ListLeadActivitiesResponseData,
  CreateNoteRequest,
  CreateCallAttemptRequest,
} from "@/services/activity/schema";


export function useGetLeadActivities(params: GetLeadActivitiesRequest) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () =>
      apiClient<{ success: boolean; data: ListLeadActivitiesResponseData }>(
        `leads/${params.leadId}/activities`,
        {
          params: {
            page: params.page.toString(),
            pageSize: params.pageSize.toString(),
          },
        },
      ),
    select: (response) => response.data,
    enabled: !!params.leadId,
  });
}


export function useCreateNote(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteRequest) =>
      apiClient<{ success: boolean; data: any }>(
        `leads/${leadId}/activities/note`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}


export function useLogCallAttempt(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCallAttemptRequest) =>
      apiClient<{ success: boolean; data: any }>(
        `leads/${leadId}/activities/call-attempt`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
