import { AxiosResponse, AxiosError } from "axios";

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

// Typed Axios Response
export type TypedAxiosResponse<T> = AxiosResponse<T>;

// Typed Axios Error
export type TypedAxiosError<T = unknown> = AxiosError<T>;

// Utility Types
export type PartialEntity<T> = Partial<T>;
export type EntityPreview<T, K extends keyof T> = Pick<T, K>;
export type EntityWithoutId<T extends { id: unknown }> = Omit<T, "id">;
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

