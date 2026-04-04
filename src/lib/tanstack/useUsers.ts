import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

/**
 * Hook to fetch all active users (profiles).
 */
export function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient<UserProfile[]>("users"),
  });
}
