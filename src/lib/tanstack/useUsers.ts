import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, StandardResponse } from "@/lib/api-client";
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
      const response = await api.get<StandardResponse<User[]>>(
        `admin/users?page=${params.page}&pageSize=${params.pageSize}`,
      );
      return {
        users: response.data,
        total: response.pagination?.total ?? 0,
      };
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserSchema) => {
      const response = await api.post<StandardResponse<User>>("admin/users", data);
      return response.data;
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
      const response = await api.patch<StandardResponse<User>>(
        `admin/users/${id}`,
        data,
      );
      return response.data;
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
      const response = await api.post<StandardResponse<User>>(
        `admin/users/${id}/deactivate`,
      );
      return response.data;
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
      const response = await api.post<StandardResponse<User>>(
        `admin/users/${id}/reactivate`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useResendInvite(id: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<StandardResponse<void>>(
        `admin/users/${id}/resend-invite`,
      );
      return response.data;
    },
  });
}

export function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<StandardResponse<{ id: string; name: string; email: string; role: Role }[]>>("users");
      return response.data;
    },
  });
}
