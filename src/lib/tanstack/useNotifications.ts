import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ListNotificationsResponseData } from "@/services/notification/schema";

export function useGetNotifications(params: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => apiClient<ListNotificationsResponseData>("notifications", { params }),
    select: (response: any) => response.data,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`notifications/${id}/read`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
