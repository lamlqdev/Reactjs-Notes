# Suspense & Concurrent Rendering

Notes on React's concurrent rendering model — how `Suspense`, `useTransition`, and `useDeferredValue` let a slow update stay responsive instead of freezing the UI. This is a separate concern from [`04_React_Performance_Rendering`](../04_React_Performance_Rendering/README.md): that module is about rendering *less* (`memo`, `useMemo`, `useCallback`); this one is about rendering *without blocking*, even when the work itself doesn't shrink.

---

## 1. Mental Model

### 1.1 Concurrent rendering — interruptible, not synchronous

Before concurrent rendering, once React started rendering an update it ran to completion — a large re-render blocked the main thread, so a keystroke during that render just queued up and waited. Concurrent rendering lets React **start** rendering an update, **pause** partway through if something more urgent arrives (a keystroke, a click), handle that urgent work first, then resume or restart the paused render.

React decides what counts as "urgent" via a priority mechanism internally called **lanes** — you don't touch lanes directly, but every API in this module exists to tell React which lane an update belongs in: `useTransition`/`startTransition` mark an update as low-priority explicitly; `useDeferredValue` produces a low-priority *copy* of a value; plain `setState` stays high-priority (urgent) by default.

### 1.2 Suspense — declarative loading states for the tree

`<Suspense fallback={...}>` wraps part of the tree that might not be ready yet. If something inside it "suspends" — throws a promise, effectively — React shows `fallback` instead of that subtree, then swaps in the real content once the promise resolves.

```tsx
<Suspense fallback={<Spinner />}>
  <ProfilePage />
</Suspense>
```

What can suspend:
- A `React.lazy()` component whose code is still being fetched.
- A component reading an unresolved promise via `use()` (see [`17_Server_Components_Actions/SERVER_COMPONENTS.md §3.1`](../17_Server_Components_Actions/SERVER_COMPONENTS.md#31-streaming--dont-block-the-whole-page-on-one-slow-fetch) for the RSC streaming case).
- A framework's data-fetching layer that's built on Suspense (Relay, some Next.js/RSC patterns).

**Suspense does not catch errors** — a rejected promise or a thrown error still needs an `ErrorBoundary`. The two are usually paired: `ErrorBoundary` around `Suspense` around the component that might suspend *or* throw.

### 1.3 Transitions — telling React an update is not urgent

`useTransition` and `startTransition` mark a state update as a **transition**: not urgent, safe to interrupt, safe to let the old UI keep showing while it resolves.

```tsx
const [isPending, startTransition] = useTransition();

function handleClick() {
  startTransition(() => {
    setTab('profile'); // low-priority — React can interrupt this if something urgent comes in
  });
}
```

The behavior that matters most in practice: if a transition causes content that's **already on screen** to suspend, React does *not* fall back to the nearest `Suspense` fallback. It keeps the old content visible and just sets `isPending` to `true` until the new content is ready. The fallback UI only shows on a genuinely first mount (or an update outside a transition) — this is what makes tab-switching or search-filtering feel responsive instead of flashing back to a spinner on every change.

`startTransition` also exists as a standalone function (not a hook) for use outside components — event handlers, class components — anywhere `useTransition`'s `isPending` isn't needed.

### 1.4 `useDeferredValue` — deferring a value instead of a state update

`useTransition` wraps the *setter call* — useful when you own the state update. `useDeferredValue` wraps a *value* instead — useful when you don't control the setter (the value arrives as a prop, or from a state hook you don't want to touch), and you just want a lagging copy of it for one expensive part of the tree:

```tsx
const [text, setText] = useState('');
const deferredText = useDeferredValue(text); // "urgent" text updates immediately

return (
  <>
    <input value={text} onChange={(e) => setText(e.target.value)} /> {/* stays responsive */}
    <ExpensiveResultsList query={deferredText} /> {/* lags behind, re-renders when it catches up */}
  </>
);
```

While `text` (driving the input) updates on every keystroke immediately, `deferredText` keeps its previous value during urgent renders and only catches up in a low-priority render — same "don't block typing" outcome as `useTransition`, but expressed as a value instead of an action.

---

## 2. Basic Usage

### Example: route-level code splitting with `lazy` + `Suspense`

```tsx
import { lazy, Suspense } from 'react';

const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Settings />
    </Suspense>
  );
}
```

`Settings`'s code isn't fetched until it's about to render — the `Suspense` boundary covers the gap between "navigated here" and "code + first render ready."

### Example: tab switching without a fallback flash (`useTransition`)

```tsx
function Tabs() {
  const [tab, setTab] = useState<'about' | 'posts'>('about');
  const [isPending, startTransition] = useTransition();

  function selectTab(next: typeof tab) {
    startTransition(() => setTab(next));
  }

  return (
    <>
      <button onClick={() => selectTab('about')}>About</button>
      <button onClick={() => selectTab('posts')} style={{ opacity: isPending ? 0.6 : 1 }}>
        Posts
      </button>
      <Suspense fallback={<Spinner />}>
        {tab === 'about' ? <About /> : <Posts />}
      </Suspense>
    </>
  );
}
```

Switching to `Posts` the first time may suspend (its data isn't loaded yet) — because the switch is wrapped in `startTransition`, React keeps `About` on screen with `isPending: true` instead of blanking the page to `<Spinner />`.

### Example: live search without janky typing (`useDeferredValue`)

```tsx
function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suspense fallback={<Spinner />}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}

const SearchResults = memo(function SearchResults({ query }: { query: string }) {
  // expensive filtering/rendering, only re-runs when `deferredQuery` actually changes
});
```

Wrapping `SearchResults` in `memo` matters here — otherwise it re-renders on every keystroke regardless of whether `deferredQuery` changed yet, defeating the point of deferring it.

---

## 3. Advanced Usage

### 3.1 Nested Suspense boundaries — granular loading over one big spinner

**When**: a page has independent sections that load at different speeds (sidebar, main content, comments) and shouldn't all wait on the slowest one.

```tsx
<Suspense fallback={<PageSpinner />}>
  <Layout>
    <Suspense fallback={<SidebarSkeleton />}>
      <Sidebar />
    </Suspense>
    <Suspense fallback={<PostSkeleton />}>
      <Post />
    </Suspense>
    <Suspense fallback={<CommentsSkeleton />}>
      <Comments />
    </Suspense>
  </Layout>
</Suspense>
```

Each inner boundary reveals independently as its own data resolves — `Comments` being slow doesn't hold back `Sidebar`. The outer boundary is the catch-all for the very first paint before `Layout` itself is ready.

### 3.2 `useTransition` vs `useDeferredValue` vs debounce

| | Runs | Delay is | Cancels stale work | Typical use |
|---|---|---|---|---|
| **`useTransition`** | Immediately, at low priority | However long the low-priority render takes | Yes — React can interrupt/restart it | You call the setter: tab switches, navigation, form submission triggering a re-render |
| **`useDeferredValue`** | Immediately, at low priority | Same as above, expressed as a lagging value | Yes | You don't call the setter: value arrives as a prop, or from state you don't own |
| **Debounce** (classic) | After a fixed timeout with no new input | Fixed, arbitrary (e.g. 300ms) | No — a stale in-flight update still runs unless manually aborted | Rate-limiting network requests (search-as-you-type API calls) |

Debounce and these hooks solve different problems and can be combined: debounce the *network request* (avoid hitting the API on every keystroke), `useDeferredValue`/`useTransition` for the *render* (avoid janky typing while the result list re-renders) — the client-side rendering lag isn't fixed by debouncing the request that already returned.

### 3.3 Streaming SSR — Suspense across the network boundary

`Suspense` isn't only a client-side loading-state tool — it's also the mechanism a server uses to stream HTML in chunks: start sending the fast parts of the page immediately, then stream in the slower `Suspense` boundaries as their data resolves, without blocking the initial response. This is exactly the pattern documented in [`17_Server_Components_Actions/SERVER_COMPONENTS.md §3.1`](../17_Server_Components_Actions/SERVER_COMPONENTS.md#31-streaming--dont-block-the-whole-page-on-one-slow-fetch), where a Server Component starts a fetch, doesn't await it, and hands the promise to a Client Component that reads it with `use()` inside a `Suspense` boundary — the same boundary/fallback contract as the client-only examples above, just crossing server → client instead of sync → async on one machine.

### 3.4 Gotchas

- **The fallback only shows on a genuine first suspend**, not on every update inside a transition — this trips people up when they expect a spinner and don't see one (§1.3). If you *want* a fallback to reappear on a specific update, don't wrap that update in a transition.
- **Suspense doesn't catch errors.** A promise that rejects still needs an `ErrorBoundary` around (or inside) the `Suspense` boundary.
- **`useDeferredValue` doesn't delay a network request** — it only delays a *render*. If the goal is fewer API calls, that's a debounce/throttle at the data-fetching layer, not this hook (§3.2).
- **`SuspenseList`** (still experimental, not documented here in depth) coordinates the *reveal order* of multiple sibling `Suspense` boundaries (`forwards`/`together`/`backwards`) — worth knowing it exists before reaching for a manual solution, but not stable enough to rely on yet.

---

## Summary

| Concept | Theory | Practice |
|---|---|---|
| Interruptible rendering | 1.1 | Implicit in every example below |
| Loading boundaries | 1.2 | `Suspense` + `fallback` (2) |
| Non-urgent state updates | 1.3 | `useTransition` (2), `startTransition` |
| Non-urgent derived values | 1.4 | `useDeferredValue` (2) |
| Granular loading | — | Nested `Suspense` (3.1) |
| Choosing the right tool | — | Comparison table (3.2) |
| Server → client streaming | — | Cross-ref to `17_Server_Components_Actions` (3.3) |

---

**References**:

- [React — `Suspense`](https://react.dev/reference/react/Suspense)
- [React — `useTransition`](https://react.dev/reference/react/useTransition)
- [React — `startTransition`](https://react.dev/reference/react/startTransition)
- [React — `useDeferredValue`](https://react.dev/reference/react/useDeferredValue)
- [React — `lazy`](https://react.dev/reference/react/lazy)
