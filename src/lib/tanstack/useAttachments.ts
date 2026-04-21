import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, StandardResponse } from "@/lib/api-client";
import type { AttachmentListItem } from "@/services/attachments";

export function useAttachments(leadId: string) {
  return useQuery<AttachmentListItem[]>({
    queryKey: ["attachments", leadId],
    queryFn: async () => {
      const response = await api.get<StandardResponse<AttachmentListItem[]>>(
        `/leads/${leadId}/attachments`,
      );
      return response.data;
    },
    staleTime: 55 * 60 * 1000,
  });
}

export function useUploadAttachment(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<StandardResponse<AttachmentListItem>>(
        `/leads/${leadId}/attachments`,
        formData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", leadId] });
    },
  });
}

export function useDeleteAttachment(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const response = await api.delete<StandardResponse<void>>(
        `/leads/${leadId}/attachments/${attachmentId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", leadId] });
    },
  });
}
