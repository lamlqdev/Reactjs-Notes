import { axiosInstance } from "./axiosInstance";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types/auth.types";

// Mock API functions - In real app, these would call actual backend
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (
      credentials.email === "admin@example.com" &&
      credentials.password === "admin123"
    ) {
      return {
        user: {
          id: "1",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
        },
        accessToken: "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        expiresIn: 3600, // 1 hour
      };
    }

    if (
      credentials.email === "user@example.com" &&
      credentials.password === "user123"
    ) {
      return {
        user: {
          id: "2",
          email: "user@example.com",
          name: "Regular User",
          role: "user",
        },
        accessToken: "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        expiresIn: 3600,
      };
    }

    throw new Error("Invalid email or password");
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock registration
    return {
      user: {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: "user",
      },
      accessToken: "mock-access-token-" + Date.now(),
      refreshToken: "mock-refresh-token-" + Date.now(),
      expiresIn: 3600,
    };
  },

  /**
   * Refresh access token
   */
  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      accessToken: "mock-access-token-" + Date.now(),
      refreshToken: "mock-refresh-token-" + Date.now(),
    };
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // In real app, this would invalidate tokens on server
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<any> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock: return user from token or API
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }

    throw new Error("User not found");
  },
};

