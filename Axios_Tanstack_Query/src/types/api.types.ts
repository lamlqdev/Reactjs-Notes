// ============================================
// Advanced TypeScript Types for Axios + TanStack Query
// ============================================

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Error response structure
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

// AxiosResponse typing
import { AxiosResponse, AxiosError } from 'axios';

// Typed Axios Response
export type TypedAxiosResponse<T> = AxiosResponse<T>;

// Typed Axios Error
export type TypedAxiosError<T = unknown> = AxiosError<T>;

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Utility Types Examples
// Note: Post type is defined in postsApi.ts
// These are examples of utility types that can be used with any type
export type PartialEntity<T> = Partial<T>;
export type EntityPreview<T, K extends keyof T> = Pick<T, K>;
export type EntityWithoutId<T extends { id: unknown }> = Omit<T, 'id'>;
export type EntityRecord<T> = Record<string, T>;

// Discriminated Union Example
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// Nullable types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Function typing examples
export type AsyncFunction<TArgs extends unknown[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

export type QueryFn<TData> = () => Promise<TData>;
export type MutationFn<TVariables, TData> = (
  variables: TVariables
) => Promise<TData>;

// Generic constraint example
export interface Identifiable {
  id: number | string;
}

export type EntityWithId<T extends Identifiable> = T;

