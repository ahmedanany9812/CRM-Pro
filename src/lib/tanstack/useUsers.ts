import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Role } from "@/generated/prisma/enums";
import { CreateUserSchema, UpdateUserSchema, ListUsersPaginatedSchema } from "@/services/admin/schema";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

/**
 * Hook to fetch all users (for admin panel).
 */
export function useUsers(params: ListUsersPaginatedSchema = { page: 1, pageSize: 10 }) {
  return useQuery({
    queryKey: ["admin", "users", params.page, params.pageSize],
    queryFn: async () => {
      const response = await apiClient<any>(`admin/users?page=${params.page}&pageSize=${params.pageSize}`);
      return {
        users: response.data as User[],
        total: response.pagination.total as number,
      };
    },
  });
}

/**
 * Hook to create a new user.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserSchema) => {
      const response = await apiClient<any>("admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Also invalidate global users list if any
    },
  });
}

/**
 * Hook to update an existing user.
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateUserSchema) => {
      const response = await apiClient<any>(`admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

/**
 * Hook to deactivate a user.
 */
export function useDeactivateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient<any>(`admin/users/${id}/deactivate`, {
        method: "POST",
      });
      return response.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

/**
 * Hook to reactivate a user.
 */
export function useReactivateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient<any>(`admin/users/${id}/reactivate`, {
        method: "POST",
      });
      return response.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

/**
 * Hook to resend a magic link invitation.
 */
export function useResendInvite(id: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient<any>(`admin/users/${id}/resend-invite`, {
        method: "POST",
      });
      return response.data;
    },
  });
}

/**
 * Legacy hook to fetch all active users (for dropdowns).
 * Kept for backward compatibility but using the same endpoint or similar if needed.
 */
export function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient<{ id: string; name: string; email: string }[]>("users"),
  });
}
