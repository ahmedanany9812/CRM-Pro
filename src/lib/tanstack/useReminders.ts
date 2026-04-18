import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  CreateReminderRequest,
  UpdateReminderRequest,
  ListLeadRemindersRequest,
  ListMyRemindersRequest,
} from "@/services/reminder/schema";

export function useGetLeadReminders(
  leadId: string,
  params: Partial<ListLeadRemindersRequest> = {},
) {
  return useQuery({
    queryKey: ["lead-reminders", leadId, params],
    queryFn: () => apiClient<any>(`leads/${leadId}/reminders`, { params }),
    select: (response: any) => response.data,
  });
}

export function useGetMyReminders(
  params: Partial<ListMyRemindersRequest> = {},
) {
  return useQuery({
    queryKey: ["my-reminders", params],
    queryFn: () => apiClient<any>("reminders", { params }),
    select: (response: any) => response.data,
  });
}

export function useCreateReminder(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReminderRequest) =>
      apiClient(`leads/${leadId}/reminders`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-reminders", leadId] });
      queryClient.invalidateQueries({ queryKey: ["my-reminders"] });
    },
  });
}

export function useCreateGlobalReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      data,
    }: {
      leadId: string;
      data: CreateReminderRequest;
    }) =>
      apiClient(`leads/${leadId}/reminders`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["lead-reminders", leadId] });
      queryClient.invalidateQueries({ queryKey: ["my-reminders"] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderRequest }) =>
      apiClient(`reminders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reminders"] });
      queryClient.invalidateQueries({ queryKey: ["lead-reminders"] });
    },
  });
}
