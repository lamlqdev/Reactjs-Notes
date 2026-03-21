import axiosInstance from "./axios-instance";
import { User, CreateUserDTO, UpdateUserDTO } from "../types/user";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const res = await axiosInstance.get<User[]>("/users");
    return res.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const res = await axiosInstance.get<User>(`/users/${id}`);
    return res.data;
  },

  createUser: async (data: CreateUserDTO): Promise<User> => {
    const res = await axiosInstance.post<User>("/users", data);
    return res.data;
  },

  updateUser: async (id: number, data: UpdateUserDTO): Promise<User> => {
    const res = await axiosInstance.put<User>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};
