# Frontend Authentication with TypeScript

A comprehensive demo application demonstrating **Frontend Authentication** patterns and best practices in React with **TypeScript**, including token management, protected routes, role-based access control, and secure authentication flows.

---

## Core Terminology

### Authentication vs Authorization

![Authentication vs Authorization](./public/authentication-authorization.png)

### Session-based Authentication

![Session-based Authentication](./public/session-based-authentication.png)

**httpOnly Cookies**: Cookies that cannot be accessed via JavaScript, preventing XSS attacks.

**When to use**: Traditional web applications where server controls session lifecycle and security is critical.

### JWT-based Authentication

![JWT-based Authentication](./public/jwt-based-authentication.png)

**When to use**: Token-based authentication is ideal for stateless APIs, SPAs, and mobile apps. It allows scalability without server-side session storage.

![Refresh Token vs Access Token](./public/refresh-token-vs-access-token.png)

**Storage Comparison**:

| Storage Type         | Pros                                     | Cons                                   | Best For                        |
| -------------------- | ---------------------------------------- | -------------------------------------- | ------------------------------- |
| **localStorage**     | Persists across tabs, easy to use        | Vulnerable to XSS, accessible to JS    | Development, non-sensitive data |
| **sessionStorage**   | Cleared on tab close, easy to use        | Vulnerable to XSS, accessible to JS    | Temporary data, single session  |
| **httpOnly Cookies** | Protected from XSS, not accessible to JS | Requires CSRF protection, server setup | Production, sensitive tokens    |

**Best Practice**: For production apps, use httpOnly cookies for refresh tokens and short-lived access tokens in memory or secure storage.

---

## Basic: Authentication Implementation

### Example 1: Simple Login Form with JWT

**File: `src/components/Login.tsx`**

```typescript
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
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

**Explanation**: Form collects credentials, calls `login` from `useAuth` hook, handles loading/error states, and navigates to dashboard on success.

### Example 2: Token Storage Implementation

This project is a demo, so it uses `localStorage` to store tokens. Although `localStorage` has security risks (vulnerable to XSS attacks), it's suitable for learning and demo purposes because it's easy to use and debug.

**File: `src/utils/tokenStorage.ts`**

```typescript
export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem("access_token"),
  setAccessToken: (token: string): void =>
    localStorage.setItem("access_token", token),
  getRefreshToken: (): string | null => localStorage.getItem("refresh_token"),
  setRefreshToken: (token: string): void =>
    localStorage.setItem("refresh_token", token),
  getUser: (): any => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any): void =>
    localStorage.setItem("user", JSON.stringify(user)),
  clearAll: (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
};
```

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

**Usage**: Wrap protected routes with `<ProtectedRoute><Dashboard /></ProtectedRoute>`

**Explanation**: Checks authentication status, shows loading state, redirects to login if not authenticated, and preserves attempted location for redirect after login.

---

## Advanced: Advanced Authentication Patterns

This section covers more complex authentication patterns and features.

### Example 1: Context API + useReducer for Auth State

**When to use**: When you need global authentication state management across your application.

**File: `src/context/AuthContext.tsx`**

```typescript
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
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
    // ... other cases
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    const user = tokenStorage.getUser();
    if (token && user) {
      dispatch({ type: "SET_USER", payload: user });
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authApi.login(credentials);
      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setUser(response.user);
      dispatch({ type: "LOGIN_SUCCESS", payload: { user: response.user } });
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
    }
  };

  const logout = async () => {
    tokenStorage.clearAll();
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Explanation**: Centralized auth state with Context API and useReducer. Initializes from localStorage on mount, handles login/logout, and persists tokens. Use `useAuth()` hook to access auth state and methods.

### Example 2: Axios Interceptors for Token Management

**When to use**: When you need to automatically attach tokens to requests and handle token refresh.

**File: `src/api/axiosInstance.ts`**

```typescript
// Request interceptor - Attach token
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post("/auth/refresh", {
          refreshToken: tokenStorage.getRefreshToken(),
        });
        tokenStorage.setAccessToken(response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        tokenStorage.clearAll();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

**Explanation**: Request interceptor attaches access token automatically. Response interceptor handles 401 errors by refreshing token on-demand (only when needed), retries failed request, and logs out if refresh fails. This is the recommended approach for production.

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

**Usage**: `<RoleGuard allowedRoles={["admin"]}><AdminPanel /></RoleGuard>`

**Explanation**: Checks authentication first, verifies user role against allowed roles, and redirects unauthorized users. Can be combined with ProtectedRoute for layered protection.

### Example 4: Token Utilities

**When to use**: When you need to decode, validate, or check token expiration.

**File: `src/utils/tokenUtils.ts`**

```typescript
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const decodeToken = (token: string | null): any => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};
```

**Explanation**: JWT tokens have three parts (header.payload.signature). Payload is base64 encoded JSON. `atob()` decodes base64, `exp` field contains expiration timestamp. Always handle errors as tokens may be malformed.

---

## Security Best Practices

### Common Security Concerns

**XSS (Cross-Site Scripting)**: Attackers can inject malicious scripts that steal tokens from localStorage. To prevent this, use httpOnly cookies, sanitize user inputs, and implement Content Security Policy (CSP).

**CSRF (Cross-Site Request Forgery)**: Attackers can trick users into making unwanted requests. Prevent this by using CSRF tokens, setting the SameSite cookie attribute, and verifying origin headers.

**Token Theft**: Tokens can be stolen via XSS or man-in-the-middle attacks. Mitigate this risk by using httpOnly cookies, enforcing HTTPS only, implementing short token expiration times, and using token rotation.

### Best Practices

1. **Never store sensitive data in localStorage**: Use httpOnly cookies for tokens instead, as they are not accessible via JavaScript and are protected from XSS attacks. Only store non-sensitive data in localStorage.

2. **Implement token expiration**: Use short-lived access tokens (15-60 minutes) and longer-lived refresh tokens (7-30 days). This limits the window of opportunity if a token is compromised.

3. **Use HTTPS only**: Never send tokens over HTTP, as they can be intercepted. Always enforce HTTPS in production environments to ensure encrypted communication.

4. **Validate tokens on server**: Never trust client-side token validation alone. Always verify tokens on the backend to ensure their authenticity and validity.

5. **Sanitize user inputs**: Prevent XSS attacks by validating and sanitizing all user data before processing or displaying it. Use libraries designed for input sanitization.

6. **Rate limiting**: Implement rate limiting on authentication endpoints to limit login attempts and prevent brute force attacks. This helps protect against automated attacks.

---

## Summary

Frontend Authentication is a crucial component in building secure web applications. This documentation has covered the key concepts and patterns for implementing authentication in React with TypeScript.

### Authentication Methods

1. **Session-based Authentication**: Traditional method using server-side sessions and httpOnly cookies. Suitable for traditional web applications where the server controls session lifecycle and security is a top priority.

2. **JWT-based Authentication**: Stateless token-based method, ideal for SPAs, mobile apps, and stateless APIs. Enables scalability without server-side session storage.

### Best Practices for Authentication

- **Storage**: Use httpOnly cookies for refresh tokens in production, avoid localStorage for sensitive data
- **Token Expiration**: Use short-lived access tokens (15-60 minutes) and longer-lived refresh tokens (7-30 days)
- **HTTPS Only**: Always use HTTPS in production to encrypt communication
- **Server Validation**: Always validate tokens on the server, never fully trust client-side validation
- **Input Sanitization**: Sanitize user inputs to prevent XSS attacks
- **Rate Limiting**: Implement rate limiting on authentication endpoints to prevent brute force attacks

### Security Considerations

Common security vulnerabilities to be aware of:

- **XSS (Cross-Site Scripting)**: Prevent with httpOnly cookies, input sanitization, and CSP
- **CSRF (Cross-Site Request Forgery)**: Prevent with CSRF tokens, SameSite cookie attribute
- **Token Theft**: Mitigate with httpOnly cookies, HTTPS, short token expiration, and token rotation

---

## Learn More

After mastering the basic and advanced concepts above, you can continue learning the following topics:

### 1. OAuth 2.0 and Social Login

**OAuth 2.0** is an authorization framework that enables applications to obtain limited access to user accounts. It supports various flows including **Authorization Code flow** and **PKCE (Proof Key for Code Exchange)** for enhanced security. **Social login integration** allows users to authenticate using their existing accounts from providers like Google, GitHub, and Facebook.

**Documentation**: [OAuth 2.0 Specification](https://oauth.net/2/)

### 2. Multi-Factor Authentication (MFA)

**Multi-Factor Authentication (MFA)** adds an extra layer of security by requiring users to provide multiple forms of verification. Common MFA methods include **TOTP (Time-based One-Time Password)**, **SMS verification**, **email verification**, and **biometric authentication** using **WebAuthn** standards.

**Documentation**: [WebAuthn Guide](https://webauthn.guide/)

### 3. Passwordless Authentication

**Passwordless authentication** eliminates the need for traditional passwords by using alternative verification methods. These include **magic links** sent via email, **SMS codes**, **biometric authentication**, and **WebAuthn (FIDO2)** protocols. This approach improves user experience while maintaining security.

**Documentation**: [WebAuthn Guide](https://webauthn.guide/)

### 4. Session Management

Effective **session management** involves implementing strategies such as **server-side sessions**, **token-based sessions**, **refresh token rotation**, and **concurrent session limits**. These techniques help maintain security and control over user sessions across multiple devices and applications.

**Documentation**: [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

### 5. Security Headers and CSP

**Security headers** provide additional protection layers for web applications. Important headers include **Content Security Policy (CSP)** to prevent XSS attacks, **X-Frame-Options** to prevent clickjacking, **X-Content-Type-Options** to prevent MIME sniffing, and **Strict-Transport-Security (HSTS)** to enforce HTTPS connections.

**Documentation**: [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io](https://jwt.io/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [WebAuthn Guide](https://webauthn.guide/)
- [React Security Best Practices](https://react.dev/learn/escape-hatches)
