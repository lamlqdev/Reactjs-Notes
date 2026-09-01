# Server Components

---

## 1. Mental Model

### 1.1 Two module graphs, one component tree

Every other rendering model in this repo — CSR in the Vite projects, even traditional SSR — has one module graph: everything eventually runs in the browser. RSC splits the component tree across **two** module graphs, server and client, and a component's location in that split determines what it can do:

| | Runs on the server | Ships to / runs in the browser |
|---|---|---|
| **Server Component** | Yes | No |
| **Client Component** | Yes (for the initial HTML) | Yes |

**Server Components are the default** in a Server Components-compatible framework — no directive needed. `'use client'` at the top of a file is what draws the boundary: everything that file exports becomes part of the client module graph from that point down.

```tsx
// app/ui/like-button.tsx
'use client'

export default function LikeButton({ likes }: { likes: number }) {
  const [count, setCount] = useState(likes)
  return <button onClick={() => setCount(count + 1)}>{count} likes</button>
}
```

`useState`, `useEffect`, event handlers (`onClick`), and browser APIs only work in Client Components — a Server Component has no re-render, no hooks, no interactivity. This is why the default-to-server, opt-into-client mental model matters: a component only needs `'use client'` when it genuinely needs client-side state, effects, or event handlers.

### 1.2 What can cross the boundary

A Server Component can render a Client Component and pass it props — but those props must be **serializable** (they're sent over the network as part of the RSC payload, not executed on the client). This is the same constraint TanStack Query's `queryFn` result faces when serialized for hydration, but stricter: it applies to every prop, not just query data.

```tsx
// Server Component
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id) // direct data access — no client-side fetch, no API route

  return <LikeButton likes={post.likes} /> {/* `likes: number` is serializable */}
}
```

Passing a function as a prop from a Server Component to a Client Component throws — an event handler defined on the server has nothing to run on the client. The one exception is a Server Action (`'use server'`), which crosses as a callable reference rather than as code — see [`SERVER_ACTIONS.md`](./SERVER_ACTIONS.md).

The reverse direction — a Client Component rendering a Server Component as a prop (`children`) — does work, since the Server Component has already been rendered to its serialized output by the time it reaches the client boundary.

### 1.3 Why: less client JS, direct backend access

Two benefits fall out of the split, and they compound:

- **Zero client-side JS for server-only UI.** A Server Component's code — its imports, its logic — never ships to the browser. A page built mostly of static/data-driven sections with a few interactive islands (`LikeButton`) sends only those islands' code, not the whole page's.
- **Direct backend access, no API layer.** `getPost(id)` above calls a database or internal service directly inside the component — there's no `fetch('/api/posts/:id')` round trip, no client-side loading state to manage for that data. This replaces the client-side data-fetching concerns from [`07_Fetching_Data`](../07_Fetching_Data/) and [`08_Axios_Tanstack_Query`](../08_Axios_Tanstack_Query/) for anything that doesn't need to refetch/revalidate on the client.

---

## 2. Basic Usage

### Example: Server Component fetches, Client Component handles interactivity

```tsx
// app/posts/[id]/page.tsx — Server Component (async, no directive)
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <main>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <LikeButton likes={post.likes} />
    </main>
  )
}
```

The page component is `async` — Server Components can `await` directly in the component body, since there's no re-render to schedule around; the render itself waits for the data.

---

## 3. Advanced Usage

### 3.1 Streaming — don't block the whole page on one slow fetch

**When**: one section of a page is slow (an analytics chart, a report) but the rest of the page shouldn't wait for it.

A Server Component can start a fetch, *not* await it, and hand the unresolved promise to a Client Component wrapped in `<Suspense>`. The server streams the fast parts of the page immediately and fills in the slow part when it resolves:

```tsx
// Server Component
import { Suspense } from 'react'
import { StatsChart } from './stats-chart'

async function getStats() {
  const res = await fetch('https://api.example.com/stats')
  return res.json()
}

export default function Dashboard() {
  const statsPromise = getStats() // fetch started, not awaited

  return (
    <Suspense fallback={<p>Loading chart...</p>}>
      <StatsChart dataPromise={statsPromise} />
    </Suspense>
  )
}
```

```tsx
// Client Component — reads the promise with React's `use()`
'use client'
import { use } from 'react'

export function StatsChart({ dataPromise }: { dataPromise: Promise<Stats> }) {
  const stats = use(dataPromise) // suspends this component until the promise resolves
  return <Chart data={stats} />
}
```

`use()` is what makes this legal: a promise *is* a serializable-enough value to cross the server→client boundary (unlike a function), and `use()` unwraps it inside the Client Component, suspending only that subtree.

### 3.2 Gotchas

- **No Context across the boundary directly.** `createContext`/`useContext` are client-only — a Server Component can't `useContext`. The common fix is a Client Component wrapper that establishes the provider, with Server Components rendered as its `children`.
- **`params`/`searchParams` are promises**, not plain objects, in newer Next.js versions — `await params` before destructuring, as in the examples above.
- **A Server Component re-renders only by re-navigating or via `revalidatePath`/`revalidateTag`** (see [`SERVER_ACTIONS.md`](./SERVER_ACTIONS.md)) — there's no client-side re-render loop to trigger from inside it.

---

**References**:

- [React — Server Components](https://react.dev/reference/rsc/server-components)
- [React — `use`](https://react.dev/reference/react/use)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — Streaming and Suspense](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
