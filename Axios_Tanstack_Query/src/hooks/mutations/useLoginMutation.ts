import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { queryKeys } from "../../constants/queryKeys";
import { LoginDTO } from "../../types/auth";
import { normalizeError } from "../../utils/errorHandler";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDTO) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
    onError: (error) => {
      const normalizedError = normalizeError(error);
      console.error("Login error:", normalizedError);
    },
  });
}
