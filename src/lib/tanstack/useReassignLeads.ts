import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, StandardResponse } from "@/lib/api-client";

export function useReassignLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { leadIds: string[]; assignToId: string }) => {
      const response = await api.post<StandardResponse<any>>("/leads/reassign", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
