# Server Actions

See [`REACT_19_FORM_ACTIONS.md`](../09_React_Hook_Form/REACT_19_FORM_ACTIONS.md) first — Server Actions are consumed with the exact same `useActionState`/`useFormStatus`/`useOptimistic` hooks documented there. What's new here is *where* the action runs.

---

## 1. Mental Model

### 1.1 `'use server'` turns a function into a callable network endpoint

A plain async function marked `'use server'` becomes a **Server Reference**: the framework registers it as an RPC-style endpoint, and any reference to that function from client code is replaced with a network call to it. The function's actual code — its logic, its imports, any secrets it touches — never ships to the browser.

```ts
// app/posts/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  // insert into DB directly — this code runs only on the server
}
```

This is the piece that made "a function as a prop" legal in [`SERVER_COMPONENTS.md §1.2`](./SERVER_COMPONENTS.md#12-what-can-cross-the-boundary) as the one exception: `createPost` can be imported into a Client Component and passed to `<form action={createPost}>` because it crosses as a *reference to an endpoint*, not as executable client code.

### 1.2 Server Actions are public HTTP endpoints — treat them like one

Because a Server Action compiles down to a POST endpoint, it's reachable by anyone who can construct that request, not just by the form that happens to call it in your UI. **Every Server Action needs its own auth/authorization check inside the function body** — there's no implicit protection from the fact that it's "just a form action" in your source.

```ts
'use server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  // mutate...
  revalidatePath('/posts')
}
```

The recommended pattern is: dedicate mutations to Server Actions (not inline logic triggered from `onClick` in a Client Component) so side effects have exactly one, auditable entry point per mutation — the same reasoning that pushes RHF's `.refine` async checks or TanStack Query's `mutationFn` toward a single owned function rather than mutation logic scattered across handlers.

### 1.3 Revalidation closes the loop back to Server Components

A Server Action mutates data; `revalidatePath`/`revalidateTag` (from `next/cache`) tells the framework which already-rendered Server Component output is now stale, so the next render picks up fresh data:

```ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  // mutate...
  revalidatePath('/posts')  // invalidate by route
  revalidateTag('posts')    // or invalidate by tag, if fetches were tagged
}
```

Without this call, the Server Component that rendered the list of posts keeps serving its previously-cached output — mutating data doesn't, by itself, invalidate anything.

---

## 2. Basic Usage

### Example: form → Server Action → revalidate → redirect

```tsx
// app/posts/new/page.tsx — Server Component
import { createPost } from '../actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="body" />
      <button type="submit">Create</button>
    </form>
  )
}
```

```ts
// app/posts/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const id = await db.posts.create({ title })

  revalidatePath('/posts')   // refresh the list page's cached render
  redirect(`/posts/${id}`)   // then navigate — call this outside try/catch, it throws internally
}
```

Wired to `useActionState` from the client side, this is identical to the pattern in [`REACT_19_FORM_ACTIONS.md §2`](../09_React_Hook_Form/REACT_19_FORM_ACTIONS.md#2-basic-usage) — `createPost` just happens to be the `action` and its body happens to run on the server instead of in the browser.

---

## 3. Server Actions vs. Server Components — division of labor

| | Server Components | Server Actions |
|---|---|---|
| Direction | Server → client (reads) | Client → server (writes) |
| Directive | none (default) or `'use client'` to opt out | `'use server'` to opt in |
| Triggered by | Render / navigation | Form submit, `useActionState` dispatch, or a direct call from a Client Component |
| Cache interaction | Reads from the Next.js Data Cache | Invalidates it via `revalidatePath`/`revalidateTag` |
| Client-side hooks | None — no hooks in a Server Component | `useActionState`, `useFormStatus`, `useOptimistic` ([`09_React_Hook_Form`](../09_React_Hook_Form/REACT_19_FORM_ACTIONS.md)) |

---

**References**:

- [React — Server Functions](https://react.dev/reference/rsc/server-functions)
- [Next.js — Updating Data (Server Actions)](https://nextjs.org/docs/app/getting-started/updating-data)
- [Next.js — `revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js — `revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Next.js — Data Security (Server Actions)](https://nextjs.org/docs/app/guides/data-security)
