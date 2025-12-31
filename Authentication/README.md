# Frontend Authentication with TypeScript

A comprehensive demo application demonstrating **Frontend Authentication** patterns and best practices in React with **TypeScript**, including token management, protected routes, role-based access control, and secure authentication flows.

---

## Core Terminology

### Authentication vs Authorization

**Authentication**: The process of verifying who a user is (login). It answers "Who are you?"

**Authorization**: The process of verifying what a user has access to (permissions). It answers "What can you do?"

**Example**:

```typescript
// Authentication - Login
const { login } = useAuth();
await login({ email: "user@example.com", password: "password123" });

// Authorization - Check permissions
const { user } = useAuth();
if (user?.role === "admin") {
  // Allow access to admin features
}
```

### Token-based Authentication

**JWT (JSON Web Token)**: A compact, URL-safe token format for securely transmitting information between parties. Consists of three parts: header.payload.signature.

**Access Token**: Short-lived token used to authenticate API requests. Typically expires in 15 minutes to 1 hour.

**Refresh Token**: Long-lived token used to obtain new access tokens. Typically expires in days or weeks.

**Token Storage Strategies**:

- **localStorage**: Accessible via JavaScript, vulnerable to XSS attacks
- **sessionStorage**: Similar to localStorage but cleared when tab closes
- **httpOnly Cookies**: Not accessible via JavaScript, protected from XSS, requires CSRF protection

**When to use**: Token-based authentication is ideal for stateless APIs, SPAs, and mobile apps. It allows scalability without server-side session storage.

### Session-based Authentication

**Server-side Sessions**: Server stores session data, client receives session ID in cookie.

**httpOnly Cookies**: Cookies that cannot be accessed via JavaScript, preventing XSS attacks.

**When to use**: Traditional web applications where server controls session lifecycle and security is critical.

---

## Basic: Authentication Implementation

This section guides you through implementing basic authentication features.

### Example 1: Simple Login Form with JWT

**When to use**: When you need to authenticate users and receive JWT tokens from your backend.

**File: `src/components/Login.tsx`**

```typescript
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

**Explanation**:

- Form collects email and password
- Calls `login` function from `useAuth` hook
- Handles loading and error states
- Navigates to dashboard on success
- Disables button during loading to prevent double submission

**File: `src/api/authApi.ts`**

```typescript
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post("/auth/login", credentials);
    return response.data;
  },
};
```

### Example 2: Token Storage Strategies

**When to use**: Understanding different token storage options and their trade-offs.

**File: `src/utils/tokenStorage.ts`**

```typescript
// localStorage Strategy
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem("access_token");
  },
  setAccessToken: (token: string): void => {
    localStorage.setItem("access_token", token);
  },
  removeAccessToken: (): void => {
    localStorage.removeItem("access_token");
  },
};
```

**Storage Comparison**:

| Storage Type         | Pros                                     | Cons                                   | Best For                        |
| -------------------- | ---------------------------------------- | -------------------------------------- | ------------------------------- |
| **localStorage**     | Persists across tabs, easy to use        | Vulnerable to XSS, accessible to JS    | Development, non-sensitive data |
| **sessionStorage**   | Cleared on tab close, easy to use        | Vulnerable to XSS, accessible to JS    | Temporary data, single session  |
| **httpOnly Cookies** | Protected from XSS, not accessible to JS | Requires CSRF protection, server setup | Production, sensitive tokens    |

**Best Practice**: For production apps, use httpOnly cookies for refresh tokens and short-lived access tokens in memory or secure storage.

### Example 3: Protected Routes

**When to use**: When you need to restrict access to certain routes based on authentication status.

**File: `src/components/ProtectedRoute.tsx`**

```typescript
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

**Usage**:

```typescript
<Routes>
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

**Explanation**:

- Checks authentication status before rendering children
- Shows loading state while checking
- Redirects to login if not authenticated
- Preserves attempted location for redirect after login
- Uses `replace` to avoid adding login page to history

### Example 4: Token Refresh Flow

**When to use**: When you need to automatically refresh access tokens before they expire.

**File: `src/hooks/useTokenRefresh.ts`**

```typescript
import { useEffect, useRef } from "react";
import { tokenStorage } from "../utils/tokenStorage";
import { getTokenExpiration } from "../utils/tokenUtils";
import { authApi } from "../api/authApi";

export const useTokenRefresh = (refreshInterval: number = 60000) => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      if (!accessToken || !refreshToken) return;

      const expiration = getTokenExpiration(accessToken);
      const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

      // Refresh if token expires within 5 minutes
      if (expiration && expiration < fiveMinutesFromNow) {
        try {
          const response = await authApi.refreshToken(refreshToken);
          tokenStorage.setAccessToken(response.accessToken);
          tokenStorage.setRefreshToken(response.refreshToken);
        } catch (error) {
          tokenStorage.clearAll();
          window.location.href = "/login";
        }
      }
    };

    checkAndRefreshToken();
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
```

**Explanation**:

- Uses `useRef` to store interval ID (number type for browser environment)
- Checks token expiration periodically (default: every 60 seconds)
- Refreshes token before it expires (5 minutes buffer)
- Uses `window.setInterval` and `window.clearInterval` for browser compatibility
- Handles refresh failures by clearing storage and redirecting to login
- Cleans up interval on unmount to prevent memory leaks

---

## Advanced: Advanced Authentication Patterns

This section covers more complex authentication patterns and features.

### Example 1: Context API + useReducer for Auth State

**When to use**: When you need global authentication state management across your application.

**File: `src/context/AuthContext.tsx`**

```typescript
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

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
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
      return { ...state, user: null, isAuthenticated: false };
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authApi.login(credentials);
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
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authApi.register(data);
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
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error instanceof Error ? error.message : "Registration failed",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenStorage.clearAll();
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

**Explanation**:

- Centralized auth state management with Context API
- Reducer pattern for predictable state updates
- `useEffect` initializes auth state from localStorage on mount
- `login` and `register` functions handle authentication
- `logout` clears tokens and resets state
- `clearError` allows manual error clearing
- Persists tokens and user data to localStorage
- Custom hook provides convenient access to auth state and methods

### Example 2: Axios Interceptors for Token Management

**When to use**: When you need to automatically attach tokens to requests and handle token refresh.

**File: `src/api/axiosInstance.ts`**

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../utils/tokenStorage";
import { isTokenExpired } from "../utils/tokenUtils";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

// Request interceptor - Attach token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const response = await axios.post("/auth/refresh", { refreshToken });
          const { accessToken } = response.data;

          tokenStorage.setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch {
          tokenStorage.clearAll();
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);
```

**Explanation**:

- Request interceptor attaches access token to all requests
- Response interceptor handles 401 errors (unauthorized)
- Automatically refreshes token and retries failed request
- Logs out user if refresh fails
- Prevents infinite retry loops with `_retry` flag

### Example 3: Role-Based Access Control (RBAC)

**When to use**: When you need to restrict access based on user roles (admin, user, guest).

**File: `src/components/RoleGuard.tsx`**

```typescript
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ("admin" | "user" | "guest")[];
  fallbackPath?: string;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallbackPath = "/dashboard",
}: RoleGuardProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
```

**Usage**:

```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
        <AdminPanel />
      </RoleGuard>
    </ProtectedRoute>
  }
/>
```

**Explanation**:

- Checks if user is authenticated first
- Verifies user role against allowed roles
- Redirects unauthorized users to fallback path
- Can be combined with ProtectedRoute for layered protection

### Example 4: Token Utilities

**When to use**: When you need to decode, validate, or check token expiration.

**File: `src/utils/tokenUtils.ts`**

```typescript
/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

/**
 * Get token expiration time
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
 */
export const decodeToken = (token: string | null): any => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};
```

**Explanation**:

- JWT tokens have three parts: header.payload.signature
- Payload is base64 encoded JSON
- `atob()` decodes base64 string
- `exp` field contains expiration timestamp (seconds since epoch)
- Always handle errors as tokens may be malformed

---

## Security Best Practices

### Common Security Concerns

**XSS (Cross-Site Scripting)**:

- **Risk**: Attackers inject malicious scripts that steal tokens from localStorage
- **Prevention**: Use httpOnly cookies, sanitize user inputs, use Content Security Policy (CSP)

**CSRF (Cross-Site Request Forgery)**:

- **Risk**: Attackers trick users into making unwanted requests
- **Prevention**: Use CSRF tokens, SameSite cookie attribute, verify origin headers

**Token Theft**:

- **Risk**: Tokens stolen via XSS or man-in-the-middle attacks
- **Prevention**: Use httpOnly cookies, HTTPS only, short token expiration, token rotation

### Best Practices

1. **Never store sensitive data in localStorage**

   - Use httpOnly cookies for tokens
   - Store only non-sensitive data in localStorage

2. **Implement token expiration**

   - Short-lived access tokens (15-60 minutes)
   - Longer-lived refresh tokens (7-30 days)

3. **Use HTTPS only**

   - Never send tokens over HTTP
   - Enforce HTTPS in production

4. **Validate tokens on server**

   - Never trust client-side token validation
   - Always verify tokens on backend

5. **Sanitize user inputs**

   - Prevent XSS attacks
   - Validate and sanitize all user data

6. **Rate limiting**
   - Limit login attempts
   - Prevent brute force attacks

---

## Summary

Frontend Authentication enables secure user access and authorization:

1. **Authentication**: Verify user identity (login/logout)
2. **Token Management**: Store and manage JWT tokens securely
3. **Protected Routes**: Restrict access to authenticated users
4. **Role-Based Access**: Control access based on user roles
5. **Token Refresh**: Automatically refresh expired tokens
6. **Axios Interceptors**: Automatically attach tokens to requests
7. **Security**: Follow best practices to prevent common attacks

---

## Learn More

After mastering the basic and advanced concepts above, you can continue learning the following topics:

### 1. OAuth 2.0 and Social Login

**OAuth Flow**:

- Authorization Code flow
- PKCE (Proof Key for Code Exchange)
- Social login integration (Google, GitHub, Facebook)

**Example**:

```typescript
// Redirect to OAuth provider
window.location.href = `https://oauth.provider.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid profile email`;

// Handle callback
const code = new URLSearchParams(window.location.search).get("code");
const response = await axios.post("/auth/oauth/callback", { code });
```

**Documentation**: [OAuth 2.0](https://oauth.net/2/)

### 2. Multi-Factor Authentication (MFA)

**MFA Methods**:

- TOTP (Time-based One-Time Password)
- SMS verification
- Email verification
- Biometric authentication (WebAuthn)

**Example**:

```typescript
// Enable 2FA
const response = await axios.post("/auth/mfa/enable");
const { secret, qrCode } = response.data;

// Verify TOTP code
await axios.post("/auth/mfa/verify", { code: totpCode });
```

### 3. Passwordless Authentication

**Passwordless Methods**:

- Magic links via email
- SMS codes
- Biometric authentication
- WebAuthn (FIDO2)

**Example**:

```typescript
// Request magic link
await axios.post("/auth/passwordless/request", { email });

// Verify magic link token
await axios.post("/auth/passwordless/verify", { token });
```

### 4. Session Management

**Session Strategies**:

- Server-side sessions
- Token-based sessions
- Refresh token rotation
- Concurrent session limits

**Example**:

```typescript
// View active sessions
const sessions = await axios.get("/auth/sessions");

// Revoke specific session
await axios.delete(`/auth/sessions/${sessionId}`);
```

### 5. Security Headers and CSP

**Security Headers**:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)

**Example**:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline';"
/>
```

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io](https://jwt.io/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [WebAuthn Guide](https://webauthn.guide/)
- [React Security Best Practices](https://react.dev/learn/escape-hatches)
