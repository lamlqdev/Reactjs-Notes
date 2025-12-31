import { AxiosError } from "axios";
import { ApiError } from "../types/api";

export function normalizeError(error: unknown): ApiError {
  // Check if it's an Axios error
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      code: axiosError.code,
      status: axiosError.response?.status || 500,
      errors: axiosError.response?.data?.errors,
    };
  }

  // Check if it's a standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unknown error occurred',
    status: 500,
  };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response; // No response means network error
  }
  return false;
}

export function isClientError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }
  return false;
}

export function isServerError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status !== undefined && status >= 500;
  }
  return false;
}

export function getErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return normalized.message;
}

