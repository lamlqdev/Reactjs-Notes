# Custom Hooks with TypeScript

A comprehensive demo application demonstrating how to create and use **Custom Hooks** in React with **TypeScript** to extract and reuse stateful logic across components.

---

## Core Terminology

### Custom Hooks

**Custom Hooks** are JavaScript functions that start with "use" and may call other React Hooks. They allow you to extract component logic into reusable functions.

**Rules of Hooks**:

1. Only call hooks at the top level (not inside loops, conditions, or nested functions)
2. Only call hooks from React function components or custom hooks
3. Custom hooks must start with "use" prefix

**Syntax**:

```typescript
function useCustomHook() {
  // Use React hooks here
  const [state, setState] = useState();

  // Return values or functions
  return { state, setState };
}
```

**When to use**: When you want to reuse stateful logic between components. Custom hooks let you share logic without duplicating code.

**Example**:

```typescript
// Custom hook
function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// Usage in component
function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Benefits of Custom Hooks

1. **Code Reusability**: Share logic between multiple components
2. **Separation of Concerns**: Extract complex logic from components
3. **Testability**: Test hooks independently from components
4. **Readability**: Components become cleaner and easier to understand
5. **Maintainability**: Update logic in one place

---

## Basic: Basic Custom Hooks

This section guides you through creating and using basic custom hooks.

### Example 1: useLocalStorage Hook

**When to use**: When you need to persist state in localStorage and sync it with React state.

**File: `src/hooks/useLocalStorage.ts`**

```typescript
import { useState, useEffect } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Wrapper function that persists to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

**Explanation**:

- Generic type `<T>` allows the hook to work with any type
- `useState` with function initializer reads from localStorage on first render
- `setValue` function handles both direct values and updater functions (like `useState`)
- Automatically saves to localStorage whenever value changes
- Returns tuple `[value, setValue]` matching `useState` API

**Usage**:

```typescript
const [name, setName] = useLocalStorage<string>("user-name", "");
const [count, setCount] = useLocalStorage<number>("count", 0);

// Use like useState
setName("John");
setCount((c) => c + 1);
```

### Example 2: useDebounce Hook

**When to use**: When you want to delay updating a value until after a specified delay (e.g., search inputs, API calls).

**File: `src/hooks/useDebounce.ts`**

```typescript
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Explanation**:

- Takes a `value` and `delay` in milliseconds
- Creates a timeout that updates `debouncedValue` after the delay
- Cleans up timeout if `value` changes before delay completes
- Returns the debounced value

**Usage**:

```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearchTerm = useDebounce(searchTerm, 500);

// searchTerm updates immediately
// debouncedSearchTerm updates 500ms after user stops typing
useEffect(() => {
  if (debouncedSearchTerm) {
    // Make API call with debouncedSearchTerm
  }
}, [debouncedSearchTerm]);
```

### Example 3: useToggle Hook

**When to use**: When you need to toggle a boolean value (modals, dropdowns, switches).

**File: `src/hooks/useToggle.ts`**

```typescript
import { useState, useCallback } from "react";

function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}
```

**Explanation**:

- Returns current value, toggle function, and setter function
- `toggle` function flips the boolean value
- `useCallback` memoizes toggle function to prevent unnecessary re-renders
- Can also set value directly using the setter

**Usage**:

```typescript
const [isOpen, toggle, setIsOpen] = useToggle(false);

// Toggle the value
toggle();

// Set specific value
setIsOpen(true);
```

### Example 4: useWindowSize Hook

**When to use**: When you need to track window dimensions for responsive design.

**File: `src/hooks/useWindowSize.ts`**

```typescript
import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Call immediately to set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
```

**Explanation**:

- Initializes state with current window dimensions
- Adds resize event listener on mount
- Updates state when window is resized
- Removes event listener on cleanup
- Returns object with `width` and `height`

**Usage**:

```typescript
const { width, height } = useWindowSize();

// Conditional rendering based on window size
{
  width < 768 && <MobileView />;
}
{
  width >= 768 && <DesktopView />;
}
```

---

## Advanced: Advanced Custom Hooks

This section covers more complex custom hooks and patterns.

### Example 1: useMediaQuery Hook

**When to use**: When you need to react to CSS media query changes (responsive design, dark mode detection).

**File: `src/hooks/useMediaQuery.ts`**

```typescript
import { useState, useEffect } from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}
```

**Explanation**:

- Uses `window.matchMedia()` to check if media query matches
- Initializes state with current match value
- Listens for changes to media query
- Handles both modern (`addEventListener`) and legacy (`addListener`) APIs
- Returns boolean indicating if query matches

**Usage**:

```typescript
const isMobile = useMediaQuery("(max-width: 640px)");
const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

{
  isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

### Example 2: useFetch Hook

**When to use**: When you need to fetch data from APIs with loading and error states.

**File: `src/hooks/useFetch.ts`**

```typescript
import { useState, useEffect } from "react";

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T = unknown>(
  url: string,
  options?: { skip?: boolean }
): UseFetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: !options?.skip,
    error: null,
  });

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("An unknown error occurred"),
      });
    }
  };

  useEffect(() => {
    if (!options?.skip) {
      fetchData();
    }
  }, [url, options?.skip]);

  return { ...state, refetch: fetchData };
}
```

**Explanation**:

- Manages `data`, `loading`, and `error` states
- Fetches data when URL changes or component mounts
- Handles errors gracefully
- Returns `refetch` function to manually trigger fetch
- Supports `skip` option to prevent automatic fetching

**Usage**:

```typescript
const { data, loading, error, refetch } = useFetch<User>(
  "https://api.example.com/users/1"
);

if (loading) return <Spinner />;
if (error) return <Error message={error.message} />;
return <div>{data.name}</div>;
```

### Example 4: usePrevious Hook

**When to use**: When you need to track the previous value of a state or prop.

**File: `src/hooks/usePrevious.ts`**

```typescript
import { useRef, useEffect } from "react";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

**Explanation**:

- Uses `useRef` to store previous value without causing re-renders
- Updates ref in `useEffect` after render completes
- Returns previous value (undefined on first render)
- Useful for comparing current and previous values

**Usage**:

```typescript
const [count, setCount] = useState(0);
const previousCount = usePrevious(count);

// Detect change
if (previousCount !== undefined && count > previousCount) {
  console.log("Count increased!");
}
```

---

## Custom Hook Patterns

### Pattern 1: Returning Object vs Array

**Object Return** (Better for multiple values):

```typescript
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount, increment: () => setCount((c) => c + 1) };
}

// Usage
const { count, increment } = useCounter();
```

**Array Return** (Better for single value, matches useState API):

```typescript
function useToggle() {
  const [value, setValue] = useState(false);
  return [value, () => setValue((v) => !v)];
}

// Usage
const [isOpen, toggle] = useToggle();
```

### Pattern 2: Generic Types

**Generic hooks** work with any type:

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Implementation
}

// Usage with different types
const [name, setName] = useLocalStorage<string>("name", "");
const [count, setCount] = useLocalStorage<number>("count", 0);
const [user, setUser] = useLocalStorage<User | null>("user", null);
```

### Pattern 3: Composing Hooks

**Combine multiple hooks** to create more powerful hooks:

```typescript
function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay: number
) {
  const [value, setValue] = useLocalStorage(key, initialValue);
  const debouncedValue = useDebounce(value, delay);
  return [debouncedValue, setValue] as const;
}
```

### Pattern 4: Conditional Hook Execution

**Skip hook execution** based on conditions:

```typescript
function useFetch<T>(url: string, options?: { skip?: boolean }) {
  // Only fetch if skip is false
  useEffect(() => {
    if (!options?.skip) {
      fetchData();
    }
  }, [url, options?.skip]);
}
```

---

## Summary

Custom Hooks enable code reuse and logic extraction in React:

1. **Custom Hooks**: Functions starting with "use" that can call other hooks
2. **Rules**: Follow Rules of Hooks (top level, React functions only)
3. **Reusability**: Share logic between components
4. **TypeScript**: Use generics for type-safe hooks
5. **Patterns**: Return objects or arrays based on use case
6. **Composition**: Combine hooks to create more powerful hooks
7. **Common Hooks**: useLocalStorage, useDebounce, useToggle, useWindowSize, etc.

---

## Learn More

After mastering the basic and advanced concepts above, you can continue learning the following topics:

### 1. Testing Custom Hooks

**Testing Strategies**:

- Use `@testing-library/react-hooks` (now part of `@testing-library/react`)
- Test hook behavior independently
- Test with different inputs and scenarios

**Example**:

```typescript
import { renderHook, act } from "@testing-library/react";
import useToggle from "./useToggle";

test("toggles value", () => {
  const { result } = renderHook(() => useToggle(false));

  expect(result.current[0]).toBe(false);

  act(() => {
    result.current[1](); // toggle
  });

  expect(result.current[0]).toBe(true);
});
```

**Documentation**: [Testing React Hooks](https://react.dev/reference/react/testing)

### 2. Advanced Hook Patterns

**Advanced Patterns**:

- **Hook Factories**: Functions that return hooks
- **Hook Composition**: Combining multiple hooks
- **Conditional Hooks**: Using hooks conditionally (with care)
- **Hook Dependencies**: Managing complex dependencies

**Example - Hook Factory**:

```typescript
function createUseApi<T>(endpoint: string) {
  return function useApi() {
    return useFetch<T>(`/api/${endpoint}`);
  };
}

const useUsers = createUseApi<User[]>("users");
const usePosts = createUseApi<Post[]>("posts");
```

### 3. Performance Optimization

**Optimization Techniques**:

- Use `useMemo` and `useCallback` in hooks
- Memoize expensive calculations
- Debounce/throttle expensive operations
- Avoid unnecessary re-renders

**Example**:

```typescript
function useExpensiveCalculation(data: Data[]) {
  const result = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  return result;
}
```

### 4. Error Handling in Hooks

**Error Handling Patterns**:

- Try-catch blocks in async operations
- Error state management
- Error boundaries for hook errors
- Graceful degradation

**Example**:

```typescript
function useSafeLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) setValue(JSON.parse(item));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [key]);

  return [value, setValue, error] as const;
}
```

### 5. Hook Dependencies Best Practices

**Dependency Management**:

- Include all dependencies in dependency arrays
- Use `useCallback` for stable function references
- Use `useMemo` for stable object references
- Understand when to omit dependencies

**Example**:

```typescript
function useApiCall(endpoint: string) {
  const fetchData = useCallback(async () => {
    // API call
  }, [endpoint]); // endpoint is dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is dependency
}
```

### 6. Custom Hooks Libraries

**Popular Libraries**:

- **react-use**: Collection of essential React hooks
- **ahooks**: High-quality React hooks library
- **usehooks-ts**: TypeScript-first React hooks library
- **swr**: Data fetching hook with caching

**Example with react-use**:

```typescript
import { useLocalStorage, useDebounce } from "react-use";

const [value, setValue] = useLocalStorage("key", "default");
const debouncedValue = useDebounce(value, 500);
```

**Documentation**: [react-use](https://github.com/streamich/react-use) | [ahooks](https://ahooks.js.org/)

### 7. Hook Composition Patterns

**Composition Strategies**:

- Combine multiple hooks
- Create hook hierarchies
- Share state between hooks
- Build complex behaviors from simple hooks

**Example**:

```typescript
function useFormWithValidation() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Combine multiple hooks
  const debouncedValues = useDebounce(values, 300);
  const [isSubmitting, toggleSubmitting] = useToggle(false);

  // Complex logic combining hooks
  return { values, errors, touched, isSubmitting /* ... */ };
}
```

### 8. TypeScript Advanced Patterns

**Advanced TypeScript**:

- Generic constraints
- Conditional types
- Utility types with hooks
- Type inference

**Example**:

```typescript
function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: E | null;
} {
  // Implementation
}
```

### 9. Hook Lifecycle Management

**Lifecycle Patterns**:

- Cleanup in useEffect
- Canceling requests
- Managing subscriptions
- Memory leak prevention

**Example**:

```typescript
function useSubscription<T>(
  subscribe: (callback: (data: T) => void) => () => void
) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe((newData) => {
      setData(newData);
    });

    return unsubscribe; // Cleanup subscription
  }, [subscribe]);

  return data;
}
```

---

## References

- [React Custom Hooks Documentation](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks API Reference](https://react.dev/reference/react)
- [Testing React Hooks](https://react.dev/reference/react/testing)
