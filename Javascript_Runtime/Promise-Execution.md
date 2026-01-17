# JavaScript Promises - Deep Dive

## Introduction

Promises in JavaScript are known to be a little daunting, intimidating, or annoying. But once you understand what happens behind the scenes under the hood, they're actually not that complicated.

This document walks through promise execution and what happens behind the scenes when we interact and work with promises.

## Creating a Promise: The Promise Constructor

One way to create a promise is by using the **new Promise constructor**.

```javascript
new Promise((resolve, reject) => {
  // Executor function
});
```

This constructor receives an **executor function**.

### What Happens When the Constructor is Executed

When the `new Promise` constructor is executed, a **new promise object is created in memory**.

This object contains some **internal slots**:

- **Promise State**: The current state of the promise
- **Promise Result**: The result value of the promise
- **Promise Fulfill Reactions**: List of handlers for fulfillment
- **Promise Reject Reactions**: List of handlers for rejection
- **Promise Is Handled**: Whether the promise has handlers

We also get some additional functionality to either **resolve** or **reject** this promise.

### Resolving a Promise

We can resolve this promise by calling `resolve`, which is made available to us by the executor function.

```javascript
new Promise((resolve, reject) => {
  resolve("done");
});
```

When we call `resolve`:

- **Promise State** is set to `fulfilled`
- **Promise Result** is set to the value that we pass to `resolve` (the string "done" in this case)

### Rejecting a Promise

Similarly, we can reject the promise by calling `reject`.

```javascript
new Promise((resolve, reject) => {
  reject("fail");
});
```

When we call `reject`:

- **Promise State** is set to `rejected`
- **Promise Result** is set to the value that we passed to `reject` (the string "fail")

### So What's Special?

Cool, nothing special here. We're just calling a function to change some object property. So what's so special about promises?

That's actually in those two fields we skipped so far: **Promise Fulfill Reactions** and **Promise Reject Reactions**.

These fields contain something called **Promise Reaction Records**.

## Promise Reaction Records

We can create a promise reaction record by chaining a **then** or a **catch** method to the promise.

```javascript
promise.then(callback);
```

Whenever we chain `then`, the `then` method is responsible for creating that **promise reaction record**.

### Promise Reaction Record Structure

Among many other fields, this reaction record contains a **handler**, and this has some code—that code is that **callback that we passed to `then`**.

### What Happens When We Resolve

When we resolve the promise (call `resolve`):

1. `resolve` is added to the call stack
2. Promise state is set to `fulfilled`
3. Promise result is set to the value we pass to `resolve`
4. The **promise reaction record's handler receives that promise result** (the string "done" in this case)
5. The **handler is now added to the microtask queue**

**This is where the asynchronous part of promises comes into play.**

### Quick Refresher: Microtask Queue

Whenever the call stack is empty:

- The event loop **first checks** the microtask queue
- When this queue is empty, it goes to the task queue (also called the callback queue, macro task queue)

**What's important**: The **microtask queue gets priority**.

## Asynchronous Tasks in Promises

So far we've only been calling `resolve` and `reject` synchronously (right in the promise constructor).

Usually, you want to **initiate some kind of asynchronous task** in this constructor.

### What is an Asynchronous Task?

By asynchronous task, we mean **anything off the main thread**:

- Reading something from a file system
- A network request
- Something as simple as a timer

Whenever they return that data, we can use their callback function to either:

- **Resolve** with the data that they returned
- **Reject** if an error occurred

## Example: Promise with setTimeout

Let's see how the execution goes for this promise constructor:

```javascript
new Promise((resolve) => {
  setTimeout(() => resolve("done"), 100);
}).then(result => console.log(result));
```

### Step-by-Step Execution

**Step 1**: `new Promise` constructor is added to the call stack

- Creates the promise object
- Executor function is called

**Step 2**: First line: `setTimeout`

- `setTimeout` is added to the call stack
- Responsible for scheduling that timer (100 milliseconds)
- Has that callback that we passed to `setTimeout` (the function that eventually calls `resolve`)

**Step 3**: Next line: the `then` handler

- `then` is added to the call stack
- Responsible for creating that **promise reaction record**
- Creates a promise reaction record with the callback we provided as its handler
- `then` is popped off the call stack

**Step 4**: Let's imagine those 100 milliseconds are up

- The callback that we passed to `setTimeout` is now added to the **task queue**
- Nothing on the call stack anymore (script is finished)
- It can now go from the task queue to the call stack

**Step 5**: Callback now calls `resolve`

- Changes the promise state to `fulfilled`
- Promise result to the string "done"
- **Schedules that handler to the microtask queue**
- `resolve` is popped off the call stack
- The callback is popped off

**Step 6**: Nothing on the call stack again

- Event loop first checks the **microtask queue**
- Our handler is waiting there
- Handler is added to the call stack
- Console logs the promise result, which is the string "done"

### Why the Microtask Queue is Nice

The nice thing about the fact that it's added to the microtask queue is that **in the meantime our script can just keep running**.

It can keep performing important tasks and stays interactive. Only when the call stack is empty (when there's nothing important to do) does it get added to the call stack from the microtask queue.

**This means we can handle the promise result in a non-blocking way.**

## Chaining Then Methods

Another cool thing is that **`then` itself also returns a promise**.

Besides just creating that promise reaction record, it also creates a promise object.

This allows us to **chain those `then`s to each other** and have this incremental promise result handling.

### Example: Chaining Multiple Then Calls

```javascript
Promise.resolve(1)
  .then(result => result * 2)
  .then(result => result * 2)
  .then(result => console.log(result));
```

### Step-by-Step Execution

**Step 1**: `Promise.resolve(1)`

- Creates the promise object
- Immediately resolves with `1`
- State is set to `fulfilled`
- Promise result is `1`

**Step 2**: First `then` handler

- Creates a promise reaction record with the handler being `result => result * 2` (result being that promise result, which is `1`)
- Returns `result * 2` (result being `1`, so `1 * 2 = 2`)
- Also creates a promise object
- This is now set to `fulfilled` because we returned `result * 2`
- Result is `2`

**Step 3**: Second `then` handler

- Creates a promise reaction record again with the exact same handler (`result * 2`)
- This time result being `2`
- `2 * 2 = 4`
- Promise result is now `4`

**Step 4**: Final `then` handler

- Just logs that value
- State is set to `fulfilled`
- Result is `undefined` (because we didn't return a value, we're only logging it)
- In the console you will see **4**

### Real-World Use Case

That's just something to keep in mind: we can **chain those `then`s together** and incrementally handle that promise result in a non-blocking way.

In a real application, you won't use numbers like this. Instead, you want to **incrementally handle that promise result**. Maybe you have some kind of image that you:

1. First want to resize
2. Then add a filter
3. Then change the format

You can do all that by chaining `then` in a non-blocking way. That's pretty powerful.

## Challenge

What gets logged when we execute this code?

```javascript
new Promise((resolve) => {
  console.log(1);
  resolve(2);
}).then(result => console.log(result));

console.log(3);
```

### Answer: 1, 3, 2

### Detailed Explanation

**Step 1**: `new Promise` constructor

- Added to the call stack
- New promise object is created

**Step 2**: Executor function

- Gets added to the call stack
- On the very first line: `console.log(1)`
- Gets added to the call stack
- **Logs 1**

**Step 3**: Call `resolve(2)`

- Promise state is changed to `fulfilled`
- Promise result is set to `2`
- We don't have a promise fulfill reaction **yet** (that only happens on the next line)
- `resolve` is popped off the call stack
- Executor function is popped off
- `new Promise` constructor is popped off

**Step 4**: Next line, finally `then`

- Creates that promise reaction record
- It doesn't get added to that list because the promise is already resolved (this would just take up unnecessary memory)
- But it still has access to that promise result
- This promise reaction record has the handler with the result being `2`, then `console.log(result)`
- **Immediately added to the microtask queue**

**Important**: It's not immediately executed—no, it is immediately **scheduled** to the microtask queue.

**Step 5**: Next line (our script isn't done yet, call stack isn't empty yet)

- `console.log(3)` in a normal way
- Added to the call stack
- **Logs 3**

We now have: **1, 3**

**Step 6**: Finally our script is done, nothing on the call stack

- First task in the microtask queue is added to the call stack
- That's the `then` handler
- Console logs the result being `2`
- **Logs 2**

**Final result**: 1, 3, 2

## Key Takeaways

### Promise Object Internal Slots

- Promise State (pending/fulfilled/rejected)
- Promise Result (the resolved/rejected value)
- Promise Fulfill Reactions (handlers for `.then`)
- Promise Reject Reactions (handlers for `.catch`)
- Promise Is Handled (tracking handler attachment)

### Promise Reaction Records

- Created when chaining `.then()` or `.catch()`
- Contains a handler (the callback function)
- Receives the promise result when the promise settles

### Asynchronous Execution

- Handlers are added to the **microtask queue**, not executed immediately
- Allows non-blocking handling of promise results
- Script continues running while promises settle
- Handlers execute only when call stack is empty

### Chaining Promises

- `.then()` returns a new promise
- Allows incremental processing of results
- Each `.then()` can transform the value for the next `.then()`
- Enables clean, readable asynchronous code flow

### Execution Order

- Synchronous code in executor runs immediately
- `resolve()`/`reject()` schedules handlers to microtask queue
- Remaining synchronous code completes first
- Microtask queue executes when call stack is empty

---

*Promises enable non-blocking asynchronous operations through the microtask queue mechanism.*
