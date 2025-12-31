/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

/**
 * Get token expiration time
 * @param token - JWT token string
 * @returns expiration timestamp in milliseconds, or null if invalid
 */
export const getTokenExpiration = (token: string | null): number | null => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

/**
 * Decode JWT token payload
 * @param token - JWT token string
 * @returns decoded payload object
 */
export const decodeToken = (token: string | null): any => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};
