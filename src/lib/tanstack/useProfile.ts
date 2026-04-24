import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, StandardResponse } from "@/lib/api-client";
import { Profile } from "@/generated/prisma/client";

export type UpdateProfileData = {
  name?: string;
  password?: string;
  confirmPassword?: string;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get<StandardResponse<Profile>>("profile");
      return response.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.patch<StandardResponse<Profile>>("profile", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
