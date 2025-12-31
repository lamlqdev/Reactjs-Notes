import { axiosInstance } from "./axios";
import { AxiosResponse } from "axios";
import { LoginDTO, AuthResponse } from "../types/auth";

export const authApi = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> =
      await axiosInstance.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> =
      await axiosInstance.post<AuthResponse>("/auth/refresh", {
        refreshToken,
      });
    return response.data;
  },
};

