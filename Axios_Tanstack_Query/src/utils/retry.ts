import { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

export const defaultRetryCondition = (error: AxiosError): boolean => {
  // Don't retry on 4xx errors (client errors)
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false;
  }
  
  // Retry on network errors or 5xx errors
  return !error.response || (error.response.status >= 500);
};

export const exponentialBackoff = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
};

export const createRetryLogic = (config: RetryConfig) => {
  return async (error: AxiosError, axiosInstance: any) => {
    const { retries, retryDelay, retryCondition = defaultRetryCondition } = config;
    const requestConfig = error.config as InternalAxiosRequestConfig & { __retryCount?: number };

    if (!requestConfig) {
      return Promise.reject(error);
    }

    // Initialize retry count
    if (!requestConfig.__retryCount) {
      requestConfig.__retryCount = 0;
    }

    // Check if we should retry
    if (requestConfig.__retryCount < retries && retryCondition(error)) {
      requestConfig.__retryCount += 1;

      // Calculate delay with exponential backoff
      const delay = exponentialBackoff(requestConfig.__retryCount - 1, retryDelay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return axiosInstance(requestConfig);
    }

    // Don't retry, reject with error
    return Promise.reject(error);
  };
};

