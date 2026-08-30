# TanStack Query

### Query Fundamentals

**Query**: `useQuery` binds an async read operation to a unique cache key, manages its lifecycle, and exposes the result to React components.

![useQuery options](./public/useQuery-input.png)

**`queryFn`** must **throw** (or return a rejected Promise) on failure, never `return` an error object — TanStack Query derives `isError`/`isSuccess` from whether the Promise rejects, not from what it resolves to.

**`staleTime` vs `cacheTime` (`gcTime` in v5)**

| Aspect                   | `staleTime`                                               | `cacheTime` / `gcTime`                                                             |
| ------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Question it answers**  | How long is the data considered "fresh"?                  | How long does unused data stay in memory?                                          |
| **Controls**             | Whether a background refetch is triggered                 | Whether the cached data is garbage-collected                                       |
| **Starts counting from** | The last successful fetch                                 | The moment the query has zero active observers (all components unmount)            |
| **Default**              | `0` (stale immediately)                                   | `300000` ms (5 minutes)                                                            |
| **When it expires**      | Next remount/refocus triggers a silent background refetch | Cached data is deleted; next mount has nothing to show and must fetch from scratch |

Remounting the same query key behaves differently depending on where you are relative to both timers:

| Remount timing | Cached data shown instantly? | Background refetch triggered? |
| --- | --- | --- |
| Within `staleTime` (still fresh) | Yes, from cache | No |
| After `staleTime` but within `cacheTime` | Yes, from cache | Yes, refetches silently in the background |
| After `cacheTime` (cache garbage-collected) | No — shows loading state | Yes, fetches from scratch |

![useQuery result](./public/useQuery-output.png)

**`isPending` vs `isFetching` (v5)** — `isPending` means "no data yet" (`data === undefined`); `isFetching` means "a request is running right now." Caveats:

- A disabled/dependent query (`enabled: false`) is `isPending: true` even though nothing is fetching.
- A background refetch of stale data is `isPending: false` but `isFetching: true`, since the old data is still there.
- Guard `data` access with `isPending` (`if (isPending) return <Skeleton />`); use `isFetching` only for a non-blocking "updating…" indicator.

**`initialData` vs `placeholderData`** — both let a query render with data before its own fetch resolves, but they behave very differently:

| | `initialData` | `placeholderData` |
| --- | --- | --- |
| **Written into cache?** | Yes — becomes the real cached value for that key | No — shown for render only, discarded once real data arrives |
| **Triggers a fetch?** | Only if past `staleTime` (counted from `initialDataUpdatedAt`) | Always fetches in the background — there's no real data yet |
| **Main risk** | Stale/incomplete data can be treated as "fresh" and never refetched | None — the real fetch always runs alongside it |
| **Typical use** | Seeding a detail query from an item already present in a list query's cache | `keepPreviousData` while paging (see Recipes → Paginated Queries) |

### Dependent & Parallel Queries

**Dependent query** — one query needs the result of another before it can run. Gate it with `enabled`:

```typescript
export function useUserOrders(userId?: number) {
  const { data: user } = useUser(userId!);

  return useQuery({
    queryKey: orderKeys.byUser(user?.id),
    queryFn: () => ordersApi.getOrdersByUser(user!.id),
    enabled: !!user?.id, // only runs once `user` is loaded
  });
}
```

**Parallel — fixed number**: just call multiple `useQuery` hooks side by side; they fire concurrently, not sequentially.

```typescript
function Dashboard() {
  const users = useQuery({ queryKey: userKeys.lists(), queryFn: userApi.getUsers });
  const stats = useQuery({ queryKey: statsKeys.summary(), queryFn: statsApi.getSummary });
  // both requests fire immediately and independently
}
```

**Parallel — dynamic list**: when the number of queries depends on runtime data, use `useQueries` instead of calling `useQuery` in a loop, which breaks the rules of hooks:

```typescript
import { useQueries } from "@tanstack/react-query";

function useUsersByIds(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: userKeys.detail(id),
      queryFn: () => userApi.getUserById(id),
    })),
  });
}
```

### Disabling/Pausing Queries

`enabled: false` turns off *all* automatic behavior for a query — no fetch on mount, no window-focus refetch, no polling — until it becomes `true` or `refetch()` is called manually. Two common reasons to reach for it:

- **Dependent queries** (above) — `enabled` flips on once the input it needs is ready.
- **Lazy/manual queries** — data should only be fetched on an explicit user action (e.g. a "Search" button), not on mount:

```typescript
const { data, refetch, isFetching } = useQuery({
  queryKey: searchKeys.query(term),
  queryFn: () => searchApi.search(term),
  enabled: false, // never auto-fetches
});

<button onClick={() => refetch()} disabled={isFetching}>Search</button>
```

A disabled query is `isPending: true` for as long as it's never been fetched — that's expected, not an error state.

---

## Mutations & Cache Synchronization

### Mutations

`useMutation` handles write operations — create, update, delete. Unlike `useQuery`, a mutation isn't identified by a `queryKey` and isn't cached by TanStack Query itself: it's a one-off action, not something to be re-fetched or deduplicated.

![useMutation input](./public/useMutation-input.png)

![useMutation result](./public/useMutation-output.png)

**`mutate()` vs `mutateAsync()`**:

| | `mutate()` | `mutateAsync()` |
| --- | --- | --- |
| **Return value** | `void` — fire and forget | `Promise` |
| **Error handling** | Via `onError` callback | Via `try/catch` at the call site |
| **Use case** | Simple "click and forget" actions | Caller needs to chain logic after success/failure (navigate, trigger a second mutation) |

> A mutation never touches any query's cache on its own. Calling `updateUser.mutate(...)` does not make `useUser(id)` anywhere else in the app see the new data — that link has to be made explicit, which is exactly what invalidation is for.

### Query Invalidation

`queryClient.invalidateQueries()` marks matching queries as stale and, for any that are currently **active** (mounted somewhere in the tree), triggers an immediate background refetch. **Inactive** queries are only marked stale — they refetch the next time a component mounts and reads that key.

**Key matching is partial by default**: `invalidateQueries({ queryKey: ['users'] })` matches *every* query whose key starts with `'users'`, including `['users', 'list']` and `['users', 'detail', 5]`. Pass `exact: true` to match only that exact key.
### Invalidation from Mutations

The standard pattern: call `invalidateQueries` inside the mutation's `onSuccess`. The mutation doesn't try to guess the new server state — it just tells TanStack Query "something under this key changed, go get the truth again":

```typescript
useMutation({
  mutationFn: userApi.updateUser,
  onSuccess: (_, { id }) => {
    queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  },
});
```

### Updates from Mutation Responses

If the mutation's response already contains the full updated resource, there's no need to ask the server again — write that response straight into the cache with `queryClient.setQueryData()` instead of invalidating:

```typescript
useMutation({
  mutationFn: userApi.updateUser,
  onSuccess: (updatedUser) => {
    queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
  },
});
```

This is **faster than invalidation** (zero extra network round-trip — the response *is* the fresh data) and **simpler than an optimistic update** (no `onMutate`/rollback needed, since it only runs in `onSuccess`, after the server has already confirmed the real result).

**`setQueryData` vs `setQueriesData`** — same exact-vs-partial distinction as `invalidateQueries`/`exact: true` above, but for writes instead of refetch:

| | `setQueryData(queryKey, updater)` | `setQueriesData(filters, updater)` |
| --- | --- | --- |
| **Targets** | One exact query key | Every query matching a filter (partial key, predicate...) |
| **Use case** | You know precisely which cache entry to patch (e.g. `userKeys.detail(id)`) | The same change needs to ripple into multiple cache entries at once |

A single `updateUser` response usually needs both — patch the detail cache exactly, and patch every list that happens to embed that same user:

```typescript
onSuccess: (updatedUser) => {
  queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

  queryClient.setQueriesData(
    { queryKey: userKeys.lists() }, // partial match — every "users list" query
    (old: User[] | undefined) =>
      old?.map((u) => (u.id === updatedUser.id ? updatedUser : u))
  );
};
```

**Caveat**: this only works when the response is genuinely authoritative for that cache shape — if the server response omits fields the list view needs, or the update has side effects on other resources (e.g. changing a user's role also affects a permissions query).

### Optimistic Updates

Both patterns above wait for the mutation to actually resolve before touching the UI. **Optimistic updates** don't wait — they write the *assumed* new state into the cache the moment the mutation starts, before the server has responded at all, then roll back if it turns out to have failed:

```typescript
useMutation({
  mutationFn: postsApi.updatePost,

  onMutate: async ({ id, data }) => {
    // Cancel in-flight fetches for this key so they can't overwrite the optimistic write
    await queryClient.cancelQueries({ queryKey: postKeys.detail(id) });
    const previousPost = queryClient.getQueryData<Post>(postKeys.detail(id));

    queryClient.setQueryData<Post>(postKeys.detail(id), (old) =>
      old ? { ...old, ...data } : old
    );

    return { previousPost }; // passed to onError as `context`
  },

  onError: (_, { id }, context) => {
    if (context?.previousPost) {
      queryClient.setQueryData(postKeys.detail(id), context.previousPost);
    }
  },

  onSettled: (_, __, { id }) => {
    // Re-sync with the server either way — the optimistic guess may not exactly match reality
    queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
  },
});
```

Each callback exists for a reason: `onMutate` cancels in-flight fetches first (otherwise a slow background refetch could land *after* the optimistic write and clobber it with old data), then snapshots the current value so `onError` has something to restore. `onSettled` always fires — success or failure — because even a successful mutation's optimistic guess might not be byte-for-byte what the server actually computed (e.g. server-generated timestamps).

**When to reach for this over `setQueryData` in `onSuccess`**: only when even the network round-trip's latency is worth eliminating — likes, checkboxes, drag-reorder, anything the user expects to feel instant. It costs real complexity (cancel, snapshot, rollback) for that; when a few hundred ms of delay is fine, *Updates from Mutation Responses* is the simpler, safer default.

---

## Setup

Setup follows the [official Quick Start](https://tanstack.com/query/latest/docs/framework/react/quick-start): create one `QueryClient`, wrap the app in `QueryClientProvider`, then call `useQuery`/`useMutation` anywhere underneath it. The `queryFn`/`mutationFn` passed to each is just a call into the Axios API layer described in **[Axios](./AXIOS.md)**.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute, overrides the default of 0
      retry: 2,             // default is 3
    },
    mutations: {
      retry: 0, // mutations default to 0 — retrying a POST/PATCH risks duplicating a write
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
```

**Retry behavior**: a failed **query** retries up to 3 times by default, with exponential backoff, before `isError` becomes `true`. `retry` also accepts a function `(failureCount, error) => boolean`, which is where the Axios interceptor's `normalizeError` (see [Axios](./AXIOS.md)) pays off — since every rejection is a consistently-shaped `AppError`, that function can check `error.status` and skip retrying things like 401/404 that will never succeed no matter how many times they're retried.

---

## Recipes

### Polling

`refetchInterval` accepts a function that reads the current data to decide whether to keep polling — useful for watching an async job until it finishes, without a manual `setInterval`/`clearInterval`:

```typescript
export function useOrderStatus(orderId: number) {
  return useQuery({
    queryKey: orderKeys.status(orderId),
    queryFn: () => orderApi.getStatus(orderId),
    refetchInterval: (query) =>
      query.state.data?.status === "done" ? false : 3000,
  });
}
```

### Paginated Queries

Page-by-page pagination ("page 1 / 2 / 3") — different from Infinite Queries below, which *accumulate* pages. Include the page number in the key, and use `placeholderData: keepPreviousData` so the old page stays on screen (instead of flashing a loading state) while the next page fetches:

```typescript
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function usePostsPage(page: number) {
  return useQuery({
    queryKey: postKeys.page(page),
    queryFn: () => postsApi.getPostsPage(page),
    placeholderData: keepPreviousData,
  });
}
```

```typescript
function PostsPagination() {
  const [page, setPage] = useState(1);
  const { data, isPending, isPlaceholderData } = usePostsPage(page);

  if (isPending) return <div>Loading...</div>;

  return (
    <>
      <ul>{data.items.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
      <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
      <button
        disabled={isPlaceholderData || !data.hasMore}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </>
  );
}
```

`isPlaceholderData` is `true` while the *previous* page's data is being shown as a placeholder — guard the "Next" button with it so the user can't page ahead of what's actually loaded.

### Infinite Queries

`useInfiniteQuery` handles paginated data as an ever-growing list instead of replacing one page with the next. `data` becomes `{ pages: T[]; pageParams: unknown[] }`, and `initialPageParam` + `getNextPageParam` are required in v5:

```typescript
export function usePostsInfinite() {
  return useInfiniteQuery({
    queryKey: postKeys.infinite(),
    queryFn: ({ pageParam }) => postsApi.getPostsPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
```

**Case 1 — "Load more" button**:

```typescript
function PostsFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = usePostsInfinite();

  if (isPending) return <div>Loading...</div>;

  return (
    <>
      <ul>
        {data.pages.flatMap((page) =>
          page.items.map((post) => <li key={post.id}>{post.title}</li>)
        )}
      </ul>
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
        {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load more" : "No more posts"}
      </button>
    </>
  );
}
```

**Case 2 — auto-load with `IntersectionObserver`**:

```typescript
function PostsInfiniteScroll() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostsInfinite();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      {data.pages.flatMap((page) =>
        page.items.map((post) => <article key={post.id}>{post.title}</article>)
      )}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && <div>Loading more...</div>}
    </>
  );
}
```

**Common pitfalls**:

- Forgetting `initialPageParam` — required in v5, throws at runtime.
- Returning `null` instead of `undefined` from `getNextPageParam` — `null` is treated as a valid page param, not "no more pages."
- Flattening with `.map(page => page.items)` instead of `.flatMap(...)` — leaves nested arrays and breaks rendering.

### Debounced Search Query

Typing into a search box shouldn't fire a request per keystroke. Debounce the value that actually goes into `queryKey`, not the query call itself — TanStack Query already skips fetching when the key doesn't change, so debouncing the input naturally throttles requests:

```typescript
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

function SearchResults() {
  const [term, setTerm] = useState("");
  const debouncedTerm = useDebouncedValue(term);

  const { data, isFetching } = useQuery({
    queryKey: searchKeys.query(debouncedTerm),
    queryFn: () => searchApi.search(debouncedTerm),
    enabled: debouncedTerm.length > 0,
    placeholderData: keepPreviousData, // keep old results visible while the new debounced term fetches
  });

  return (
    <>
      <input value={term} onChange={(e) => setTerm(e.target.value)} />
      {isFetching && <span>Searching...</span>}
      <ul>{data?.map((r) => <li key={r.id}>{r.title}</li>)}</ul>
    </>
  );
}
```

`term` (raw input, updates every keystroke) drives the `<input>`'s value so typing feels instant; `debouncedTerm` (delayed) drives `queryKey` so the request only fires once typing pauses. `enabled: debouncedTerm.length > 0` skips fetching on an empty box, and `placeholderData: keepPreviousData` avoids a loading flash between one debounced fetch and the next — same mechanism as Paginated Queries above, just keyed by search term instead of page number.

### Prefetching

Fetch and cache data *before* the user navigates to it — e.g. on hover, ahead of a route change:

```typescript
export function usePrefetchPost() {
  const queryClient = useQueryClient();

  return (id: number) =>
    queryClient.prefetchQuery({
      queryKey: postKeys.detail(id),
      queryFn: () => postsApi.getPostById(id),
      staleTime: 1000 * 60 * 5,
    });
}
```

```typescript
<li onMouseEnter={() => prefetchPost(post.id)}>
  <Link to={`/posts/${post.id}`}>{post.title}</Link>
</li>
```

Because `prefetchQuery` populates the cache with the same `staleTime` a normal `useQuery` call would use, the component that actually mounts on navigation reads instantly from cache instead of showing a loading state.

---

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Query Quick Start](https://tanstack.com/query/latest/docs/framework/react/quick-start)