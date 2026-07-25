import { useAuth as useAuthContext } from "../context/AuthContext";

/**
 * Custom hook for authentication
 * Provides convenient access to auth state and methods
 */
export const useAuth = () => {
  const { state, login, register, logout, clearError } = useAuthContext();

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Methods
    login,
    register,
    logout,
    clearError,

    // Convenience getters
    isAdmin: state.user?.role === "admin",
    isUser: state.user?.role === "user",
  };
};

