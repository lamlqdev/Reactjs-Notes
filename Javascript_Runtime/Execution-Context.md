# JavaScript Execution Contexts - Deep Dive

## Overview

Whenever we load a script or invoke a function, a new **execution context** is created and pushed onto the call stack (which is actually just an execution context stack).

An execution context essentially defines the environment in which our code is executed. It contains many internal components that the engine uses to keep track of the execution flow of that piece of code.

Execution contexts use **environment records** to keep track and maintain the identifier bindings that have been created for variable declarations, function declarations, and all the values within that context.

## Execution Context Phases

Every execution context goes through two phases:

1. **Creation Phase**: Memory space is set up for variable declarations, function declarations, and so on within that context
2. **Execution Phase**: The execution context is on the call stack and the code is actually executed

## Global Execution Context Components

The global execution context has many components, but the key ones are:

- **Realm**
- **Lexical Environment**
- **Variable Environment**

### Realm

The realm points to a **realm record**. A realm is essentially an isolated environment in which our code runs.

In browsers, a new realm is created whenever we:

- Open a new tab
- Refresh a page
- Create service workers
- Create web workers
- Create iframes

A realm consists of several components:

#### 1. Intrinsics

The intrinsics provide all the standard built-in objects and functions that are essentially foundational for executing JavaScript, such as:

- `Array`
- `Function`
- `SyntaxError`
- etc.

#### 2. Global Object

The global object contains several types of properties:

**Specification-defined properties**: Expose the intrinsics (Array, Function, all the JavaScript built-ins) on the global object.

**Host-defined properties**: In a browser, these are things like:

- `fetch`
- `setTimeout`
- `document`

**User-defined properties**: As developers, we can:

- Explicitly add properties to the global object
- Implicitly add them by:
  - Declaring a function in the global scope
  - Using the `var` keyword in the global scope

These are now available and ready to use throughout the entire script.

#### 3. Global Environment Record

The global environment record manages the identifier bindings within the global context. These values are accessible throughout our entire script.

The global environment record contains:

**Object Record**: A direct reference to the global object. This is used by:

- Variables with the `var` keyword
- Function declarations on the global scope

**Declarative Record**: Stores all identifier bindings that aren't variables with the `var` keyword or function declarations (everything except those two).

**This Binding**: Contains the value of the `this` keyword. In the case of the global environment record, this is the global `this` value, which in most cases points to the global object.

**Outer Environment**: A property that points to the outer environment. In the case of the global environment record, this is `null`. This property is very important for scope chain resolution.

### Lexical Environment

The lexical environment points to the environment record that contains the bindings for everything **except** variables with the `var` keyword. In the global context, this is the global environment record.

### Variable Environment

The variable environment points to the environment record that stores the bindings for variables declared with the `var` keyword. In the global context, this is also the global environment record.

## Script Execution Example

Let's walk through what happens when we run this script:

```javascript
const firstName = "Lydia";
let lastName = "Hi";
function greet(name) {
  const fullName = name + " " + lastName;
  return "Hello " + fullName;
}

greet("Lydia");
```

### Creation Phase

**Line 1**: `const firstName`

- Uses the execution context's lexical environment
- Points to the global environment record
- Uses the declarative record to handle the identifier binding
- Variables created with `const`, `let`, and classes are **uninitialized**
  - Memory space is set up (they're hoisted)
  - But they don't have a value yet
  - They're only initialized during the execution phase

**Line 2**: `let lastName`

- Uses the lexical environment
- Points to the global environment record
- Uses the declarative record to store this binding
- Similar to `const`, it is uninitialized until the execution phase

**Line 3**: `function greet`

- Function declarations are managed by the object record
- In contrast to the previous variables, **functions are initialized during the creation phase**
- A new function object is created for `greet`
- Function objects contain many properties, including:
  - **Environment**: Points to the environment record in which the function was declared (in this case, the global environment record)
  - **Call method**: Gets called whenever we invoke the function

### Execution Phase

The global execution context is added to the call stack and executed:

**Line 1**: `const firstName = "Lydia"`

- The variable gets initialized with the value of the string "Lydia"

**Line 2**: `let lastName = "Hi"`

- Gets initialized with the string "Hi"

**Line 3**: `function greet`

- Already initialized in memory, so nothing gets done here

**Line 9**: `greet("Lydia")`

- The call method on the function object is called
- This creates a new **function execution context**
- This execution context goes through the same two phases: creation and execution

## Function Execution Context

### Creation Phase 

The lexical environment contains a brand new **function environment record** which:

- Manages the identifier bindings for the parameters, variables, and function declarations within this function
- Has an **outer environment** property that points to the environment of the function object (in this case, the global environment record)

**Function parameters** (in this case, `name` in `greet`):

- Immediately added to the function environment record
- Immediately initialized with the value that we pass (the string "Lydia")

**Line 4**: `const fullName`

- Added to the function environment record
- Uninitialized until the execution phase

### Execution Phase

The function execution context is added onto the call stack:

**Line 4**: `const fullName = name + " " + lastName`

- Uses the `name` parameter value
- Also uses the `lastName` variable
- The function environment record itself doesn't have a binding for `lastName`
- Instead, it uses the **outer environment property** on the environment record to search through the chain of environments (the **scope chain**) to see if the outer environment has the binding
- In this case, the global environment record has `lastName` which is "Hi"
- So `fullName` equals the string "Lydia Hi"

**Line 5**: `return "Hello " + fullName`

- Function returns "Hello Lydia Hi"
- As it returns, the function execution context is removed from the call stack
- The topmost execution context is the currently running execution context, which is the global one

Since there's nothing else to do in our script, the global execution context is removed from the call stack, which is the end of our script.

## Hoisting

Hoisting happens during the **creation phase** of an execution context.

### Variables with `const`, `let`, Classes, and Imports

- Are hoisted (memory is allocated for them)
- Remain **uninitialized**
- Only initialized during the execution phase when their actual declaration is reached in the code
- Trying to access these values before they're declared results in a `ReferenceError`
- The period from the start of the block until they're declared is called the **Temporal Dead Zone**
- In this zone, trying to access any of these values results in a `ReferenceError`

### Variables with `var`

During the creation phase:

- Are hoisted and initialized with the value `undefined`
- Get redefined with their actual values during the execution phase whenever their declaration is reached

### Functions (including async, generator functions)

- Already initialized during the creation phase with the actual function object
- This means we can invoke a function before its declaration because the function object is already in memory

## Scope Chain

The scope chain refers to the mechanism made available through the **outer environment property** on environment records.

Whenever we try to access a property that is not available in the current context's environment record, the engine will traverse the chain of environments (the scope chain) until it finds the binding.

## Closures

Closures in JavaScript are formed whenever an inner function keeps a reference to the outer function's environment record. This is made possible through the function object's **environment property**.

### Example

```javascript
function getFullName(name) {
  const lastName = "Hi";
  
  function inner() {
    return name + " " + lastName;
  }
  
  return inner; // Returns the function object, not the value
}

const fn = getFullName("Lydia");
```

When we invoke `getFullName`:

1. A new function execution context is created
2. It has a brand new function environment record
3. This function environment record's **outer environment property** points to the environment property on the function object
4. In this case, that's the outer function's environment record
5. Within `inner`, we still have access to the `lastName` variable
6. It'll traverse the scope chain via the outer environment property pointing to the outer function's environment record, which contains a binding for `lastName`

---

*This document covers execution contexts, environment records, hoisting, scope chain, and closures from an implementation perspective.*
