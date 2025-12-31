import { useEffect, useRef } from "react";
import { tokenStorage } from "../utils/tokenStorage";
import { getTokenExpiration } from "../utils/tokenUtils";
import { authApi } from "../api/authApi";

/**
 * Hook to automatically refresh access token before expiration
 * @param refreshInterval - Interval in milliseconds to check token expiration (default: 60000 = 1 minute)
 */
export const useTokenRefresh = (refreshInterval: number = 60000) => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      if (!accessToken || !refreshToken) {
        return;
      }

      // Check if token is expired or will expire soon (within 5 minutes)
      const expiration = getTokenExpiration(accessToken);
      const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

      if (expiration && expiration < fiveMinutesFromNow) {
        try {
          const response = await authApi.refreshToken(refreshToken);
          tokenStorage.setAccessToken(response.accessToken);
          tokenStorage.setRefreshToken(response.refreshToken);
          console.log("Token refreshed successfully");
        } catch (error) {
          console.error("Token refresh failed:", error);
          // Token refresh failed, clear storage
          tokenStorage.clearAll();
          window.location.href = "/login";
        }
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Set up interval to check periodically
    intervalRef.current = window.setInterval(
      checkAndRefreshToken,
      refreshInterval
    );

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval]);
};
