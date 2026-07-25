import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthState,
  AuthAction,
  LoginCredentials,
  RegisterData,
} from "../types/auth.types";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../utils/tokenStorage";

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context type
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      const user = tokenStorage.getUser();

      if (token && user) {
        dispatch({ type: "SET_USER", payload: user });
      }

      dispatch({ type: "SET_LOADING", payload: false });
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "LOGIN_START" });

      const response = await authApi.login(credentials);

      // Store tokens and user
      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setRefreshToken(response.refreshToken);
      tokenStorage.setUser(response.user);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: "LOGIN_START" });

      const response = await authApi.register(data);

      // Store tokens and user
      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setRefreshToken(response.refreshToken);
      tokenStorage.setUser(response.user);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear storage regardless of API call result
      tokenStorage.clearAll();
      dispatch({ type: "LOGOUT" });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
