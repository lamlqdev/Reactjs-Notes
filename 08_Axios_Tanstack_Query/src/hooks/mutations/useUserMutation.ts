import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";
import { AppError } from "../../api/axios-instance";
import { CreateUserDTO, UpdateUserDTO } from "../../types/user";

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => userApi.createUser(data),
    onSuccess: () => {
      // Invalidate list so it refetches with the new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      if (error instanceof AppError) {
        console.error(`[${error.code}] ${error.message}`);
      }
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) =>
      userApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      if (error instanceof AppError) {
        console.error(`[${error.code}] ${error.message} (HTTP ${error.status})`);
      }
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}
