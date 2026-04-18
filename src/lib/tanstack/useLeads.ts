import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  ListLeadsParams,
  CreateLeadRequest,
  EditLeadRequest,
} from "@/services/lead/schema";
import { Lead } from "@/generated/prisma/client";

export function useGetLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => apiClient<Lead[]>("leads", { params }),
    select: (response: any) => response.data,
  });
}

export function useGetLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => apiClient<Lead>(`leads/${id}`),
    select: (response: any) => response.data,
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) =>
      apiClient<Lead>("leads", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useEditLead(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditLeadRequest) =>
      apiClient<Lead>(`leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`leads/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
