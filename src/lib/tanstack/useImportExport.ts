import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ImportRequest, ImportSummary } from "@/services/import-export/schema";

/**
 * Hook to handle CSV lead import.
 */
export function useImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: ImportRequest) => {
      const response = await apiClient<any>("admin/import", {
        method: "POST",
        body: JSON.stringify(request),
      });
      return response.data as ImportSummary;
    },
    onSuccess: () => {
      // Invalidate leads query to show the new leads
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
