import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Role } from "@/generated/prisma/enums";
import {
  CreateUserSchema,
  UpdateUserSchema,
  ListUsersPaginatedSchema,
} from "@/services/admin/schema";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

export function useUsers(
  params: ListUsersPaginatedSchema = { page: 1, pageSize: 10 },
) {
  return useQuery({
    queryKey: ["admin", "users", params.page, params.pageSize],
    queryFn: async () => {
      const response = await apiClient<any>(
        `admin/users?page=${params.page}&pageSize=${params.pageSize}`,
      );
      return {
        users: response.data as User[],
        total: response.pagination.total as number,
      };
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

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

export function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () =>
      apiClient<{ id: string; name: string; email: string }[]>("users"),
  });
}
