import { useQuery } from "@tanstack/react-query";
import { api, StandardResponse } from "@/lib/api-client";
import type { DashboardData } from "@/services/dashboard";

/** Fetches dashboard overview including newLeadsThisWeek and conversionRate. */
export function useDashboardOverview() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get<StandardResponse<DashboardData>>("dashboard");
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}
