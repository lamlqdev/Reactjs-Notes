# Zustand — Lightweight State Management

Notes on Zustand as a lighter alternative to [`06_ContextAPI_useReducer`](../06_ContextAPI_useReducer/README.md) and [`11_Redux_Redux_Toolkit`](../11_Redux_Redux_Toolkit/) — same job (global/shared state), far less ceremony.

---

## 1. Mental Model

### 1.1 The store lives outside React — no Provider

Context ([`06_ContextAPI_useReducer`](../06_ContextAPI_useReducer/README.md)) requires wrapping the tree in a `<Provider>` before any component can read the state — the Provider *is* where the state lives. Zustand's `create()` returns a store that exists independently of the component tree; any component imports the hook and reads from it directly, no wrapping required:

```ts
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
```

```tsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears); // no <Provider> ancestor needed
  return <p>{bears} bears</p>;
}
```

State and the actions that update it are defined together, in one `create()` call — there's no separate reducer function, no action-type constants, no dispatch call at the read site the way [`11_Redux_Redux_Toolkit`](../11_Redux_Redux_Toolkit/) requires.

### 1.2 Selectors — subscribe to a slice, not the whole store

With plain Context, any component calling `useContext(MyContext)` re-renders whenever *any* part of that context's value changes — the common workaround is splitting into multiple contexts by concern. Zustand's hook takes a **selector**: the component only re-renders when the specific slice the selector returns actually changes.

```tsx
const bears = useBearStore((state) => state.bears); // only re-renders when `bears` changes
const increase = useBearStore((state) => state.increase); // stable reference, never re-renders on data changes
```

This is the direct counterpart to `watch()` in [`09_React_Hook_Form`](../09_React_Hook_Form/README.md#14-watch--opt-in-re-rendering) — opt-in re-rendering on a specific slice, instead of subscribing to everything by default.

### 1.3 No boilerplate — `set` replaces reducer + dispatch + action creators

Redux Toolkit still keeps the reducer/action/dispatch shape, just with less manual code around it. Zustand drops the shape itself: `set` is called directly from an action function defined inline in the store — there's no action object crossing a dispatch function, no switch statement matching action types.

---

## 2. Basic Usage

### Example: a store, read with a selector, updated from a component

```ts
// store/useCartStore.ts
import { create } from 'zustand'

interface CartState {
  items: string[];
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (item) =>
    set((state) => ({ items: state.items.filter((i) => i !== item) })),
}))
```

```tsx
function CartBadge() {
  const count = useCartStore((state) => state.items.length);
  return <span>{count} items</span>;
}

function AddToCartButton({ product }: { product: string }) {
  const addItem = useCartStore((state) => state.addItem);
  return <button onClick={() => addItem(product)}>Add</button>;
}
```

`CartBadge` and `AddToCartButton` each subscribe to a different slice — adding an item re-renders `CartBadge` (its slice, `items.length`, changed) but not any component that only reads `removeItem` (an unchanged function reference).

### Example: selecting multiple fields without over-rendering (`useShallow`)

Destructuring several fields from an object-returning selector creates a new object every call, which would normally re-render the component on *every* store update, even unrelated ones. `useShallow` fixes that by shallow-comparing the selector's output:

```tsx
import { useShallow } from 'zustand/react/shallow'

function CartSummary() {
  const { items, addItem } = useCartStore(
    useShallow((state) => ({ items: state.items, addItem: state.addItem })),
  );
  // re-renders only when `items` or `addItem` actually changed, not on unrelated store updates
}
```

---

## 3. Advanced Usage

### 3.1 Slices pattern — modular stores without losing one shared store

**When**: the store is growing multiple unrelated concerns (cart, user session, UI state) and one flat `create()` call is getting unwieldy — the same problem `combineReducers` solves in Redux.

```ts
// bearSlice.ts
import { StateCreator } from 'zustand'

export interface BearSlice {
  bears: number;
  addBear: () => void;
}

export const createBearSlice: StateCreator<BearSlice & FishSlice, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})
```

```ts
// store.ts
import { create } from 'zustand'
import { createBearSlice, BearSlice } from './bearSlice'
import { createFishSlice, FishSlice } from './fishSlice'

export const useBoundStore = create<BearSlice & FishSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}))
```

Each slice is still just a plain function — components keep using `useBoundStore(selector)` exactly as before; the split is purely a file-organization concern, unlike Redux's `combineReducers` which changes the shape of the state tree itself (nested under each reducer's key).

### 3.2 Middleware — `persist` and `devtools`

**When**: state needs to survive a page reload (`persist`, → `localStorage`/`sessionStorage`) or be inspectable in Redux DevTools (`devtools`) without adopting Redux itself.

```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      { name: 'bearStore' }, // localStorage key
    ),
  ),
)
```

Middleware order matters and reads inside-out: `persist` wraps the raw store creator first (so every `set` call is also persisted), then `devtools` wraps that (so every `set` call — including ones triggered by persist rehydration — is visible in DevTools).

### 3.3 When to reach for Zustand vs. Context vs. Redux Toolkit

| | Context + `useReducer` | Zustand | Redux Toolkit |
|---|---|---|---|
| Setup | `createContext` + `Provider` + custom hook ([`06`](../06_ContextAPI_useReducer/README.md)) | `create()`, no Provider | Store + slices + `Provider` ([`11`](../11_Redux_Redux_Toolkit/)) |
| Re-render scope | Whole subtree under the changed context, unless split | Per-selector, opt-in | Per-selector (`useSelector`), opt-in |
| Boilerplate | Low, but re-render splitting adds files as it grows | Lowest | Higher — slices, `configureStore`, typed hooks |
| DevTools / time-travel | No built-in support | Via `devtools` middleware | Built-in |
| Best fit | A few values, changes together, small-to-mid app | Most app-wide state in small-to-mid apps; fast to add | Large app, many contributors, need strict conventions + DevTools |

---

## Summary

| Concept | Theory | Practice |
|---|---|---|
| No Provider needed | 1.1 | `create()` (2) |
| Opt-in re-rendering | 1.2 | Selector functions (2) |
| State + actions together | 1.3 | `set` inside `create()` (2) |
| Avoiding over-render on object selectors | — | `useShallow` (2) |
| Modular stores | — | Slices pattern (3.1) |
| Persistence / DevTools | — | `persist` + `devtools` middleware (3.2) |

---

**References**:

- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Zustand — Slices Pattern](https://zustand.docs.pmnd.rs/guides/typescript#slices-pattern)
- [Zustand — `useShallow`](https://zustand.docs.pmnd.rs/hooks/use-shallow)
- [Zustand — `persist` middleware](https://zustand.docs.pmnd.rs/middlewares/persist)
- [Zustand — `devtools` middleware](https://zustand.docs.pmnd.rs/middlewares/devtools)
