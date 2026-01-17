# JavaScript Closures - Deep Dive

## Prerequisites

Before reading this document, you should understand:

- Execution contexts
- Environment records
- How function execution contexts are created when invoking functions
- How function environment records are created

## Quick Recap: Execution Contexts and Environment Records

### Key Concepts to Remember

**Function Execution Context**: A new function execution context gets created whenever we invoke a function, along with a new function environment record.

**Environment Records**: Used to manage the identifier bindings within a certain context (variables, parameters, function declarations, etc.)

**Creation Phase**: During the creation phase of the execution context, memory space is allocated for all these values.

**Execution Phase**: The execution context is pushed onto the call stack and the code is executed.

**After Return**: After returning from a function, the execution context is removed from the call stack and is eventually garbage collected.

### Normal Behavior (Without Closures)

Normally, it is only the function execution context that holds a reference to the function environment record.

When the function execution context has been garbage collected, there are no other references to this environment record, which is a sign for the garbage collector to then also collect that as garbage—it's destroyed.

This means that we **lose access** to these variables, functions, everything within that environment record.

**Example:**

```javascript
function outer() {
  const count = 0;
}
```

This makes sense because if `outer` has finished executing, we no longer have to use this `count` variable anywhere outside of `outer`, so it would just be a waste of memory to keep this around.

## Retaining Environment Records

However, it is possible to **retain a reference** to this function environment record, in which case it does **not** get garbage collected and we still get to use the variables within `outer`.

## Function Objects

The first step to make this happen is to have a **nested function**.

```javascript
function outer() {
  const count = 0;
  
  function inner() {
    // ...
  }
}
```

In this case, a new `inner` function object gets created.

### Function Object's Internal Properties

Function objects contain an internal **environment property**, and this holds a **reference to the environment record in which they are defined**.

In this case, that is the `outer` function environment record.

So: **The inner function object's environment property is a reference to the outer function environment record.**

Now we have a reference between the inner function object and the outer function environment record.

### The Problem

But just having this reference isn't enough because now whenever `outer` finishes executing, there are no other references to the `inner` function object, so this also just gets garbage collected. We cannot reference it from anywhere within our code.

This then again leaves that environment record without any references, so this then also gets garbage collected. We show no mercy.

## Creating Closures

What we need to do is to **retain a reference to the inner function object from outside of the outer function**.

We need something like this where we have a variable (in this case on the global context) that references this function object.

Luckily, this is pretty easy to do because we can do this by:

1. **Returning** this function object from the outer function
2. **Assigning** this value to a variable outside of the outer function

```javascript
function outer() {
  const count = 0;
  
  function inner() {
    return count + 1;
  }
  
  return inner; // Returning the declaration, not invoking it
}

const innerFunc = outer();
```

### What Happens

Now whenever `innerFunc` gets initialized:

1. `outer` gets invoked
2. When `outer` finishes executing, the global `innerFunc` variable still holds a reference to the `inner` function object
3. This `inner` function object in turn still references the `outer` environment record through its environment property

This means that **they will not get garbage collected**.

Even the `outer` environment record gets retained—it does not get destroyed even though the `outer` execution context has been destroyed.

## Definition of a Closure

**This combination of a function object with a retained environment record is called a closure.**

The special thing about closures is that **the environment record is from a function that has already finished executing and the execution context has already been destroyed**.

## Why Closures Are Useful

Now whenever we invoke `innerFunc` (which we can do because it's just invoking the `inner` function object):

1. A new function execution context is created for `inner`
2. As well as a new function environment record

### The Outer Environment Property

Environment records have an internal property called **outer env** (or outer environment), and this holds the value of the environment property of the function object for which the environment record is created.

In this case:

- The `inner` function object's environment property holds a reference to the `outer` environment record
- So also the outer env (or outer environment) property on the `inner` environment record holds a reference to the `outer` environment record

### The Scope Chain

The outer env property essentially creates a linked list or chain—**the scope chain**—of environment records.

Whenever we try to access an identifier binding within a certain context:

1. The engine first tries to find it within the current environment record
2. When it cannot find it in the current one, it checks the environment record that is linked through the outer env property (going down the scope chain)

### Example

```javascript
function outer() {
  let count = 0;
  
  function inner() {
    return ++count; // Incrementing count
  }
  
  return inner;
}

const innerFunc = outer();
innerFunc(); // Can still access count
```

Within `inner` we have an incremented `count` variable, but we're also referencing `count`. There is no binding for `count` within the `inner` environment record, so it uses the environment record that outer env references, which in this case is the retained `outer` environment record.

This does have a binding for `count`, so **because of that closure, we still get to use the count variable even though outer has already finished executing**.

## Summary

A closure is:

- A combination of a function object and a retained environment record through its environment property
- Whenever we invoke this closure, this retained outer environment is part of the scope chain, so we still get to access all the variables from that function that has already finished executing

Closures happen whenever:

1. We have a nested function
2. And then we keep a reference to that inner nested function somewhere outside of that outer function

## Quiz Example

What gets logged when we execute this code?

```javascript
function createCounter() {
  let count = 0;
  
  function increment() {
    return ++count;
  }
  
  return increment;
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // ?
console.log(counter2()); // ?
console.log(counter1()); // ?
```

### Answer: 1, 1, 2

### Explanation

We're working with **two closures**.

**Starting point**: The global execution context has already been pushed onto the call stack and we have:

- Two uninitialized variables: `counter1` and `counter2`
- A function object for the `createCounter` function

**Step 1**: `counter1` gets initialized by invoking `createCounter`

- Creates a new function execution context
- Also with a brand new function environment record
- During execution phase, `count` is initialized with the number `0`
- We return the `increment` function
- `counter1` now holds a reference to this function object
- **First closure created**

**Step 2**: The exact same thing happens for `counter2`

- New function execution context is created
- With a brand new function environment record
- During execution phase, `count` gets initialized with `0`
- We return the `increment` function
- `counter2` also holds a reference to this function object
- **Second closure created**

**Important**: Notice how they both point to a **different environment record** through their environment property.

It's important to remember that **the outer environment record that the closure points to gets created whenever we invoke this outer function**, which we can do multiple times, in which case we create multiple closures.

**Step 3**: Invoke `counter1()` for the first time

- New function execution context is created
- With a brand new function environment record
- Its outer env property is a reference to the **first** `createCounter` environment record
- `count` is now incremented
- **1 gets logged**

**Step 4**: Invoke `counter2()` for the first time

- Same thing happens
- But now outer env references that **second** environment record (which is still at `0`)
- `count` gets incremented
- **1 gets logged**

**Step 5**: Invoke `counter1()` again

- New function execution context is created
- With a new function environment record
- Its outer env property is a reference to that **first** `createCounter` environment record
- This was already at `1`
- `count` is now incremented
- **2 gets logged**

**Result**: 1, 1, 2

## Use Cases

There are many use cases for closures, but they are **excellent to retain state or context between function calls**.

This can really help to:

- Optimize memory
- Reduce the amount of expensive function calls

### Example: Memoization

```javascript
function memoize(expensiveFunc) {
  const cache = {}; // Empty object for now
  
  return function(arg) {
    if (cache[arg]) {
      return cache[arg]; // Return cached result
    }
    
    const result = expensiveFunc(arg);
    cache[arg] = result;
    return result;
  };
}

const memoizedFunc = memoize(expensiveFunction);
```

**How it works**:

- Inside the `memoize` function we've got a `cache` variable (empty object)
- We return a function from the `memoize` function (closure)
- This means we're returning a function object that still holds a reference to the `memoize` environment record through its environment property
- We assign this returned function to a variable on the global context
- We now have a closure

When invoking this returned function:

- New execution context, new environment record
- This environment record uses the `memoize` environment record as its outer env
- Through this we still have access to `cache`
- Within the function we check if the result has already been cached or not
- If yes, we just return the cached result
- Otherwise, we invoke the expensive function

In this case, we use a closure to maintain a centralized cache between function calls.

## Common Pitfalls

It's very possible to **accidentally create a closure over large amounts of data**, stale data, a large scope, and so on.

### Example: Accidental Large Closure

```javascript
function createUserManager() {
  const userData = fetchAllUsers(); // Tens of thousands of users - large object
  
  return {
    retrieve: () => {
      // Not using userData here
    },
    update: () => {
      // Not using userData here
    }
  };
}
```

**The problem**:

- We have a `userData` variable where we fetch all users
- This could be tens of thousands or even more users—a really large object
- From this function we return an object with a `retrieve` and an `update` function
- They're arrow functions, but that doesn't matter—they're still just function objects
- Their environment property is a reference to the `createUserManager` environment record
- This environment record has this large amount of data

**Why it's not great**:

- We don't want to retain that in memory
- Especially not because we're not actually using any of this data in the returned functions
- But because these function objects still hold a reference to the `createUserManager` environment record, it is still in memory

You might want to refactor that.

## Key Takeaway

It's very important to understand how functions interact with the surrounding environment records. This can really help the performance of your applications.

Always check:

- Do I have an accidental closure with large amounts of data?
- Do I have a closure with a large scope?
- Should I refactor?

**Remember**: A closure is really just a function object with a reference to a retained environment property, which is then part of the scope chain whenever we invoke this closure.

---

*Please don't create a closure over large amounts of data.*
