import { axiosInstance } from './axiosConfig';
import { AxiosResponse } from 'axios';
import { PaginationParams, PaginatedResponse } from '../types/api.types';

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/**
 * Post DTO - represents the data structure from API
 */
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create Post DTO - input for creating a post
 */
export interface CreatePostDTO {
  title: string;
  body: string;
  userId: number;
}

/**
 * Update Post DTO - input for updating a post (all fields optional)
 */
export interface UpdatePostDTO {
  title?: string;
  body?: string;
}

/**
 * Post Query Params - for filtering/sorting posts
 */
export interface PostQueryParams extends PaginationParams {
  userId?: number;
  search?: string;
}

// ============================================
// API Layer - Separation of Concerns
// ============================================

/**
 * Posts API Service
 * 
 * This layer is responsible for:
 * - HTTP communication (Axios)
 * - Request/Response transformation
 * - Type safety with TypeScript
 * 
 * TanStack Query will handle:
 * - Caching
 * - State management
 * - Refetching
 */
export const postsApi = {
  /**
   * GET: Fetch list of posts
   * 
   * Response typing: AxiosResponse<Post[]>
   * - response.data: Post[]
   * - response.status: number
   * - response.headers: AxiosResponseHeaders
   */
  getPosts: async (params?: PostQueryParams): Promise<Post[]> => {
    const response: AxiosResponse<Post[]> = await axiosInstance.get<Post[]>('/posts', {
      params, // Query parameters
    });
    return response.data; // Extract data from AxiosResponse
  },

  /**
   * GET: Fetch paginated posts
   * Demonstrates PaginatedResponse typing
   */
  getPostsPaginated: async (params: PostQueryParams): Promise<PaginatedResponse<Post>> => {
    const response = await axiosInstance.get<PaginatedResponse<Post>>('/posts/paginated', {
      params,
    });
    return response.data;
  },

  /**
   * GET: Fetch a post by ID
   * 
   * Generic typing: axiosInstance.get<Post>
   * Ensures type safety for response.data
   */
  getPostById: async (id: number): Promise<Post> => {
    const response: AxiosResponse<Post> = await axiosInstance.get<Post>(`/posts/${id}`);
    return response.data;
  },

  /**
   * POST: Create a new post
   * 
   * Request body typing: CreatePostDTO
   * Response typing: Post
   */
  createPost: async (data: CreatePostDTO): Promise<Post> => {
    const response: AxiosResponse<Post> = await axiosInstance.post<Post>('/posts', data);
    return response.data;
  },

  /**
   * PUT: Update entire post
   * 
   * Demonstrates Partial type usage
   */
  updatePost: async (id: number, data: UpdatePostDTO): Promise<Post> => {
    const response: AxiosResponse<Post> = await axiosInstance.put<Post>(`/posts/${id}`, data);
    return response.data;
  },

  /**
   * PATCH: Partially update post
   * 
   * Same as PUT but semantically indicates partial update
   */
  patchPost: async (id: number, data: UpdatePostDTO): Promise<Post> => {
    const response: AxiosResponse<Post> = await axiosInstance.patch<Post>(`/posts/${id}`, data);
    return response.data;
  },

  /**
   * DELETE: Delete a post
   * 
   * Returns void - no response data expected
   */
  deletePost: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/posts/${id}`);
  },
};

// Re-export types for convenience
export type { CreatePostDTO as CreatePostData, UpdatePostDTO as UpdatePostData };
