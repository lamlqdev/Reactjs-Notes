# React 19 Form Actions

The native alternative to React Hook Form: instead of a resolver-driven `onSubmit`, React 19 lets a `<form>` take an `action` function directly, and manages pending/result state through a small set of hooks — `useActionState`, `useFormStatus`, `useOptimistic`. This is the model React itself (and frameworks like Next.js, via Server Actions) is standardizing on.

See [README.md](./README.md) for the RHF + Zod mental model this file is contrasted against.

---

## 1. Mental Model

### 1.1 `action` replaces `onSubmit` + manual state

With RHF, `handleSubmit(onValid)` wraps your submit handler, and pending/error state lives in `formState` ([README §1.3](./README.md#13-the-submit-loop)). React 19 moves that plumbing into the platform: a `<form action={fn}>` has React collect a native `FormData` object from the form on submit and call `fn` with it. `useActionState` wraps that action and gives back `[state, dispatch, isPending]` — no `useState` for the result, no manual `setSubmitting(true/false)`.

```tsx
import { useActionState } from "react";

type FormState = { error: string | null };

async function submitAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("name") as string;
  if (name.length < 2) return { error: "Name must be at least 2 characters" };
  await api.save({ name });
  return { error: null };
}

function ActionForm() {
  const [state, formAction, isPending] = useActionState(submitAction, { error: null });

  return (
    <form action={formAction}>
      <input name="name" />
      {state.error && <span>{state.error}</span>}
      <button type="submit" disabled={isPending}>Submit</button>
    </form>
  );
}
```

The action reads fields off `FormData` (`formData.get("name")`) rather than receiving a typed object from a resolver — validation is whatever code you write inside the action, not a schema run automatically for you. Zod can still be used (`formSchema.safeParse(Object.fromEntries(formData))`), but it's wired in by hand, not through `zodResolver`.

### 1.2 `useFormStatus` — pending state without prop drilling

RHF's `formState.isSubmitting` is read where `useForm` lives, at the top of the form. `useFormStatus()` does the equivalent for actions, but from *inside* a child component — it reads the nearest parent `<form>`'s pending status, so a submit button doesn't need `isPending` passed down as a prop:

```tsx
function SubmitButton() {
  const { pending } = useFormStatus(); // reads the ancestor <form action>
  return <button disabled={pending}>Submit</button>;
}

function ActionForm() {
  const [state, formAction] = useActionState(submitAction, { error: null });
  return (
    <form action={formAction}>
      <input name="name" />
      <SubmitButton />
    </form>
  );
}
```

### 1.3 `useOptimistic` — showing a result before the action resolves

There's no RHF equivalent to this — it's specific to the action model. `useOptimistic` renders a provisional value immediately on submit, then reconciles with the real value once the action settles (or reverts, if it fails):

```tsx
const [optimisticName, setOptimisticName] = useOptimistic(name);

async function submitAction(formData: FormData) {
  const next = formData.get("name") as string;
  setOptimisticName(next); // shown instantly, before the await below finishes
  await api.save({ name: next });
}
```

---

## 2. Basic Usage

### Example: full loop — action, pending state, error display

```tsx
import { useActionState } from "react";

type FormState = { error: string | null; success: boolean };

async function subscribeAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  if (!email.includes("@")) return { error: "Invalid email address", success: false };

  await api.subscribe(email);
  return { error: null, success: true };
}

function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeAction, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p>Subscribed!</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
```

Because the form still has a real `<form action>`, it degrades to a normal HTML submit if JavaScript hasn't loaded yet — this is what "progressive enhancement" means for form actions, and it's not something client-only `onSubmit` handlers give you.

---

## 3. RHF vs. React 19 Form Actions

| | React Hook Form | React 19 Form Actions |
|---|---|---|
| Re-render model | Uncontrolled (`register`), opt-in via `watch` ([README §1.1, §1.4](./README.md#11-rhf-is-uncontrolled-first--thats-the-whole-point)) | `<form action>` re-renders on submit via `useActionState`, not per keystroke |
| Validation | Schema-first via Zod + `zodResolver` ([README §1.2](./README.md#12-zod-is-the-single-source-of-truth--for-validation-and-types)) | Hand-written inside the action (Zod usable, but not wired in automatically) |
| Pending state | `formState.isSubmitting` ([README §1.3](./README.md#13-the-submit-loop)) | `useActionState`'s `isPending`, or `useFormStatus()` in a child (§1.2 above) |
| Optimistic UI | Not built in | `useOptimistic` (§1.3 above) |
| Dynamic lists | `useFieldArray` ([README §3.2](./README.md#32-usefieldarray--dynamic-lists)) | No dedicated API — manage array fields via `FormData` entries by hand |
| Progressive enhancement (form works before JS loads) | No — depends on React event handlers | Yes — `<form action={fn}>` degrades to a real HTML submit |
| Best fit | Complex client-side forms: nested fields, array fields, cross-field rules ([README §3.3](./README.md#33-cross-field-validation-with-refine)) | Simple forms, or ones backed by a server action (Next.js Server Actions) |

They're not mutually exclusive within one app — RHF for a complex settings form, form actions for a simple newsletter signup or a Server Action-backed mutation.

---

**References**:

- [React 19 — `useActionState`](https://react.dev/reference/react/useActionState)
- [React 19 — `useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React 19 — `useOptimistic`](https://react.dev/reference/react/useOptimistic)
- [React 19 — Form Actions overview](https://react.dev/reference/react-dom/components/form)
