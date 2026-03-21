# Using Axios with TanStack Query

A comprehensive demo application demonstrating how to use **Axios** for HTTP requests combined with **TanStack Query** (React Query) for data fetching, caching, and state management in React + TypeScript.

---

## Core Terminology

### 1. Axios Terminology

#### Axios Instance & Config

Axios Instance is a reusable, pre-configured HTTP client created by `axios.create()`. It centralizes global settings (baseURL, headers, timeout) and interceptors, ensuring consistent request behavior and easier maintenance across the application.

![Axios Instance](./public/axios-instance.png)

**Example**:

```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

> Note: Axios config contains many fields, but not all are suitable for global configuration. Some options are method-specific (e.g., `data`, `params`) and should be defined per request to avoid unintended side effects.

**Global Config vs Per-request Config**:

| Aspect       | Global Config                                      | Per-request Config                                  |
| ------------ | -------------------------------------------------- | --------------------------------------------------- |
| **Where**    | Set in `axios.create()`                            | Passed as second parameter to request methods       |
| **Scope**    | Applied to ALL requests made with the instance     | Applied to a SPECIFIC request only                  |
| **Purpose**  | Set defaults that every request should have        | Override or add config for specific requests        |
| **Example**  | `baseURL`, `timeout`, `headers`, `withCredentials` | `params`, `data`, `method`, `url`, custom `timeout` |
| **Use Case** | Common settings like API base URL, default headers | Request-specific data, query params, custom headers |

#### Interceptors (Very Important)

Interceptors are functions from `axiosInstance` that run **before a request is sent** or **after a response is received**, allowing centralized side effects and logic reuse.

![Interceptors](./public/interceptors.png)

**Request Interceptor**:

- Executes before the HTTP request is sent.
- Common use cases: attach auth tokens, set headers, log requests, or modify config.
- Must return config or a Promise that resolves to config.

**Response Interceptor**:

- Executes after a response is received (success or error).
- Common use cases: normalize errors, handle token refresh, or global error handling.

#### Axios vs Fetch API

| Aspect                              | Axios                                                      | Fetch API                                                          |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| **Package**                         | External library (axios)                                   | Built-in browser API (fetch)                                       |
| **Request/Response**                | Automatically transforms JSON data                         | Requires manual `.json()` call                                     |
| **Error Handling**                  | Treats 4xx/5xx as errors automatically                     | Only rejects on network errors; 4xx/5xx are "successful" responses |
| **Request Timeout**                 | Built-in timeout support                                   | Requires `AbortController` for timeout                             |
| **Interceptors**                    | Built-in request/response interceptors                     | No built-in interceptors (need manual wrapper)                     |
| **Request Cancellation**            | Built-in with `AbortController`                            | Uses `AbortController`                                             |
| **Instance & Config**               | Can create instances with default config                   | No instance concept; need to wrap in function                      |
| **TypeScript Support**              | Excellent TypeScript support                               | Basic TypeScript support                                           |
| **Bundle Size**                     | ~13KB (minified + gzipped)                                 | 0KB (native API)                                                   |

---

### 2. TanStack Query Terminology

#### Server State vs Client State

| Aspect              | Server State                                        | Client/UI State                                         |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| **Source**          | Data from server/API                                | Data managed in component                               |
| **Managed by**      | TanStack Query                                      | React state (useState, useReducer)                      |
| **Source of Truth** | Server is the source of truth                       | Component state is the source of truth                  |
| **Synchronization** | Needs sync with server, caching, background updates | No sync needed, local only                              |
| **Examples**        | Posts list, user profile, product data              | Form inputs, UI toggles, modal open/close, selected tab |

#### Query Fundamentals

**Query**: `useQuery` binds an async read operation to a unique cache key, manages its lifecycle, and exposes the result to React components.

![useQuery options](./public/useQuery-input.png)

![useQuery result](./public/useQuery-output.png)

**Mutations**: `useMutation` manages write operations (create, update, delete) and their side effects on server state.

![useMutation input](./public/useMutation-input.png)

![useMutation result](./public/useMutation-output.png)

---

### 3. Cache & Sync Terminology

![Use Query Client](./public/useQueryClient.png)

**Cache Invalidation**: Marking cached data as stale so TanStack Query refetches it. Done via `queryClient.invalidateQueries()`.

**Polling**: Automatically refetch data at regular intervals using `refetchInterval`.

**Deduplication**: When multiple components request the same query key simultaneously, only one HTTP request is made.

**Prefetch**: Fetch and cache data before the user navigates to it using `queryClient.prefetchQuery()`.

---

### 4. Combining Axios + TanStack Query + TypeScript

![Architecture](./public/architecture.png)

**Recommended Structure**:

```text
src/
├── api/
│   ├── axios-instance.ts   # Axios instance, interceptors, AppError
│   ├── token.ts            # Token read/write helpers
│   ├── auth.api.ts
│   ├── user.api.ts
│   └── post.api.ts
│
├── hooks/
│   ├── queries/
│   │   └── useUserQuery.ts
│   └── mutations/
│       ├── useLoginMutation.ts
│       └── useUpdateProfileMutation.ts
│
├── providers/
│   └── react-query.provider.tsx
│
├── lib/
│   └── queryClient.ts
│
├── constants/
│   └── queryKeys.ts
│
└── types/
    └── post.ts
    └── user.ts

```

---

## Basic Setup and Usage

### Step 1: Token Helpers (`token.ts`)

Centralize all token read/write logic in a dedicated file. No need for a wrapper object — export each function directly for cleaner imports.

**File: `src/api/token.ts`**

```typescript
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken?: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
```

---

### Step 2: Configure Axios Instance (`axios-instance.ts`)

**File: `src/api/axios-instance.ts`**

#### AppError — Normalized Error Class

Instead of catching raw `AxiosError` everywhere in the app, normalize all HTTP errors into a consistent `AppError` shape at the interceptor level. Every `catch` block then only needs to handle one type.

```typescript
export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

const normalizeError = (error: AxiosError): AppError => {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as Record<string, unknown> | undefined;
  const message = (data?.message as string) || error.message || "Something went wrong";
  const code = (data?.code as string) || `HTTP_${status}`;
  return new AppError(message, status, code);
};
```

#### Refresh Token Queue — Handling Concurrent 401s

A common production bug: when the access token expires and multiple requests are in-flight simultaneously, all of them receive `401` at the same time. Without proper handling, the app calls the refresh endpoint multiple times in parallel — the backend may reject subsequent calls, causing the user to be logged out unexpectedly.

**The fix**: use a queue + flag pattern. Only the first `401` triggers a refresh; all other concurrent requests wait in a queue and retry once the new token is ready.

```typescript
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

// Flush the queue after refresh succeeds or fails
const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};
```

**Flow**:
```
Requests A, B, C all receive 401

A → isRefreshing = false → starts refresh, sets isRefreshing = true
B → isRefreshing = true  → pushed to failedQueue, waits...
C → isRefreshing = true  → pushed to failedQueue, waits...

Refresh succeeds → processQueue(null, newToken)
  → B gets new token, retries
  → C gets new token, retries
  → isRefreshing = false
```

#### Session Expiry — Use Custom Event Instead of `window.location.href`

In a React SPA, avoid `window.location.href` for navigation — it causes a full page reload and loses React state. Instead, dispatch a custom event and let the app-level router listener handle the redirect.

```typescript
const dispatchSessionExpired = (): void => {
  clearTokens();
  window.dispatchEvent(new Event("session:expired"));
};

// In App.tsx or a top-level component:
// useEffect(() => {
//   const handler = () => navigate("/login", { replace: true });
//   window.addEventListener("session:expired", handler);
//   return () => window.removeEventListener("session:expired", handler);
// }, [navigate]);
```

#### Full Instance

```typescript
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token";

// --- Types ---

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// --- AppError ---

export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

const normalizeError = (error: AxiosError): AppError => {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as Record<string, unknown> | undefined;
  const message = (data?.message as string) || error.message || "Something went wrong";
  const code = (data?.code as string) || `HTTP_${status}`;
  return new AppError(message, status, code);
};

// --- Refresh token queue ---

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

// --- Refresh token API call ---
// Use base axios (not the instance) to avoid interceptor loop

const callRefreshToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new AppError("No refresh token", 401, "NO_REFRESH_TOKEN");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    { refresh_token: refreshToken }
  );

  const { access_token, refresh_token } = response.data;
  setTokens(access_token, refresh_token);
  return access_token;
};

// --- Session expiry ---

const dispatchSessionExpired = (): void => {
  clearTokens();
  window.dispatchEvent(new Event("session:expired"));
};

// --- Axios instance ---

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — handle 401 + refresh queue
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Non-401: normalize and reject
    if (error.response?.status !== 401) {
      return Promise.reject(normalizeError(error));
    }

    // Already retried → refresh token is also expired
    if (originalRequest._retry) {
      dispatchSessionExpired();
      return Promise.reject(normalizeError(error));
    }

    // Refresh in progress → queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers!.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    // First 401 → start refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await callRefreshToken();
      processQueue(null, newToken);
      originalRequest.headers!.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      dispatchSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
```

---

### Step 3: Create API Functions with DTOs

**DTO (Data Transfer Object)**: TypeScript interfaces defining the shape of data exchanged with the API. They act as a contract between frontend and backend.

```typescript
// types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
}
```

**File: `src/api/user.api.ts`**

```typescript
import axiosInstance from "./axios-instance";
import { User, CreateUserDTO, UpdateUserDTO } from "../types/user";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const res = await axiosInstance.get<User[]>("/users");
    return res.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const res = await axiosInstance.get<User>(`/users/${id}`);
    return res.data;
  },

  createUser: async (data: CreateUserDTO): Promise<User> => {
    const res = await axiosInstance.post<User>("/users", data);
    return res.data;
  },

  updateUser: async (id: number, data: UpdateUserDTO): Promise<User> => {
    const res = await axiosInstance.put<User>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};
```

**File: `src/api/auth.api.ts`**

```typescript
import axiosInstance from "./axios-instance";
import { LoginDTO, AuthResponse } from "../types/auth";

export const authApi = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },
};
```

---

### Step 4: Setup QueryClient

**File: `src/lib/queryClient.ts`**

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 10,        // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**File: `src/providers/react-query.provider.tsx`**

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "../lib/queryClient";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**File: `src/main.tsx`**

```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactQueryProvider } from "./providers/react-query.provider";

// Top-level listener for session expiry dispatched by the axios interceptor
function SessionGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => navigate("/login", { replace: true });
    window.addEventListener("session:expired", handler);
    return () => window.removeEventListener("session:expired", handler);
  }, [navigate]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <BrowserRouter>
        <SessionGuard>
          <App />
        </SessionGuard>
      </BrowserRouter>
    </ReactQueryProvider>
  </React.StrictMode>
);
```

---

### Step 5: Query Keys Factory

**File: `src/constants/queryKeys.ts`**

```typescript
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: number) => [...queryKeys.users.all, "detail", id] as const,
  },
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "currentUser"] as const,
  },
};
```

---

### Step 6: Query & Mutation Hooks

**File: `src/hooks/queries/useUserQuery.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: userApi.getUsers,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });
}
```

**File: `src/hooks/mutations/useLoginMutation.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { setTokens } from "../../api/token";
import { queryKeys } from "../../constants/queryKeys";
import { AppError } from "../../api/axios-instance";
import { LoginDTO } from "../../types/auth";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDTO) => authApi.login(data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
    onError: (error) => {
      if (error instanceof AppError) {
        console.error(`[${error.code}] ${error.message}`);
      }
    },
  });
}
```

**File: `src/hooks/mutations/useUpdateProfileMutation.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";
import { AppError } from "../../api/axios-instance";
import { UpdateUserDTO } from "../../types/user";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) =>
      userApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      if (error instanceof AppError) {
        console.error(`[${error.code}] ${error.message} (HTTP ${error.status})`);
      }
    },
  });
}
```

---

### Step 7: Use in Components

**File: `src/components/user/UserList.tsx`**

```typescript
import { useUsers } from "../../hooks/queries/useUserQuery";
import { AppError } from "../../api/axios-instance";

export function UserList() {
  const { data: users, isLoading, isError, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;

  if (isError) {
    const message = error instanceof AppError
      ? `[${error.code}] ${error.message}`
      : "Unexpected error";
    return <div>Error: {message}</div>;
  }

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**File: `src/components/user/UserProfile.tsx`**

```typescript
import { useUser } from "../../hooks/queries/useUserQuery";
import { useUpdateProfileMutation } from "../../hooks/mutations/useUpdateProfileMutation";
import { AppError } from "../../api/axios-instance";

export function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading, isError, error } = useUser(userId);
  const updateProfile = useUpdateProfileMutation();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{error instanceof AppError ? error.message : "Error"}</div>;
  if (!user) return <div>User not found</div>;

  const handleUpdate = async () => {
    try {
      await updateProfile.mutateAsync({ id: userId, data: { name: "New Name" } });
    } catch (error) {
      if (error instanceof AppError) {
        alert(`Failed (${error.status}): ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={handleUpdate} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Updating..." : "Update Profile"}
      </button>
      {updateProfile.isError && updateProfile.error instanceof AppError && (
        <p style={{ color: "red" }}>{updateProfile.error.message}</p>
      )}
    </div>
  );
}
```

---

## Advanced Patterns

### 1. Optimistic Updates

```typescript
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostDTO }) =>
      postsApi.updatePost(id, data),

    onMutate: async ({ id, data }) => {
      // Cancel in-flight queries to avoid overwriting the optimistic update
      await queryClient.cancelQueries({ queryKey: postKeys.detail(id) });
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData<Post>(postKeys.detail(id), (old) =>
        old ? { ...old, ...data } : old
      );

      return { previousPost };
    },

    onError: (_, { id }, context) => {
      // Roll back on failure
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(id), context.previousPost);
      }
    },

    onSettled: (_, __, { id }) => {
      // Always sync with server after mutation
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
    },
  });
}
```

### 2. Polling

```typescript
export function usePostsWithPolling(interval = 5000) {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: postsApi.getPosts,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
  });
}
```

### 3. Prefetching

```typescript
export function usePrefetchPost() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: postKeys.detail(id),
      queryFn: () => postsApi.getPostById(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}

// Usage — prefetch on hover before user navigates
<li onMouseEnter={() => prefetchPost(post.id)}>
  <Link to={`/posts/${post.id}`}>{post.title}</Link>
</li>
```

---

## References

- [Axios Documentation](https://axios-http.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)