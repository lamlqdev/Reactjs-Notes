# JavaScript Event Loop - Deep Dive

## Overview

The event loop is a pretty notorious topic in JavaScript, but when we zoom out, it's just a tiny component within the JavaScript runtime. JavaScript Runtime components are:

- JavaScript Engine: Contains the call stack and memory heap
- Call Stack: Manages execution of our program
- Web APIs: Browser-provided interfaces
- Task Queue (also called Callback Queue): Used by callback-based Web APIs
- Microtask Queue: Used by promise handlers
- Event Loop: Coordinates between queues and call stack

## Why this matters: JavaScript is Single-threaded

JavaScript itself is **single-threaded**. We're only working with a single call stack.

### The Call Stack

The call stack manages the execution of our program.

**Example:**

```javascript
console.log(1);
console.log(2);

function logThreeAndFour() {
  logThree();
  console.log(4);
}

function logThree() {
  console.log(3);
}

logThreeAndFour();
```

**Execution flow:**

1. `console.log(1)` - New execution context created, pushed onto call stack, evaluated, logs `1`
2. `console.log(2)` - Same story: execution context created, pushed onto call stack, evaluated, logs `2`
3. `logThreeAndFour()` is invoked
   - Within this function body, we invoke `logThree()`
   - Within `logThree()`, we invoke `console.log(3)`
   - Eventually logs `3`
4. Second line within `logThreeAndFour()`: `console.log(4)`
   - `4` gets logged
   - The `logThreeAndFour()` execution context is popped off the call stack

## The problem: Long-running tasks

**Important**: JavaScript can handle a **single task at a time**. If we have a long-running task with heavy computation, it takes a while before JavaScript can continue with the rest of our program.

```javascript
// Heavy computation - takes a while
longRunningTask();

console.log("Long task done"); // Only logged after several seconds
```

This is not what we want because in the meantime, **our entire program is frozen**.

### Real-world Long-running tasks

In a real-life application, we often have to use long-running tasks like:

- Network requests
- Anything based on user input
- Timers

**Question**: Is our entire call stack just blocked until we get the data back?

**Answer**: No! Because we're actually using **Web APIs** in those cases.

## Web APIs

Web APIs provide a set of interfaces that allow us to interact with the browser's features.

### Common Web APIs

Functionality we often use:

- Document Object Model (DOM)
- `fetch`
- `setTimeout`
- And many more

### Browser Capabilities

The browser is a very powerful platform with a lot of features:

**Required features:**

- Rendering engine
- Networking stack

**Additional features:**

- Device sensors
- Cameras
- Geolocation
- And more

### How Web APIs handle Long-running tasks

Some of these Web APIs allow us to **offload long-running tasks to the browser**. When we invoke such an API, we're kind of just **initiating that offloading**.

Web APIs that expose these asynchronous capabilities are either:

1. **Callback-based**
2. **Promise-based**

## Callback-Based APIs

### Example: Geolocation API

Let's say we want to get the user's location. We can use the `getCurrentPosition` method exposed by the geolocation API.

```javascript
navigator.geolocation.getCurrentPosition(
  successCallback,  // Called if everything goes well
  errorCallback     // Called if anything goes wrong
);
```

### Execution Flow

**Step 1**: `getCurrentPosition()` invocation gets added to the call stack

- This is just to **register those callbacks** and **initiate that async task**
- After doing that, it can get **popped off the call stack immediately**
- It doesn't wait for any data

**Step 2**: In the background, the browser starts some kind of process that eventually shows the user a popup

**Important**: We don't know when the user is going to interact with this popup, but that's not a problem because this is not happening on the call stack. Our entire website is still responsive in case other tasks need to run.

**Step 3**: Finally, the user clicks on "Allow"

- The API receives the data from the browser
- Uses the success callback to handle this result

**Problem**: It can't just push that callback back onto the call stack. This could disrupt an already running task and create very unpredictable behavior.

**Solution**: The callback gets pushed to the **Task Queue**.

## Task Queue

The Task Queue (also called the **Callback Queue**) holds:

- Web API callbacks
- Event handlers

These are executed at some point later in the future.

### The Event Loop's Role

This is where we finally get to the event loop.

**The event loop's responsibility:**

1. Check if the call stack is empty
2. If nothing is running, get the first available task from the task queue
3. Move this to the call stack where it's executed

Now finally we handle the results and the user's location is logged to the console.

## setTimeout Example

Another very popular callback-based Web API is `setTimeout`.

`setTimeout` receives:

- A callback
- A delay

```javascript
setTimeout(() => console.log("100ms"), 100);
setTimeout(() => console.log("2000ms"), 2000);
console.log("End of script");
```

### Execution Flow

**Step 1**: First `setTimeout` is encountered

- Gets added to the call stack
- All it does is **register that callback and the delay** with the timer's API
- In the background, the browser will handle that timer

**Step 2**: Second `setTimeout`

- Again, registers the callback and the delay

**Step 3**: Our timers are still running, `console.log("End of script")`

- Just gets added to the call stack
- Logs "End of script"
- Nothing asynchronous here

**Step 4**: After 100 milliseconds

- Browser says: "Hey, 100 milliseconds expired"
- Callback moves onto the task queue
- Nothing on the call stack right now
- Moves onto the call stack
- Eventually logs "100ms"

**Step 5**: 2000 milliseconds are up

- Same story
- Callback is pushed onto the task queue
- Call stack is empty
- Moves onto the call stack
- Logs "2000ms"

### Important Note About Delays

**Very important to remember**: When you have a `setTimeout` and a delay, **it's not the delay until it gets moved onto the call stack**.

It's the **delay until it gets moved to the task queue**.

This means that the delay we specify might not actually be the delay to execution, because:

- If the call stack was still very full with other tasks
- And this could run for many more seconds
- The callback would still have to wait in the task queue until the call stack is empty

### Summary: Callback-Based APIs

Long story short: **Callbacks provided by Web APIs are pushed onto the task queue when the asynchronous task completes**.

## Microtask Queue

Whenever we work with promises, we're working with the **microtask queue**.

### What Goes in the Microtask Queue?

The microtask queue is a special queue dedicated to:

- `then` callbacks
- `catch` callbacks
- `finally` callbacks
- Function body execution after `await`
- `queueMicrotask` callbacks
- `new MutationObserver` callbacks

**Only those callbacks or function body parts get pushed onto the microtask queue**—it's very specific.

### Event Loop Priority

**However**, the event loop **prioritizes the microtask queue**.

Whenever the call stack is empty, the event loop:

1. **First ensures that the microtask queue is entirely empty**
2. Gets all the tasks from the microtask queue
3. Moves them onto the call stack where they get executed
4. **Only then** will it move to the task queue
5. After each task in the task queue, it again checks the microtask queue

## Promise-Based APIs: fetch

A popular promise-based Web API is `fetch`.

```javascript
fetch('https://api.example.com/data')
  .then(res => console.log(res));

console.log("End of script");
```

### Execution Flow

**Step 1**: `fetch` is called

- Added to the call stack
- Responsible for creating a promise object
  - By default: pending
  - Result: undefined
  - No promise reactions yet
- Also initiates that background network request (handled by the browser)

**Step 2**: Move to the next line, the `then` handler

- Creates a promise reaction record where we have `res => console.log(res)`
- Server still hasn't responded

**Step 3**: Line 4, synchronous `console.log("End of script")`

- "End of script" is logged to the console

**Step 4**: Finally, the server returns some data

- Promise state set to **fulfilled**
- Promise result is now the response object with the data from the server
- Promise reaction handler is now pushed to the **microtask queue** (because it's a `then` callback)

**Step 5**: Call stack is empty

- Event loop checks the microtask queue
- Moves this to the call stack
- Eventually logs the result from the server

### Microtask Warning: Infinite Loops

Something to keep in mind: **A microtask can also schedule another microtask**.

This means the event loop is just constantly handling microtasks and it can never actually get to the task queue—it would just have to wait indefinitely.

We're creating an **infinite microtask loop**, freezing our entire program.

**Note**: In Node.js, you can set something like `maxTickDepth` which prevents this exact thing from happening. Just make sure you don't accidentally end up doing that.

## Promisifying Callbacks

We can also **promisify** a callback-based API.

**Example**: Wrapping `getCurrentPosition` with a new Promise constructor:

```javascript
function getCurrentPositionPromise() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
```

For the success callback and the error callback, we just pass `resolve` and `reject`.

This can be a pretty nice solution to improve the readability within your codebase.

## Challenge Quiz

What gets logged?

```javascript
Promise.resolve().then(() => console.log(1));

setTimeout(() => console.log(2), 10);

queueMicrotask(() => {
  console.log(3);
  queueMicrotask(() => console.log(4));
});

console.log(5);
```

### Answer: 5, 1, 3, 4, 2

### Detailed Explanation

**Step 1**: `Promise.resolve()`

- Creates a new promise object that's instantly resolved

**Step 2**: The `then` handler

- Promise is already resolved
- In the background, it creates that promise reaction
- Handler is immediately pushed to the **microtask queue**

**Step 3**: `setTimeout`

- Responsible for initiating that timer
- Callback and delay get passed to the API
- In the background, the browser starts a timer

**Step 4**: `queueMicrotask`

- Call is added to the call stack
- Queues that callback to the **microtask queue**

**Step 5**: Synchronous `console.log(5)`

- Gets pushed to the call stack
- **Logs 5**

**Step 6**: In the meantime, 10 milliseconds are up

- Callback from `setTimeout` is pushed to the **task queue** (callback-based API)

**Step 7**: Our script is done, call stack is empty

- Event loop checks the **microtask queue**
- We have the promise handler callback
- Eventually calls `console.log(1)`
- **Logs 1**

**Step 8**: `queueMicrotask` callback

- Within this callback we call `console.log(3)`
- **Logs 3**
- Then we call another `queueMicrotask`
- Queues another microtask with its callback to the microtask queue

**Step 9**: Event loop ensures microtask queue is entirely empty before moving to task queue

- That callback is immediately moved onto the call stack
- **Logs 4**

**Step 10**: Finally, call stack is empty and microtask queue is empty

- First available task from the task queue is moved onto the call stack
- Eventually logs 2
- **Logs 2**

**Final result**: 5, 1, 3, 4, 2

## Recap

Let's recap what we've covered:

### JavaScript is Single-Threaded

- Can only handle one task at a time

### Web APIs

- We can use Web APIs to interact with features leveraged by the browser
- Some of these APIs allow us to initiate async tasks in the background

### Initiating Async Tasks

- The function call that initiates an async task is still added to the call stack
- But this is just to hand it off to the browser
- The actual async task is handled in the background
- It does not block the call stack

### Task Queue

- Used by **callback-based Web APIs**
- Enqueues the callback once the asynchronous task has completed

### Microtask Queue

- Only used by:
  - Promise handlers (`then`, `catch`, `finally`)
  - Async function bodies after `await`
  - `queueMicrotask` callbacks
  - `new MutationObserver` callbacks
- **This queue has priority over the task queue**

### Event Loop Behavior

- Ensures the microtask queue is **entirely empty** before moving on to the task queue
- After handling each task from the task queue, the event loop again checks the microtask queue to ensure nothing has been added in the meantime

## Final Notes

You often come across asynchronous JavaScript, and if you aren't entirely sure why things execute a certain way, it might be discouraging.

Understanding the task queue, microtask queue, and event loop helps you understand why certain parts of our code execute at a certain time.

**Recommendation**: Play around with it yourself:

- Try using `setTimeout`
- Try using `queueMicrotask`
- Get a better sense of why things run at certain times

---

*Understanding the event loop is key to mastering asynchronous JavaScript.*
