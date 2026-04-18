import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ImportRequest, ImportSummary } from "@/services/import-export/schema";


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
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
