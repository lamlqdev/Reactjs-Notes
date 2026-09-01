# Error Boundaries & Error Handling Patterns

Notes on catching and recovering from errors in React — what an Error Boundary actually catches (narrower than most people assume), how it pairs with [`Suspense`](../18_Suspense_Concurrent_Rendering/README.md), and where a boundary is the wrong tool entirely.

---

## 1. Mental Model

### 1.1 Error Boundaries only catch render-phase errors

An Error Boundary catches errors thrown during **rendering** — a component's function body, its lifecycle methods, hooks evaluated during render, or a `lazy()` component's module failing to load. It does **not** catch:

- Errors inside event handlers (`onClick`, `onSubmit`) — these need a normal `try/catch` in the handler itself.
- Errors inside `async` code (a `.then()`/`await` after the render that scheduled it has already finished) — same, `try/catch` at the call site, or explicitly re-throw during a render (see 3.3).
- Errors during server-side rendering on the server itself.
- Errors thrown by the boundary's own `render()` — a boundary can't catch its own failure; nest another boundary above it if that matters.

This is the same class of "what actually happens during render vs. outside it" distinction that matters for [Suspense](../18_Suspense_Concurrent_Rendering/README.md#12-suspense--declarative-loading-states-for-the-tree) — a promise thrown during render suspends; an error thrown during render is caught by the nearest boundary above. Anything outside the render call stack (handlers, timers, network callbacks) is on its own.

### 1.2 `getDerivedStateFromError` vs. `componentDidCatch`

An Error Boundary is still a **class component** — React hasn't added a hook equivalent. Two lifecycle methods split the job:

```tsx
class ErrorBoundary extends React.Component<{ children?: React.ReactNode }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error }; // must be pure — only returns new state, no side effects
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logErrorToService(error, info); // side effects (logging) belong here, not above
  }

  render() {
    if (this.state.error) {
      return <div>Something went wrong: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}
```

`getDerivedStateFromError` runs during the render phase — it must be pure, its only job is producing the state that swaps in the fallback UI. `componentDidCatch` runs during the commit phase, right after — that's where logging/reporting side effects belong.

### 1.3 `react-error-boundary` — the idiomatic wrapper

Writing the class above by hand every time is what most teams avoid by reaching for [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary), which wraps the same two lifecycle methods behind a component API:

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback} onError={logErrorToService}>
  <MyComponent />
</ErrorBoundary>
```

`FallbackComponent` receives `error` and `resetErrorBoundary` as props — this is what makes a "Try again" button possible without writing a class yourself.

### 1.4 React 19 root-level error handlers — centralized reporting, not fallback UI

`createRoot(container, options)` accepts `onUncaughtError`, `onCaughtError`, and `onRecoverableError` — these fire for *every* error React encounters at the root level, whether or not a boundary caught it, and are meant for centralized logging/reporting (Sentry, Datadog), not for rendering a fallback:

```tsx
createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    // an ErrorBoundary caught this — still worth reporting
    reportToService(error, errorInfo);
  },
  onUncaughtError: (error, errorInfo) => {
    // nothing caught this — the app crashed to a blank screen
    reportToService(error, errorInfo);
  },
})
```

This is a different layer from a component-level `ErrorBoundary`: root options are app-wide observability; `ErrorBoundary` is what decides what the *user* sees for one subtree.

---

## 2. Basic Usage

### Example: boundary around one risky subtree

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function Dashboard() {
  return (
    <Layout>
      <ErrorBoundary fallback={<p>Couldn't load the chart.</p>}>
        <RevenueChart /> {/* if this throws during render, only this section is replaced */}
      </ErrorBoundary>
      <RecentOrders /> {/* unaffected even if RevenueChart's boundary triggers */}
    </Layout>
  );
}
```

### Example: retry with `resetErrorBoundary`

```tsx
<ErrorBoundary
  fallbackRender={({ error, resetErrorBoundary }) => (
    <div>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )}
  onReset={(details) => {
    if (details.reason === 'imperative-api') refetchData();
  }}
>
  <RevenueChart />
</ErrorBoundary>
```

`resetErrorBoundary` clears the caught error and re-renders `children` — it doesn't fix the underlying cause by itself, so `onReset` is where you'd trigger a refetch or reset the state that caused the failure in the first place.

---

## 3. Advanced Usage

### 3.1 Boundary granularity — mirror your Suspense boundaries

**When**: deciding how many boundaries a page needs, and where.

The same reasoning from [nested Suspense boundaries](../18_Suspense_Concurrent_Rendering/README.md#31-nested-suspense-boundaries--granular-loading-over-one-big-spinner) applies to error boundaries — and the two are usually placed together, since a component that can suspend can often also fail:

```tsx
<ErrorBoundary fallback={<SidebarError />}>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</ErrorBoundary>
```

One boundary per page is the "big spinner" equivalent for errors — one failing widget takes down the whole page's UI. One boundary per independent section keeps failures contained to where they happened.

### 3.2 What a boundary can't catch — handlers and async code

**When**: an error happens in an `onClick` handler or inside an `async` function, and the nearest `ErrorBoundary` never triggers (§1.1 explains why).

The fix is either a local `try/catch` with your own error state, or — if you want the *same* boundary that handles render errors to also handle this one — `react-error-boundary`'s `useErrorBoundary()`:

```tsx
import { useErrorBoundary } from 'react-error-boundary'

function SaveButton() {
  const { showBoundary } = useErrorBoundary();

  async function handleClick() {
    try {
      await api.save();
    } catch (error) {
      showBoundary(error); // manually hands the error to the nearest ErrorBoundary
    }
  }

  return <button onClick={handleClick}>Save</button>;
}
```

### 3.3 Form/action errors — state, not thrown errors

**When**: an error happens inside a [React 19 form action](../09_React_Hook_Form/REACT_19_FORM_ACTIONS.md) or a [Server Action](../17_Server_Components_Actions/SERVER_ACTIONS.md).

These are deliberately **not** modeled as thrown errors caught by a boundary — the action returns an error in its state instead, and the form renders that state inline:

```tsx
async function submitAction(prevState: FormState, formData: FormData) {
  if (!isValid(formData)) return { error: 'Invalid input' }; // not a throw
  await api.save(formData);
  return { error: null };
}
```

This is the right call for expected, recoverable failures (validation, a duplicate email) — a full-page/section fallback via `ErrorBoundary` is the wrong UX for "you typed something wrong." Reserve `ErrorBoundary` for *unexpected* failures (a bug, a crashed dependency); use action state for *expected* ones the user can fix and resubmit.

---

## Summary

| Concept | Theory | Practice |
|---|---|---|
| What render-phase errors are | 1.1 | — |
| Class-based boundary API | 1.2 | Hand-written `ErrorBoundary` (1.2) |
| Idiomatic wrapper | 1.3 | `react-error-boundary` (2) |
| App-wide error reporting | 1.4 | `createRoot` options |
| Boundary placement | — | Paired with `Suspense` (3.1) |
| Handler/async errors | — | `try/catch` + `showBoundary` (3.2) |
| Expected vs. unexpected failures | — | Action state vs. `ErrorBoundary` (3.3) |

---

**References**:

- [React — `Component` (Error Boundaries)](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React — `createRoot` error handling options](https://react.dev/reference/react-dom/client/createRoot#parameters)
- [react-error-boundary Documentation](https://github.com/bvaughn/react-error-boundary)
