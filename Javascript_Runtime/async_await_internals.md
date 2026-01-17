# Async/Await Internals - Deep Dive

## Overview

Async/await is syntactic sugar built on top of Promises and generators. Understanding how async/await works under the hood requires knowledge of:
- Promises and the microtask queue
- Generator functions
- How JavaScript handles asynchronous execution

This document explores the internal mechanics of async/await and how it transforms synchronous-looking code into asynchronous operations.

## What is an Async Function?

An async function is a function declared with the `async` keyword:

```javascript
async function fetchData() {
  return 'data';
}
```

### Key Characteristics

**1. Always returns a Promise:**

```javascript
async function getValue() {
  return 42;
}

const result = getValue();
console.log(result); // Promise { 42 }

result.then(value => console.log(value)); // 42
```

Even if you return a non-Promise value, it gets wrapped in a resolved Promise.

**Equivalent without async:**

```javascript
function getValue() {
  return Promise.resolve(42);
}
```

**2. Can use await inside:**

Only async functions can use the `await` keyword (except in top-level await in modules).

## How Async Functions Work

When you call an async function:

1. **Function is invoked**: Execution starts
2. **Promise is created**: A new Promise is created immediately
3. **Function body executes**: Until first `await` or return
4. **Promise is returned**: The function returns the Promise immediately
5. **Execution continues asynchronously**: After any `await` points

### Example Execution Flow

```javascript
async function example() {
  console.log('Start');
  return 'Done';
}

console.log('Before');
const promise = example();
console.log('After');
promise.then(result => console.log(result));
```

**Output:**
```
Before
Start
After
Done
```

**Execution breakdown:**

1. `console.log('Before')` executes: logs "Before"
2. `example()` is called:
   - Execution enters the function
   - `console.log('Start')` executes: logs "Start"
   - `return 'Done'` creates a resolved Promise
   - Promise is returned immediately
3. `console.log('After')` executes: logs "After"
4. Promise handler executes in microtask queue: logs "Done"

## The Await Keyword

`await` pauses the execution of the async function and waits for a Promise to settle.

### Basic Await Behavior

```javascript
async function fetchUser() {
  console.log('Fetching user...');
  const user = await fetch('/api/user');
  console.log('User fetched');
  return user;
}
```

**What `await` does:**

1. Evaluates the expression after `await`
2. If it's not a Promise, wraps it in `Promise.resolve()`
3. **Pauses** the async function execution
4. Registers a continuation (the rest of the function) to run when the Promise settles
5. Returns control to the caller
6. When Promise resolves, **resumes** execution with the resolved value

### Await Execution Flow

```javascript
async function example() {
  console.log('1');
  const result = await Promise.resolve('2');
  console.log(result);
  console.log('3');
}

console.log('Start');
example();
console.log('End');
```

**Output:**
```
Start
1
End
2
3
```

**Step-by-step execution:**

**Step 1**: `console.log('Start')` executes
- Logs: "Start"

**Step 2**: `example()` is called
- Async function starts executing
- `console.log('1')` executes: logs "1"
- Reaches `await Promise.resolve('2')`

**Step 3**: Await pauses the function
- `Promise.resolve('2')` is already resolved
- But the continuation (rest of the function) is scheduled to microtask queue
- Function execution pauses
- Control returns to caller

**Step 4**: `console.log('End')` executes
- Logs: "End"
- Synchronous code is done

**Step 5**: Event loop checks microtask queue
- Finds the continuation from `example()`
- Resumes execution after the `await`
- `result` is assigned the value '2'
- `console.log(result)` executes: logs "2"
- `console.log('3')` executes: logs "3"

## Async/Await vs Promises

Async/await is syntactic sugar over Promises. Let's compare:

### Promise Chain

```javascript
function fetchUserData() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => {
      console.log(user);
      return fetch(`/api/posts/${user.id}`);
    })
    .then(response => response.json())
    .then(posts => {
      console.log(posts);
      return posts;
    });
}
```

### Async/Await Equivalent

```javascript
async function fetchUserData() {
  const response = await fetch('/api/user');
  const user = await response.json();
  console.log(user);
  
  const postsResponse = await fetch(`/api/posts/${user.id}`);
  const posts = await postsResponse.json();
  console.log(posts);
  return posts;
}
```

**Both produce the same result**, but async/await:
- Looks more synchronous and readable
- Easier to debug
- Simpler error handling with try/catch

## Async/Await and Generators

Async/await is conceptually similar to generators with promises. In fact, async/await can be desugared to generators.

### Generator-based Async

Before async/await, libraries like co used generators for async code:

```javascript
function* fetchUserData() {
  const response = yield fetch('/api/user');
  const user = yield response.json();
  return user;
}

// Runner function (simplified)
function run(generator) {
  const gen = generator();
  
  function handle(result) {
    if (result.done) return Promise.resolve(result.value);
    
    return Promise.resolve(result.value)
      .then(value => handle(gen.next(value)))
      .catch(error => handle(gen.throw(error)));
  }
  
  return handle(gen.next());
}

run(fetchUserData).then(user => console.log(user));
```

### Async/Await Desugaring

An async function like this:

```javascript
async function example() {
  const a = await promiseA();
  const b = await promiseB(a);
  return b;
}
```

Can be thought of as:

```javascript
function example() {
  return new Promise((resolve, reject) => {
    function step(nextValue) {
      try {
        const result = generator.next(nextValue);
        
        if (result.done) {
          resolve(result.value);
        } else {
          Promise.resolve(result.value)
            .then(step)
            .catch(error => generator.throw(error));
        }
      } catch (error) {
        reject(error);
      }
    }
    
    const generator = (function*() {
      const a = yield promiseA();
      const b = yield promiseB(a);
      return b;
    })();
    
    step();
  });
}
```

**Key insight:** Each `await` is like a `yield`, and the async function runtime acts like a generator runner.

## Error Handling

### Try/Catch with Async/Await

One of the biggest advantages of async/await is unified error handling:

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw or handle
  }
}
```

**What happens when an await rejects:**

```javascript
async function example() {
  console.log('1');
  try {
    const result = await Promise.reject(new Error('Failed'));
    console.log('2'); // Never executes
  } catch (error) {
    console.log('Caught:', error.message);
  }
  console.log('3');
}

example();
```

**Execution flow:**

1. Logs: "1"
2. `await Promise.reject(...)` pauses function
3. Promise rejects
4. Execution resumes at the catch block
5. Logs: "Caught: Failed"
6. Logs: "3"

### Unhandled Rejections

If you don't catch errors in an async function, they become unhandled rejections:

```javascript
async function example() {
  await Promise.reject(new Error('Unhandled'));
}

example(); // UnhandledPromiseRejectionWarning
```

**Always handle errors:**

```javascript
async function example() {
  try {
    await Promise.reject(new Error('Handled'));
  } catch (error) {
    console.error(error);
  }
}

// Or
example().catch(error => console.error(error));
```

### Error Propagation

Errors propagate up through async function calls:

```javascript
async function level3() {
  await Promise.reject(new Error('Level 3 error'));
}

async function level2() {
  await level3(); // Error propagates
}

async function level1() {
  try {
    await level2(); // Error caught here
  } catch (error) {
    console.log('Caught at level 1:', error.message);
  }
}

level1(); // Logs: "Caught at level 1: Level 3 error"
```

## Async Function Execution Context

When an async function awaits, its execution context is different from regular functions.

### Execution Context Lifecycle

```javascript
async function outer() {
  console.log('Outer start');
  await inner();
  console.log('Outer end');
}

async function inner() {
  console.log('Inner start');
  await Promise.resolve();
  console.log('Inner end');
}

outer();
console.log('Sync end');
```

**Output:**
```
Outer start
Inner start
Sync end
Inner end
Outer end
```

**Execution context flow:**

1. **Outer execution context created** and pushed to call stack
2. Logs: "Outer start"
3. Calls `inner()`, **inner execution context created**
4. Logs: "Inner start"
5. `await Promise.resolve()` in inner - execution context **paused and removed from stack**
6. Control returns to outer
7. Outer's `await inner()` - execution context **paused and removed from stack**
8. Control returns to global
9. Logs: "Sync end"
10. Microtask queue: inner's continuation runs, **context recreated**
11. Logs: "Inner end"
12. Inner resolves
13. Microtask queue: outer's continuation runs, **context recreated**
14. Logs: "Outer end"

**Key point:** Execution contexts are created and destroyed multiple times during async function execution.

## Parallel vs Sequential Execution

Understanding how await affects execution order is crucial for performance.

### Sequential Execution (Slower)

```javascript
async function sequential() {
  const user = await fetchUser();      // Wait 100ms
  const posts = await fetchPosts();    // Wait 100ms
  const comments = await fetchComments(); // Wait 100ms
  return { user, posts, comments };
  // Total: ~300ms
}
```

Each await waits for the previous one to complete.

### Parallel Execution (Faster)

```javascript
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),      // All start simultaneously
    fetchPosts(),
    fetchComments()
  ]);
  return { user, posts, comments };
  // Total: ~100ms (longest operation)
}
```

**Important:** Start promises before awaiting them for parallel execution:

```javascript
async function parallelManual() {
  // Start all promises
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  const commentsPromise = fetchComments();
  
  // Now await them
  const user = await userPromise;
  const posts = await postsPromise;
  const comments = await commentsPromise;
  
  return { user, posts, comments };
}
```

### When to Use Each

**Sequential** - When operations depend on each other:
```javascript
async function sequential() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id); // Needs user.id
  return { user, posts };
}
```

**Parallel** - When operations are independent:
```javascript
async function parallel() {
  const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts()
  ]);
  return { users, products };
}
```

## Advanced Patterns

### Async IIFE

Immediately invoked async function for top-level await alternative:

```javascript
(async () => {
  const data = await fetchData();
  console.log(data);
})();
```

### Async Array Methods

Using async/await with array methods:

```javascript
// Sequential processing
async function processSequential(items) {
  const results = [];
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  return results;
}

// Parallel processing
async function processParallel(items) {
  const promises = items.map(item => processItem(item));
  return await Promise.all(promises);
}

// Parallel with concurrency limit
async function processWithLimit(items, limit) {
  const results = [];
  
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### Retry Logic

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Timeout Pattern

```javascript
function timeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

async function fetchWithTimeout(url) {
  try {
    const response = await timeout(fetch(url), 5000);
    return await response.json();
  } catch (error) {
    console.error('Request timed out or failed:', error);
    throw error;
  }
}
```

## Performance Implications

### Microtask Queue Overhead

Each `await` schedules a microtask:

```javascript
async function many() {
  await 1;
  await 2;
  await 3;
  await 4;
  await 5;
}
```

This creates 5 microtasks. For performance-critical code, consider if all awaits are necessary.

### Return Await

```javascript
// Unnecessary await
async function getData() {
  return await fetch('/api/data');
}

// Better (unless you need try/catch)
async function getData() {
  return fetch('/api/data');
}
```

**Exception:** Use `return await` inside try/catch:

```javascript
async function getData() {
  try {
    return await fetch('/api/data'); // Needed for catch to work
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

### Stack Traces

Async stack traces can be harder to debug:

```javascript
async function a() {
  await b();
}

async function b() {
  await c();
}

async function c() {
  throw new Error('Error in c');
}

a().catch(error => console.error(error.stack));
```

Modern engines preserve async stack traces, but they can be longer and less intuitive than synchronous traces.

## Common Pitfalls

### 1. Forgetting to Await

```javascript
async function wrong() {
  const data = fetchData(); // Missing await!
  console.log(data); // Promise, not the data
}

async function correct() {
  const data = await fetchData();
  console.log(data); // Actual data
}
```

### 2. Await in Loops (Sequential When You Want Parallel)

```javascript
// BAD: Sequential (slow)
async function processItems(items) {
  for (const item of items) {
    await processItem(item); // Waits for each
  }
}

// GOOD: Parallel (fast)
async function processItems(items) {
  await Promise.all(items.map(item => processItem(item)));
}
```

### 3. Not Handling Rejections

```javascript
// BAD: Unhandled rejection
async function loadData() {
  const data = await fetch('/api/data');
  return data.json();
}

loadData(); // No .catch()

// GOOD: Handle rejections
loadData().catch(error => console.error(error));

// Or with try/catch
async function loadData() {
  try {
    const data = await fetch('/api/data');
    return data.json();
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}
```

### 4. Mixing Async/Await with .then()

```javascript
// Inconsistent and confusing
async function mixed() {
  const user = await fetchUser();
  return fetchPosts(user.id).then(posts => {
    return { user, posts };
  });
}

// Better: Stick with async/await
async function consistent() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  return { user, posts };
}
```

## Async/Await Best Practices

### 1. Always Handle Errors

```javascript
async function safeOperation() {
  try {
    return await riskyOperation();
  } catch (error) {
    console.error('Operation failed:', error);
    return defaultValue;
  }
}
```

### 2. Use Promise.all for Independent Operations

```javascript
async function loadPage() {
  const [user, settings, notifications] = await Promise.all([
    fetchUser(),
    fetchSettings(),
    fetchNotifications()
  ]);
  return { user, settings, notifications };
}
```

### 3. Avoid Unnecessary Awaits

```javascript
// Unnecessary
async function getData() {
  const result = await expensiveOperation();
  return result;
}

// Better (unless you need try/catch)
async function getData() {
  return expensiveOperation();
}
```

### 4. Use Async IIFE for Top-Level Await Alternative

```javascript
(async () => {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
})();
```

## Key Takeaways

### How Async/Await Works
- Async functions always return Promises
- Await pauses function execution and schedules continuation to microtask queue
- Built on top of Promises and conceptually similar to generators
- Each await point creates a microtask

### Execution Model
- Function executes until first await
- Pauses and returns control to caller
- Resumes when Promise settles
- Execution context is recreated after each await

### Error Handling
- Try/catch works naturally with async/await
- Errors propagate up through async calls
- Unhandled rejections occur if not caught
- Always handle or propagate errors

### Performance
- Sequential awaits are slower than parallel Promise.all
- Each await adds microtask overhead
- Unnecessary awaits impact performance
- Consider parallelization for independent operations

### Best Practices
- Handle all errors
- Use Promise.all for parallel operations
- Avoid mixing .then() with async/await
- Be mindful of sequential vs parallel execution
- Use async/await for cleaner, more readable code

---

*Async/await makes asynchronous code look synchronous, but understanding its Promise-based foundation is crucial for effective use.*