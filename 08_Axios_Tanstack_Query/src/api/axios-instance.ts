import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ----------------------------------------------------------------
// AppError — normalized error shape used across the app
// ----------------------------------------------------------------

export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

const normalizeError = (error: AxiosError): AppError => {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as Record<string, unknown> | undefined;
  const message =
    (data?.message as string) || error.message || "Something went wrong";
  const code = (data?.code as string) || `HTTP_${status}`;
  return new AppError(message, status, code);
};

// ----------------------------------------------------------------
// Refresh token queue — handles concurrent 401s
// ----------------------------------------------------------------

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

// ----------------------------------------------------------------
// Refresh token API call
// Uses base axios to avoid interceptor loop
// ----------------------------------------------------------------

const callRefreshToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new AppError("No refresh token", 401, "NO_REFRESH_TOKEN");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    { refresh_token: refreshToken }
  );

  const { access_token, refresh_token } = response.data;
  setTokens(access_token, refresh_token);
  return access_token;
};

// ----------------------------------------------------------------
// Session expiry — dispatch event, let router handle redirect
// ----------------------------------------------------------------

const dispatchSessionExpired = (): void => {
  clearTokens();
  window.dispatchEvent(new Event("session:expired"));
};

// ----------------------------------------------------------------
// Axios instance
// ----------------------------------------------------------------

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handle 401 + refresh queue
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Non-401: normalize and reject
    if (error.response?.status !== 401) {
      return Promise.reject(normalizeError(error));
    }

    // Already retried → refresh token also expired
    if (originalRequest._retry) {
      dispatchSessionExpired();
      return Promise.reject(normalizeError(error));
    }

    // Refresh in progress → queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers!.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    // First 401 → start refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await callRefreshToken();
      processQueue(null, newToken);
      originalRequest.headers!.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      dispatchSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
