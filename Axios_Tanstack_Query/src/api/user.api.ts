import { axiosInstance } from "./axios";
import { AxiosResponse } from "axios";
import { User, CreateUserDTO, UpdateUserDTO } from "../types/user";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await axiosInstance.get<User[]>(
      "/users"
    );
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.get<User>(
      `/users/${id}`
    );
    return response.data;
  },

  createUser: async (data: CreateUserDTO): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.post<User>(
      "/users",
      data
    );
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserDTO): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.put<User>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  patchUser: async (id: number, data: UpdateUserDTO): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.patch<User>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};

