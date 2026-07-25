export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: "LOGIN_START" }
  | {
      type: "LOGIN_SUCCESS";
      payload: { user: User; accessToken: string; refreshToken: string };
    }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_ERROR" };
