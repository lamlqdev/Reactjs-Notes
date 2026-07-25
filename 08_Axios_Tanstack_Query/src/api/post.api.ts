import axiosInstance from "./axios-instance";
import { Post, CreatePostDTO, UpdatePostDTO } from "../types/post";

export const postApi = {
  getPosts: async (): Promise<Post[]> => {
    const res = await axiosInstance.get<Post[]>("/posts");
    return res.data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const res = await axiosInstance.get<Post>(`/posts/${id}`);
    return res.data;
  },

  getPostsByUser: async (userId: number): Promise<Post[]> => {
    const res = await axiosInstance.get<Post[]>(`/posts?userId=${userId}`);
    return res.data;
  },

  createPost: async (data: CreatePostDTO): Promise<Post> => {
    const res = await axiosInstance.post<Post>("/posts", data);
    return res.data;
  },

  updatePost: async (id: number, data: UpdatePostDTO): Promise<Post> => {
    const res = await axiosInstance.put<Post>(`/posts/${id}`, data);
    return res.data;
  },

  deletePost: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/posts/${id}`);
  },
};
