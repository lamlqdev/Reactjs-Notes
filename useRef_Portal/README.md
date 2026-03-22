# useRef and Portal

## Core Terminology

**Refs (references)** are a way to access DOM elements or store mutable values that persist across renders without causing re-renders. Unlike state, updating a ref does not trigger a component re-render.

![Why refs are useful](./public/refs-useful.png)

**useRef Syntax**:

![useRef syntax](./public/useRef.png)

**useRef vs useState**:

![useRef vs useState](./public/ref-vs-state.png)

---

## Basic: Basic useRef Usage

### Example 1: Accessing DOM Elements

**When to use**: When you need to directly interact with a DOM element (focus, scroll, measure, etc.)

```typescript
import { useRef } from "react";

function Player() {
  const name = useRef<HTMLInputElement>(null);

  function handleClick() {
    if (name.current) {
      console.log(name.current.value);
      name.current.value = "";
    }
  }

  return (
    <div>
      <input type="text" ref={name} />
      <button onClick={handleClick}>Submit</button>
    </div>
  );
}
```

**How to use**:

1. **Create ref**: `const name = useRef<HTMLInputElement>(null)` - Initialize ref with DOM element type
2. **Attach to element**: `ref={name}` - Connect ref to input element in JSX
3. **Access DOM**: `name.current` - Get DOM element (may be null)
4. **Check safely**: `if (name.current)` - Always check before accessing properties
5. **Manipulate DOM**: `name.current.value` - Read/write input value

**Note**: Updating `ref.current` does NOT trigger component re-render.

**Common DOM operations**:

- `ref.current?.focus()` - Focus the element (with optional chaining)
- `ref.current?.scrollIntoView()` - Scroll element into view
- `ref.current?.value` - Get/set input value
- `ref.current?.offsetHeight` - Measure element height

**Tip**: For DOM operations after mount, use `useEffect(() => { ref.current?.focus(); }, [])`.

### Example 2: Storing Mutable Values (Timer IDs)

**When to use**: When you need to store values that persist across renders but don't need to trigger re-renders.

```typescript
import { useRef } from "react";

function Timer() {
  const timer = useRef<number | undefined>(undefined);

  function handleStart() {
    timer.current = setInterval(() => {
      console.log("Tick");
    }, 1000);
  }

  function handleStop() {
    if (timer.current) {
      clearInterval(timer.current);
    }
  }

  return (
    <div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
}
```

**How to use**:

1. **Create ref for value**: `const timer = useRef<number | undefined>(undefined)` - Store interval ID
2. **Assign value**: `timer.current = setInterval(...)` - Save ID to ref when starting timer
3. **Use value**: `clearInterval(timer.current)` - Use stored value for cleanup
4. **Check safely**: `if (timer.current)` - Always check before cleanup

**Why ref instead of state?**

- Timer ID doesn't affect UI → no re-render needed
- State would cause unnecessary re-renders on every update
- Ref persists value without triggering updates

### Example 3: Storing Previous Values

**When to use**: When you need to compare current value with previous value.

```typescript
import { useState, useRef, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState<number>(0);
  const prevCountRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    prevCountRef.current = count;
  });

  const prevCount = prevCountRef.current;

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount ?? "N/A"}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**How to use**:

1. **Create ref**: `const prevCountRef = useRef<number | undefined>(undefined)` - Store previous value
2. **Update after render**: Use `useEffect` to update `prevCountRef.current = count` after each render
3. **Read value**: `const prevCount = prevCountRef.current` - Get previous value
4. **Handle undefined**: Use `??` for initial value: `prevCount ?? "N/A"`

**Note**: Update in `useEffect` to ensure value is saved after render completes.

**Custom hook pattern**:

```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

---

## Advanced: Advanced useRef Usage

### Example 1: useImperativeHandle - Exposing Methods to Parent

**When to use**: When you want to expose specific methods from a child component to its parent via ref.

![useImperativeHandle syntax](./public/useImperativeHandle.png)

**Example** (React 19 - ref as prop):

```typescript
import { useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  ref: React.Ref<ModalRef>;
}

export interface ModalRef {
  open: () => void;
}

function Modal({ ref }: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current?.showModal();
      },
    };
  });

  const container = document.getElementById("modal");
  if (!container) return null;

  return createPortal(
    <dialog ref={dialog}>
      <h2>Modal Content</h2>
      <button onClick={() => dialog.current?.close()}>Close</button>
    </dialog>,
    container
  );
}
```

**Note**: In React 19, you can pass `ref` as a regular prop. No need for `forwardRef` anymore.

**How to use**:

1. **Define interface**: Create `ModalRef` interface with methods you want to expose
2. **Type ref prop**: `ref: React.Ref<ModalRef>` - Type the ref prop (React 19)
3. **Create DOM ref**: `const dialog = useRef<HTMLDialogElement>(null)` - Ref for dialog element
4. **Expose methods**: `useImperativeHandle(ref, () => ({ open() { ... } }))` - Only expose `open()` method
5. **Use from parent**: `dialog.current?.open()` - Call method from parent component

**Note**: React 19 allows passing `ref` as a regular prop, no need for `forwardRef`.

**Usage in parent**:

```typescript
function Parent() {
  const modalRef = useRef<ModalRef | null>(null);

  function handleOpen() {
    modalRef.current?.open();
  }

  return (
    <>
      <button onClick={handleOpen}>Open Modal</button>
      <Modal ref={modalRef} />
    </>
  );
}
```

**Why use useImperativeHandle?**:

- Control what parent can access (encapsulation)
- Expose only necessary methods
- Better than exposing entire component instance
- TypeScript ensures type safety with interfaces

**TypeScript key points**:

- Define `ModalRef` interface to type the exposed methods
- Export `ModalRef` interface for use in parent component
- Use `React.Ref<ModalRef>` to type the ref prop
- `useRef<HTMLDialogElement>(null)` for dialog element
- Always check if container exists before using `createPortal`
- Optional chaining `?.` for safe method calls

### Example 2: Portal - Rendering Outside Parent DOM

**Portals**:

Portals provide a way to render children into a DOM node that exists outside the parent component's DOM hierarchy. This is useful for modals, tooltips, and other UI elements that need to break out of their parent's styling constraints.

![Why portals are useful](./public/portals-useful.png)
**When to use**: When you need to render content outside the parent component's DOM hierarchy (modals, tooltips, dropdowns).

![Portal syntax](./public/createPortal.png)

**Example**:

```typescript
import { createPortal } from "react-dom";

function Modal() {
  const container = document.getElementById("modal");
  if (!container) return null;

  return createPortal(
    <dialog>
      <h2>Modal Title</h2>
      <p>Modal content</p>
    </dialog>,
    container
  );
}
```

**HTML structure**:

```html
<div id="modal"></div>
<div id="root"></div>
```

**How to use**:

1. **Get container**: `const modalContainer = document.getElementById("modal")` - Find target DOM node
2. **Check existence**: `if (!modalContainer) return null` - Always verify container exists
3. **Render portal**: `createPortal(<dialog>...</dialog>, modalContainer)` - Render into target container
4. **Result**: Modal appears at root level, outside parent component's DOM hierarchy

**Benefits**: Escapes CSS constraints (overflow, z-index), better semantic HTML, improved accessibility. React events still bubble through component tree.

**Common use cases**: Modals and dialogs, tooltips, dropdown menus, loading overlays, notifications.

### Example 3: Multiple Refs

**When to use**: When you need to access multiple DOM elements.

**Example**:

```typescript
import { useRef } from "react";

function Form() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nameRef.current && emailRef.current && messageRef.current) {
      const data = {
        name: nameRef.current.value,
        email: emailRef.current.value,
        message: messageRef.current.value,
      };
      // Submit data
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} type="text" />
      <input ref={emailRef} type="email" />
      <textarea ref={messageRef} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**How to use**:

1. **Create multiple refs**: `const nameRef = useRef<HTMLInputElement>(null)` - One ref per element
2. **Attach to elements**: `ref={nameRef}` - Connect each ref in JSX
3. **Check all refs**: `if (nameRef.current && emailRef.current)` - Verify all exist before access
4. **Access values**: `nameRef.current.value` - Read form values safely

---

## Summary of useRef and Portal

### useRef

1. **Creating refs**: `const ref = useRef<Type>(initialValue)` - Creates a typed ref object
2. **Accessing value**: `ref.current` - Read or write the current value (may be null/undefined)
3. **DOM access**: Attach ref to element with `ref={myRef}` to access DOM directly
4. **Storing mutable values**: Store values that persist without causing re-renders
5. **No re-renders**: Updating `ref.current` does NOT trigger component re-render
6. **Type safety**: Always check `if (ref.current)` or use optional chaining `?.` before access

### useImperativeHandle

1. **Syntax**: `useImperativeHandle(ref, () => ({ method() { ... } }))`
2. **Purpose**: Expose specific methods from child to parent via ref
3. **Control**: Only expose what you want, not entire component instance
4. **TypeScript**: Define interface for exposed methods: `interface ModalRef { open: () => void }`
5. **Type ref prop**: Use `React.Ref<ModalRef>` to type the ref prop

### Portal

1. **Syntax**: `createPortal(children, container)`
2. **Purpose**: Render children into DOM node outside parent hierarchy
3. **Benefits**: Escape CSS constraints, better semantic HTML, improved accessibility
4. **Events**: React events still bubble through component tree

---

## TypeScript Types Reference

### Common useRef Types

**DOM Element Refs**:

```typescript
// Input elements
const inputRef = useRef<HTMLInputElement>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);
const selectRef = useRef<HTMLSelectElement>(null);

// Form elements
const formRef = useRef<HTMLFormElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

// Container elements
const divRef = useRef<HTMLDivElement>(null);
const sectionRef = useRef<HTMLElement>(null);

// Media elements
const videoRef = useRef<HTMLVideoElement>(null);
const audioRef = useRef<HTMLAudioElement>(null);

// Dialog/Modal
const dialogRef = useRef<HTMLDialogElement>(null);
```

**Value Refs**:

```typescript
// Numbers
const countRef = useRef<number>(0);
const timerRef = useRef<number | undefined>(undefined);

// Strings
const nameRef = useRef<string>("");

// Objects
interface User {
  name: string;
  age: number;
}
const userRef = useRef<User | null>(null);

// Arrays
const itemsRef = useRef<string[]>([]);
```

**Component Refs with useImperativeHandle**:

```typescript
// Define the exposed interface
interface ChildRef {
  open: () => void;
  close: () => void;
  reset: () => void;
}

// In parent component
const childRef = useRef<ChildRef | null>(null);

// In child component
useImperativeHandle(ref, () => ({
  open() {
    /* ... */
  },
  close() {
    /* ... */
  },
  reset() {
    /* ... */
  },
}));
```

**Type Guards for Safe Access**:

```typescript
// Check before accessing
if (inputRef.current) {
  inputRef.current.focus();
}

// Optional chaining
inputRef.current?.focus();

// Non-null assertion (use carefully!)
inputRef.current!.focus();
```

---

## Common Mistakes and How to Avoid Them

### Mistake 1: Reading ref.current During Render

![Mistake 1](./public/mistake-1.png)

### Mistake 2: Mutating ref.current During Render

![Mistake 2](./public/mistake-2.png)

### Mistake 3: Using ref Instead of state

![Mistake 3](./public/mistake-3.png)

### Mistake 4: Passing ref to Child Component (React 19)

**Note**: In React 19, `ref` can be passed as a regular prop. No need for `forwardRef`.

![Mistake 4](./public/mistake-4.png)

---

**References**:

- [React useRef Documentation](https://react.dev/reference/react/useRef)
- [React useImperativeHandle Documentation](https://react.dev/reference/react/useImperativeHandle)
- [React Portal Documentation](https://react.dev/reference/react-dom/createPortal)
- [React Hooks API Reference](https://react.dev/reference/react)
- [When to Use Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [React 19: Ref as a Prop](https://react.dev/blog/2024/04/25/react-19)
