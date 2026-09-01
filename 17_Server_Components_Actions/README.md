# React Server Components & Server Actions

**React Server Components (RSC)** split a component tree across two module graphs — server and client — so parts of the UI can run exclusively on the server and never ship as JavaScript to the browser. **Server Actions** are the mutation counterpart: server-only functions that a client (a form, a button) can call directly, without hand-rolling an API route.

- **[Server Components](./SERVER_COMPONENTS.md)** — the server/client boundary, `'use client'`, what can and can't cross it, streaming with Suspense
- **[Server Actions](./SERVER_ACTIONS.md)** — `'use server'`, mutating data, `revalidatePath`/`revalidateTag`, security, and how they plug into the [React 19 Form Actions hooks](../09_React_Hook_Form/REACT_19_FORM_ACTIONS.md)

---

## Why this module has no demo project

Every other module in this repo runs on plain Vite + client-side React, using the standard `@vitejs/plugin-react` setup. Vite does have an official RSC plugin now — [`@vitejs/plugin-rsc`](https://vite.dev/plugins) (scaffoldable via `npm create vite@latest -- --template rsc`), built on Vite's multi-environment Environment API — but it's low-level: it gives you the server/client module split and streaming, not a router, a Data Cache, or `revalidatePath`/`revalidateTag`. Next.js's App Router builds those on top of the same primitive, which is why it's the reference implementation this module's examples are drawn from (Waku and Parcel RSC are others in the same "framework built on RSC primitives" category). Standing up a demo with the bare Vite plugin would mean writing that framework layer from scratch — out of scope here — so this module documents the model itself, the same way [`08_Axios_Tanstack_Query`](../08_Axios_Tanstack_Query/README.md) documents Axios/TanStack Query without a demo project.

---

## How the two connect

Server Components solve **reads** (fetch data on the server, ship only HTML + the client-interactive pieces). Server Actions solve **writes** (mutate data without a client-side API call). A typical page:

```tsx
// app/posts/page.tsx — Server Component (default, no directive needed)
import { getPosts } from '@/lib/data'
import { createPost } from './actions'
import PostForm from './post-form' // Client Component

export default async function PostsPage() {
  const posts = await getPosts() // runs on the server, direct DB/API access

  return (
    <>
      <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
      <PostForm action={createPost} />
    </>
  )
}
```

```ts
// app/posts/actions.ts — Server Action
'use server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  // mutate...
  revalidatePath('/posts') // re-render the Server Component above with fresh data
}
```

The Server Component fetches and renders; the Server Action mutates and tells Next.js which cached Server Component output to invalidate. On the client side, `createPost` is consumed exactly like any action from [`REACT_19_FORM_ACTIONS.md`](../09_React_Hook_Form/REACT_19_FORM_ACTIONS.md) — `useActionState`, `useFormStatus`, `useOptimistic` all work the same whether the action runs locally or, via `'use server'`, on the server.

---

**References**:

- [React — Server Components](https://react.dev/reference/rsc/server-components)
- [React — Server Functions](https://react.dev/reference/rsc/server-functions)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — Server Actions and Mutations](https://nextjs.org/docs/app/getting-started/updating-data)
