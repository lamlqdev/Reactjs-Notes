// ============================================
// Auth Token Management
// ============================================

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token storage utilities
 */
export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (tokens: TokenPair): void => {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

/**
 * Refresh token function (mock - replace with actual API call)
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // In real app, this would call your refresh token endpoint
  // const response = await axiosInstance.post('/auth/refresh', { refreshToken });
  // return response.data.accessToken;
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('new_access_token_' + Date.now());
    }, 1000);
  });
};

/**
 * Check if token is expired (mock - in real app, decode JWT)
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  // In real app, decode JWT and check expiration
  // const decoded = jwt.decode(token);
  // return decoded.exp < Date.now() / 1000;
  
  // Mock: assume token expires after 1 hour
  return false;
};

