import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  tokenStorage,
  refreshAccessToken,
  isTokenExpired,
} from "../utils/auth";
import { createRetryLogic, defaultRetryCondition } from "../utils/retry";

// ============================================
// Axios Instance Configuration
// ============================================

/**
 * Global config - applies to all requests
 */
export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// Request Interceptor
// ============================================

/**
 * Request interceptor - handles:
 * - Auth token injection
 * - Request logging
 * - Per-request config overrides
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Auth token injection
    const token = tokenStorage.getToken();

    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Per-request config example
    // Can override timeout, headers, etc. per request
    // config.timeout = 5000; // Override timeout for this request

    // Logging (in development)
    if (import.meta.env.DEV) {
      console.log(
        `[Axios Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================

/**
 * Response interceptor - handles:
 * - Refresh token flow
 * - Error normalization
 * - Retry logic
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success response - can transform data here
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Refresh token flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        tokenStorage.setTokens({
          accessToken: newToken,
          refreshToken: tokenStorage.getRefreshToken() || "",
        });

        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        tokenStorage.clearTokens();
        // Redirect to login or handle auth failure
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Retry logic for network errors and 5xx errors
    if (defaultRetryCondition(error) && originalRequest) {
      const retryLogic = createRetryLogic({
        retries: 3,
        retryDelay: 1000,
        retryCondition: defaultRetryCondition,
      });

      return retryLogic(error, axiosInstance);
    }

    // Normalize and reject error
    return Promise.reject(error);
  }
);
