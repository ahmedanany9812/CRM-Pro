import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, StandardResponse } from "@/lib/api-client";
import {
  ListLeadsParams,
  CreateLeadRequest,
  EditLeadRequest,
} from "@/services/lead/schema";
import { Lead } from "@/generated/prisma/client";

export function useGetLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async () => {
      const response = await api.get<StandardResponse<Lead[]>>("leads", {
        params,
      });
      return {
        leads: response.data,
        pagination: response.pagination,
      };
    },
  });
}

export function useGetLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const response = await api.get<StandardResponse<Lead>>(`leads/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadRequest) => {
      const response = await api.post<StandardResponse<Lead>>("leads", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useEditLead(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EditLeadRequest) => {
      const response = await api.patch<StandardResponse<Lead>>(
        `leads/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["lead", id] });
      }
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<StandardResponse<void>>(`leads/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
