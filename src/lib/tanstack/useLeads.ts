import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { 
  ListLeadsParams, 
  CreateLeadRequest, 
  EditLeadRequest 
} from "@/services/lead/schema";
import { Lead } from "@/generated/prisma/client";

/**
 * Hook to fetch leads with pagination.
 */
export function useGetLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => 
      apiClient<Lead[]>("leads", { params }),
    select: (response: any) => response.data,
  });
}

/**
 * Hook to fetch a single lead by ID.
 */
export function useGetLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => 
      apiClient<Lead>(`leads/${id}`),
    select: (response: any) => response.data,
    enabled: !!id,
  });
}

/**
 * Hook to create a new lead.
 */
export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => 
      apiClient<Lead>("leads", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate all leads queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

/**
 * Hook to update an existing lead.
 */
export function useEditLead(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EditLeadRequest) => 
      apiClient<Lead>(`leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate the specific lead and the full list
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

/**
 * Hook to delete a lead.
 */
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
