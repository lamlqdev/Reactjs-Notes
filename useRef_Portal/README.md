# useRef and Portal

## Core Terminology

**Refs**:

Refs (references) are a way to access DOM elements or store mutable values that persist across renders without causing re-renders. Unlike state, updating a ref does not trigger a component re-render.

![Why refs are useful](./public/refs-useful.png)

1. **Direct DOM access**: Sometimes you need to interact with DOM elements directly (focus, scroll, measure size, etc.)

2. **Storing mutable values**: Store values that need to persist across renders but don't need to trigger re-renders (timer IDs, previous values, etc.)

3. **Avoiding re-renders**: Unlike state, refs don't cause re-renders when updated, making them perfect for values that don't affect the UI

4. **Accessing child component methods**: With `useImperativeHandle`, you can expose methods from child components to parent components (in React 19, ref can be passed as a regular prop)

**Portals**:

Portals provide a way to render children into a DOM node that exists outside the parent component's DOM hierarchy. This is useful for modals, tooltips, and other UI elements that need to break out of their parent's styling constraints.

![Why portals are useful](./public/portals-useful.png)

---

## useRef Syntax

![useRef syntax](./public/useRef.png)

---

## useRef vs useState

![useRef vs useState](./public/ref-vs-state.png)

**When to use useRef**:

- Accessing DOM elements
- Storing timer IDs, interval IDs
- Storing previous values
- Storing any value that doesn't need to trigger re-render

**When to use useState**:

- Values that affect UI rendering
- Values that need to trigger re-renders
- Form inputs (usually)

---

## Basic: Basic useRef Usage

This section guides you through using useRef in the most basic scenarios.

### Example 1: Accessing DOM Elements

**When to use**: When you need to directly interact with a DOM element (focus, scroll, measure, etc.)

**Example from project**:

```1:21:src/components/Player.jsx
import { useState, useRef } from "react";

export default function Player() {
  const name = useRef();
  const [playerName, setPlayerName] = useState("Unknow");

  function handleClick() {
    setPlayerName(name.current.value || "Unknown");
    name.current.value = "";
  }

  return (
    <section id="player">
      <h2>Welcome {playerName || "Unknown"}</h2>
      <p>
        <input type="text" ref={name} />
        <button onClick={handleClick}>Set Name</button>
      </p>
    </section>
  );
}
```

**Explanation**:

- `useRef()` creates a ref object
- `ref={name}` attaches the ref to the input element
- `name.current` gives direct access to the DOM element
- `name.current.value` accesses/modifies the input value
- Updating `name.current.value` does NOT trigger re-render

**Common DOM operations**:

- `ref.current.focus()` - Focus the element
- `ref.current.scrollIntoView()` - Scroll element into view
- `ref.current.value` - Get/set input value
- `ref.current.offsetHeight` - Measure element height

### Example 2: Storing Mutable Values (Timer IDs)

**When to use**: When you need to store values that persist across renders but don't need to trigger re-renders.

**Example from project**:

```1:57:src/components/TimeChallenge.jsx
import React from "react";
import { useState, useRef } from "react";
import ResultModal from "./ResultModal";

export default function TimeChallenge({ title, targetime }) {
  const timer = useRef();
  const dialog = useRef();

  const [timeRemaining, setTimeRemaining] = useState(targetime * 1000);

  const isTimerActive = timeRemaining > 0 && timeRemaining < targetime * 1000;

  if (timeRemaining <= 0) {
    clearInterval(timer.current);
    dialog.current.open();
  }

  function handleReset() {
    setTimeRemaining(targetime * 1000);
  }

  function handleStart() {
    timer.current = setInterval(() => {
      setTimeRemaining((prevTimeRemaining) => prevTimeRemaining - 10);
    }, 10);
  }

  function handleStop() {
    clearInterval(timer.current);
    dialog.current.open();
  }

  return (
    <>
      <ResultModal
        ref={dialog}
        targetTime={targetime}
        remainingTime={timeRemaining}
        onReset={handleReset}
      />
      <section className="challenge">
        <h2>{title}</h2>
        <p className="challenge-time">
          {targetime} second{targetime > 1 ? "s" : ""}
        </p>
        <p>
          <button onClick={isTimerActive ? handleStop : handleStart}>
            {isTimerActive ? "Stop" : "Start"} challenge
          </button>
        </p>
        <p className={isTimerActive ? "active" : undefined}>
          {isTimerActive ? "Timer is running..." : "Timer inactive"}
        </p>
      </section>
    </>
  );
}
```

**Explanation**:

- `timer.current` stores the interval ID returned by `setInterval`
- The interval ID persists across renders without causing re-renders
- `clearInterval(timer.current)` cleans up the timer
- `dialog.current` stores a reference to the child component (ref can be passed as a prop in React 19)

**Why not useState?**:

- Timer ID doesn't affect UI rendering
- Storing in state would cause unnecessary re-renders
- Ref persists the value without triggering updates

### Example 3: Storing Previous Values

**When to use**: When you need to compare current value with previous value.

**Example**:

```javascript
import { useState, useRef, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef();

  useEffect(() => {
    prevCountRef.current = count;
  });

  const prevCount = prevCountRef.current;

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**Explanation**:

- `prevCountRef.current` stores the previous count value
- Updated in `useEffect` to run after render
- Doesn't trigger re-render when updated
- Useful for tracking changes

---

## Advanced: Advanced useRef Usage

This section guides you through more advanced patterns with useRef, including `useImperativeHandle`.

### Example 1: useImperativeHandle - Exposing Methods to Parent

**When to use**: When you want to expose specific methods from a child component to its parent via ref.

![useImperativeHandle syntax](./public/useImperativeHandle.png)

**Example from project** (React 19 - ref as prop):

```javascript
import { useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";

function ResultModal({ targetTime, remainingTime, onReset, ref }) {
  const dialog = useRef();

  const userLost = remainingTime <= 0;
  const formattedRemainingTime = (remainingTime / 1000).toFixed(2);
  const score = Math.round((1 - remainingTime / (targetTime * 1000)) * 100);

  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current.showModal();
      },
    };
  });

  return createPortal(
    <dialog ref={dialog} className="result-modal" onClose={onReset}>
      {userLost && <h2>You lost</h2>}
      {!userLost && <h2>You score: {score}</h2>}
      <p>
        The target time was <strong>{targetTime} seconds.</strong>
      </p>
      <p>
        You stopped the timer with{" "}
        <strong>{formattedRemainingTime} second left.</strong>
      </p>
      <form method="dialog" onSubmit={onReset}>
        <button>Close</button>
      </form>
    </dialog>,
    document.getElementById("modal")
  );
}

export default ResultModal;
```

**Note**: In React 19, you can pass `ref` as a regular prop. No need for `forwardRef` anymore.

**Explanation**:

- `useImperativeHandle` customizes what the parent can access via ref
- Returns an object with `open()` method
- Parent can call `dialog.current.open()` to open the modal
- Only exposes what you want, not the entire component instance

**Usage in parent**:

```13:16:src/components/TimeChallenge.jsx
  if (timeRemaining <= 0) {
    clearInterval(timer.current);
    dialog.current.open();
  }
```

```28:31:src/components/TimeChallenge.jsx
  function handleStop() {
    clearInterval(timer.current);
    dialog.current.open();
  }
```

**Why use useImperativeHandle?**:

- Control what parent can access (encapsulation)
- Expose only necessary methods
- Better than exposing entire component instance

### Example 2: Portal - Rendering Outside Parent DOM

**When to use**: When you need to render content outside the parent component's DOM hierarchy (modals, tooltips, dropdowns).

![Portal syntax](./public/createPortal.png)

**Example from project**:

```22:38:src/components/ResultModal.jsx
  return createPortal(
    <dialog ref={dialog} className="result-modal" onClose={onReset}>
      {userLost && <h2>You lost</h2>}
      {!userLost && <h2>You score: {score}</h2>}
      <p>
        The target time was <strong>{targetTime} seconds.</strong>
      </p>
      <p>
        You stopped the timer with{" "}
        <strong>{formattedRemainingTime} second left.</strong>
      </p>
      <form method="dialog" onSubmit={onReset}>
        <button>Close</button>
      </form>
    </dialog>,
    document.getElementById("modal")
  );
```

**HTML structure**:

```10:16:index.html
    <div id="modal"></div>
    <div id="content">
      <header>
        <h1>The <em>Almost</em> Final Countdown</h1>
        <p>Stop the timer once you estimate that time is (almost) up</p>
      </header>
      <div id="root"></div>
    </div>
```

**Explanation**:

- Modal is rendered into `<div id="modal">` instead of inside the component tree
- Modal appears at root level, outside `#content` container
- Escapes parent's CSS constraints (overflow, z-index, positioning)
- Events still bubble through React component tree (not DOM tree)

**Benefits**:

1. **CSS escape**: Modal not constrained by parent's `overflow: hidden` or `z-index`
2. **Semantic HTML**: Modals typically should be at root level
3. **Accessibility**: Screen readers can better understand modal structure
4. **Event handling**: React events still work normally

**Common use cases**:

- Modals and dialogs
- Tooltips
- Dropdown menus
- Loading overlays
- Notifications

---

## Summary of useRef and Portal

### useRef

1. **Creating refs**: `const ref = useRef(initialValue)` - Creates a ref object
2. **Accessing value**: `ref.current` - Read or write the current value
3. **DOM access**: Attach ref to element with `ref={myRef}` to access DOM directly
4. **Storing mutable values**: Store values that persist without causing re-renders
5. **No re-renders**: Updating `ref.current` does NOT trigger component re-render

### useImperativeHandle

1. **Syntax**: `useImperativeHandle(ref, () => ({ method() { ... } }))`
2. **Purpose**: Expose specific methods from child to parent via ref
3. **Control**: Only expose what you want, not entire component instance

### Portal

1. **Syntax**: `createPortal(children, container)`
2. **Purpose**: Render children into DOM node outside parent hierarchy
3. **Benefits**: Escape CSS constraints, better semantic HTML, improved accessibility
4. **Events**: React events still bubble through component tree

---

## Common Patterns and Best Practices

### Pattern 1: Ref for DOM Element with useEffect

**Example**:

```javascript
import { useRef, useEffect } from "react";

function AutoFocusInput() {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}
```

**When to use**: When you need to perform DOM operations after component mounts.

### Pattern 2: Ref for Previous Value

**Example**:

```javascript
import { useRef, useEffect } from "react";

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
```

**When to use**: When you need to track previous values for comparison.

### Pattern 3: Ref Callback Pattern

**Example**:

```javascript
function Component() {
  const [node, setNode] = useState(null);

  return (
    <div ref={(el) => setNode(el)}>
      {node && <p>Element mounted: {node.offsetHeight}px</p>}
    </div>
  );
}
```

**When to use**: When you need to do something when ref is attached/detached.

### Pattern 4: Multiple Refs

**Example**:

```javascript
function Form() {
  const nameRef = useRef();
  const emailRef = useRef();
  const messageRef = useRef();

  function handleSubmit() {
    const data = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      message: messageRef.current.value,
    };
    // Submit data
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

**When to use**: When you need to access multiple DOM elements.

### Pattern 5: Portal with Backdrop

**Example**:

```javascript
import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="modal">{children}</div>
    </>,
    document.body
  );
}
```

**When to use**: When creating modals with backdrop overlays.

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

### Mistake 5: Portal Container Not Found

![Mistake 5](./public/mistake-5.png)

---

**References**:

- [React useRef Documentation](https://react.dev/reference/react/useRef)
- [React useImperativeHandle Documentation](https://react.dev/reference/react/useImperativeHandle)
- [React Portal Documentation](https://react.dev/reference/react-dom/createPortal)
- [React Hooks API Reference](https://react.dev/reference/react)
- [When to Use Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [React 19: Ref as a Prop](https://react.dev/blog/2024/04/25/react-19)
