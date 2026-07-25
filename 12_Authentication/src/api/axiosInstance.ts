import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../utils/tokenStorage";
import { isTokenExpired } from "../utils/tokenUtils";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // Mock API base URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Attach token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();

    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          // Attempt to refresh token
          const response = await axios.post(
            "http://localhost:3000/api/auth/refresh",
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          tokenStorage.setAccessToken(accessToken);
          tokenStorage.setRefreshToken(newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          tokenStorage.clearAll();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token or expired, logout
        tokenStorage.clearAll();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
