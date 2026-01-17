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
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
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

- Request interceptor executes before the HTTP request is sent.
- Common use cases: attach auth tokens, set headers, log requests, or modify config.
- Must return config or Promise that resolves to config

**Example**:

```typescript
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add auth token to every request
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Response Interceptor**:

- Response interceptor executes **after a response is received** (success or error).
- Common use cases: unwrap response.data, normalize errors, handle token refresh, or global error handling.

**Example**:

```typescript
axiosInstance.interceptors.response.use(
  (response) => {
    // Success - can transform data here
    return response;
  },
  async (error) => {
    // Handle 401 - Refresh token flow
    if (error.response?.status === 401) {
      // Refresh token and retry original request
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);
```

#### Axios vs Fetch API

Before diving into Axios, let's understand why Axios is often preferred over the native Fetch API:

| Aspect                              | Axios                                                      | Fetch API                                                          |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| **Package**                         | External library (axios)                                   | Built-in browser API (fetch)                                       |
| **Request/Response**                | Automatically transforms JSON data                         | Requires manual `.json()` call                                     |
| **Error Handling**                  | Rejects only on network errors; treats 4xx/5xx as errors   | Only rejects on network errors; 4xx/5xx are "successful" responses |
| **Request Timeout**                 | Built-in timeout support                                   | Requires `AbortController` for timeout                             |
| **Interceptors**                    | Built-in request/response interceptors                     | No built-in interceptors (need manual wrapper)                     |
| **Request Cancellation**            | Built-in with `CancelToken` (v0.22+) or `AbortController`  | Uses `AbortController`                                             |
| **Progress Tracking**               | Built-in support for upload/download progress              | No built-in support                                                |
| **Automatic JSON**                  | Automatically stringifies request body and parses response | Manual `JSON.stringify()` and `.json()`                            |
| **Request/Response Transformation** | Built-in transform functions                               | Manual transformation needed                                       |
| **Instance & Config**               | Can create instances with default config                   | No instance concept; need to wrap in function                      |
| **Browser Support**                 | Works in Node.js and browsers                              | Browser-only (Node.js needs `node-fetch`)                          |
| **TypeScript Support**              | Excellent TypeScript support                               | Basic TypeScript support                                           |
| **Bundle Size**                     | ~13KB (minified + gzipped)                                 | 0KB (native API)                                                   |
| **Syntax**                          | More concise and intuitive                                 | More verbose                                                       |

**Example Comparison**:

```typescript
// Fetch API
fetch("http://localhost:3000/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ title: "New Post", body: "Content" }),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));

// Axios
axios
  .post(
    "http://localhost:3000/posts",
    {
      title: "New Post",
      body: "Content",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  .then((response) => console.log(response.data))
  .catch((error) => console.error("Error:", error));
```

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
| **Lifecycle**       | Persists across page refreshes (from server)        | Resets on page refresh (unless persisted)               |
| **Sharing**         | Shared across components via TanStack Query cache   | Local to component (unless lifted up or Context)        |
| **Updates**         | Invalidated and refetched when server data changes  | Updated directly via setState/dispatch                  |
| **Use Case**        | Data fetched from API, needs caching and sync       | UI interactions, temporary state, form state            |

#### Query Fundamentals

**Query**: `useQuery` binds an async read operation to a unique cache key, manages its lifecycle, and exposes the result to React components. It takes an options object as input, some common properties are:

![useQuery options](./public/useQuery-input.png)

`useQuery` returns an object containing query state and data:

![useQuery result](./public/useQuery-output.png)

**Mutations**: `useMutation` manages write operations (create, update, delete) and their side effects on server state. It takes an options object as input, some common properties are:

![useMutation input](./public/useMutation-input.png)

`useMutation` returns an object containing mutation state and methods:

![useMutation result](./public/useMutation-output.png)

---

### 3. Cache & Sync Terminology

![Use Query Client](./public/useQueryClient.png)

**Cache Invalidation**:

Cache invalidation is the process of marking cached data as stale, which tells TanStack Query that the data may be outdated and needs to be refreshed. This is done using the `invalidateQueries()` method on the query client.

When you invalidate a query, TanStack Query automatically triggers a refetch of that data in the background, ensuring your UI stays synchronized with the server state. You can invalidate all queries matching a certain key pattern, or target specific queries precisely.

**Example**:

```typescript
// Invalidate all queries starting with ["posts"]
queryClient.invalidateQueries({ queryKey: ["posts"] });
// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["posts", "detail", 1] });
```

**Automatic Refetch**:

TanStack Query automatically refetches stale data to keep your application synchronized with the server. This automatic refetching happens in several scenarios:

- When a component mounts and the query is stale,
- When the browser window regains focus (user switches back to the tab),
- When the network reconnects after being offline,
- Or when a query is explicitly invalidated.

This ensures that users always see up-to-date data without manual intervention.

**Refetch on Window Focus**:

One of the most useful automatic refetch behaviors is refetching when the user returns to the tab. This is particularly valuable for applications where data changes frequently, as it ensures users see the latest information when they come back to your application.

However, if this behavior is not desired for your use case, you can disable it by setting `refetchOnWindowFocus: false` in your query options.

**Polling**:

Polling allows you to automatically refetch data at regular intervals, which is useful for real-time applications or dashboards that need to display frequently changing data.

By setting the `refetchInterval` option in your query configuration, TanStack Query will continuously refetch the data at the specified interval (in milliseconds). You can also control whether polling should continue when the browser tab is in the background using `refetchIntervalInBackground`.

**Example**:

```typescript
useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  refetchInterval: 5000, // Refetch every 5 seconds
  refetchIntervalInBackground: false, // Don't poll when tab is in background
});
```

**Deduplication**:

Deduplication is a powerful feature that prevents unnecessary API calls when multiple components request the same data simultaneously. When several components use `useQuery` with the same query key at the same time, TanStack Query intelligently deduplicates these requests, making only one actual HTTP request to the server.

All components that requested the data will receive the same result, improving performance and reducing server load. For example, if three components call `useQuery({ queryKey: ["posts"], queryFn: fetchPosts })` at the same time, only one API request is made, and all three components receive the same data.

**Prefetch**:

Prefetching is a performance optimization technique where data is fetched before the user actually needs it, making the application feel faster and more responsive. By prefetching data that users are likely to request next (such as when they hover over a link or button), you can have the data ready in the cache by the time they navigate to that page or component.

This eliminates loading states and creates a smoother user experience. Prefetching is done using `queryClient.prefetchQuery()`, which fetches and caches the data without triggering any loading states in components that might be using that query.

**Example**:

```typescript
// Prefetch on hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });
};
```

---

### 4. Combining Axios + TanStack Query + TypeScript

![Architecture](./public/architecture.png)

**Example Structure**:

```text
src/
├── api/                    # Axios layer - HTTP communication
│   ├── axios.ts           # Axios instance & interceptors
│   ├── auth.api.ts        # Auth API functions
│   ├── user.api.ts        # User API functions
│   └── product.api.ts     # Product API functions
│
├── hooks/                  # TanStack Query layer - State management
│   ├── queries/           # Query hooks (read operations)
│   │   ├── useUserQuery.ts
│   │   └── useProductsQuery.ts
│   └── mutations/         # Mutation hooks (write operations)
│       ├── useLoginMutation.ts
│       └── useUpdateProfileMutation.ts
│
├── providers/             # React providers
│   └── react-query.provider.tsx  # QueryClientProvider wrapper
│
├── lib/                    # Library configurations
│   └── queryClient.ts     # QueryClient instance configuration
│
├── constants/             # Constants
│   └── queryKeys.ts       # Query keys factory
│
├── types/                  # TypeScript layer - Type definitions
│   ├── api.ts             # API response types
│   ├── auth.ts            # Auth types
│   └── user.ts            # User types
│
├── components/            # React components
│   ├── common/
│   └── user/
│
├── pages/                 # Page components (React Router)
│   └── ...
│
└── App.tsx                # Root component
```

---

## Basic Setup and Usage

### Step 1: Configure Axios Instance (API Layer)

**File: `src/api/axios.ts`**

```typescript
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  tokenStorage,
  refreshAccessToken,
  isTokenExpired,
} from "../utils/auth";
import { createRetryLogic, defaultRetryCondition } from "../utils/retry";

// Create axios instance with default configuration
export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Auth token injection
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - Refresh token flow & retry logic
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Handle 401 - Refresh token
    if (error.response?.status === 401) {
      // Refresh token logic...
    }
    // Retry logic for network/5xx errors
    if (defaultRetryCondition(error)) {
      // Retry with exponential backoff...
    }
    return Promise.reject(error);
  }
);
```

### Step 2: Create API Functions with DTOs (API Layer)

**DTO (Data Transfer Object)**: TypeScript interfaces that define the structure of data transferred between frontend and backend API. They provide type safety and serve as contracts for API requests and responses.

**Example**:

```typescript
export interface CreateUserDTO {
  name: string;
  email: string;
  age: number;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  age?: number;
}
```

**File: `src/api/user.api.ts`** (Example - similar structure for other API files)

```typescript
import { axiosInstance } from "./axios";
import { AxiosResponse } from "axios";
import { User, CreateUserDTO, UpdateUserDTO } from "../types/user";

// API functions with typed responses
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await axiosInstance.get<User[]>(
      "/users"
    );
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.get<User>(
      `/users/${id}`
    );
    return response.data;
  },

  createUser: async (data: CreateUserDTO): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.post<User>(
      "/users",
      data
    );
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserDTO): Promise<User> => {
    const response: AxiosResponse<User> = await axiosInstance.put<User>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};
```

**File: `src/api/auth.api.ts`** (Example for auth endpoints)

```typescript
import { axiosInstance } from "./axios";
import { AxiosResponse } from "axios";
import { LoginDTO, AuthResponse } from "../types/auth";

export const authApi = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> =
      await axiosInstance.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> =
      await axiosInstance.post<AuthResponse>("/auth/refresh", { refreshToken });
    return response.data;
  },
};
```

### Step 3: Setup QueryClient and Wrap App with QueryClientProvider (TanStack Query Layer)

> **Important**: You **MUST** wrap your application with `QueryClientProvider` to use TanStack Query hooks (`useQuery`, `useMutation`, etc.). Without wrapping, the hooks will throw an error when you try to use them.

**File: `src/lib/queryClient.ts`**

```typescript
import { QueryClient } from "@tanstack/react-query";

// Create QueryClient instance with default configuration
// QueryClient manages cache and state of all queries/mutations
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
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

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**File: `src/main.tsx`**

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ReactQueryProvider } from "./providers/react-query.provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <App />
    </ReactQueryProvider>
  </React.StrictMode>
);
```

**Explanation:**

- **`lib/queryClient.ts`**: Centralized QueryClient configuration that can be reused across the application (e.g., for testing, DevTools).
- **`providers/react-query.provider.tsx`**: Reusable provider component that wraps QueryClientProvider with your configuration.
- **`main.tsx`**: Root entry point that wraps the app with ReactQueryProvider.

### Step 4: Create Query Keys Factory (TanStack Query Layer)

**File: `src/constants/queryKeys.ts`**

```typescript
export const queryKeys = {
  // User queries
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: number) => [...queryKeys.users.all, "detail", id] as const,
  },

  // Product queries
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    detail: (id: number) => [...queryKeys.products.all, "detail", id] as const,
  },

  // Auth queries
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "currentUser"] as const,
  },
};
```

### Step 5: Create Query Hooks (TanStack Query Layer)

**File: `src/hooks/queries/useUserQuery.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: userApi.getUsers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
```

**File: `src/hooks/mutations/useLoginMutation.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";
import { queryKeys } from "../../constants/queryKeys";
import { LoginDTO } from "../../types/auth";
import { normalizeError } from "../../utils/errorHandler";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDTO) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
    onError: (error) => {
      const normalizedError = normalizeError(error);
      console.error("Login error:", normalizedError);
    },
  });
}
```

**File: `src/hooks/mutations/useUpdateProfileMutation.ts`**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user.api";
import { queryKeys } from "../../constants/queryKeys";
import { UpdateUserDTO } from "../../types/user";
import { normalizeError } from "../../utils/errorHandler";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) =>
      userApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      const normalizedError = normalizeError(error);
      console.error("Update profile error:", normalizedError);
    },
  });
}
```

### Step 6: Use in Components (UI Layer)

**File: `src/components/user/UserList.tsx`**

```typescript
import { useUsers } from "../../hooks/queries/useUserQuery";
import { getErrorMessage } from "../../utils/errorHandler";

export function UserList() {
  const { data: users, isLoading, error, isError } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    const errorMessage = getErrorMessage(error);
    return <div>Error: {errorMessage}</div>;
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

**File: `src/components/user/UserProfile.tsx`** (Example with mutation)

```typescript
import { useUser } from "../../hooks/queries/useUserQuery";
import { useUpdateProfileMutation } from "../../hooks/mutations/useUpdateProfileMutation";
import { getErrorMessage, isNetworkError } from "../../utils/errorHandler";

export function UserProfile({ userId }: { userId: number }) {
  const { data: user, isLoading, error, isError } = useUser(userId);
  const updateProfile = useUpdateProfileMutation();

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    const errorMessage = getErrorMessage(error);
    return <div>Error: {errorMessage}</div>;
  }
  if (!user) return <div>User not found</div>;

  const handleUpdate = async () => {
    try {
      await updateProfile.mutateAsync({
        id: userId,
        data: { name: "Updated Name" },
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      if (isNetworkError(error)) {
        alert("Network error. Please check your connection.");
      } else {
        alert(`Failed to update: ${errorMessage}`);
      }
    }
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={handleUpdate} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Updating..." : "Update Profile"}
      </button>
      {updateProfile.isError && (
        <div style={{ color: "red" }}>
          {getErrorMessage(updateProfile.error)}
        </div>
      )}
    </div>
  );
}
```

---

## Advanced Patterns

### 1. Optimistic Updates

**File: `src/hooks/usePosts.ts`**

```typescript
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostDTO }) =>
      postsApi.updatePost(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(id) });
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(id));

      queryClient.setQueryData<Post>(postKeys.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousPost };
    },

    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          postKeys.detail(variables.id),
          context.previousPost
        );
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.id),
      });
    },
  });
}
```

### 2. Polling

**File: `src/hooks/usePosts.ts`**

```typescript
export function usePostsWithPolling(interval: number = 5000) {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: postsApi.getPosts,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
  });
}
```

### 3. Prefetching

**File: `src/hooks/usePosts.ts`**

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
```

---

## References

- [Axios Documentation](https://axios-http.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
