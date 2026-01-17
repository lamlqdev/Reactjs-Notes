# This Binding & Call/Apply/Bind - Deep Dive

## Overview

The `this` keyword in JavaScript is one of the most confusing concepts for developers. Its value is determined by **how a function is called**, not where it's defined.

Understanding `this` requires knowledge of:
- Execution contexts
- Call sites
- Binding rules
- Function invocation patterns

This document explores how `this` is determined and how to control it using `call()`, `apply()`, and `bind()`.

## What is `this`?

`this` is a special identifier keyword that's automatically defined in the scope of every function.

**Key principle:** The value of `this` is determined at **call time** based on how the function is invoked.

```javascript
function identify() {
  return this.name;
}

const person1 = { name: 'Alice' };
const person2 = { name: 'Bob' };

identify.call(person1); // 'Alice'
identify.call(person2); // 'Bob'
```

The same function, called differently, has different `this` values.

## The Four Binding Rules

There are four rules that determine what `this` refers to. They are applied in a specific precedence order.

### 1. Default Binding

**Rule:** When none of the other rules apply, `this` defaults to the global object (in non-strict mode) or `undefined` (in strict mode).

```javascript
function foo() {
  console.log(this);
}

foo(); // Global object (window in browsers, global in Node.js)
```

**In strict mode:**
```javascript
'use strict';

function foo() {
  console.log(this);
}

foo(); // undefined
```

**When default binding applies:**
- Standalone function invocation
- Function called without any prefix

```javascript
function outer() {
  function inner() {
    console.log(this);
  }
  inner(); // Default binding
}

outer(); // Logs global object (or undefined in strict mode)
```

### 2. Implicit Binding

**Rule:** When a function is called as a method of an object, `this` refers to that object.

```javascript
const person = {
  name: 'Alice',
  greet() {
    console.log(this.name);
  }
};

person.greet(); // 'Alice' - this is person
```

**Call site determines binding:**

```javascript
function greet() {
  console.log(this.name);
}

const person1 = {
  name: 'Alice',
  greet: greet
};

const person2 = {
  name: 'Bob',
  greet: greet
};

person1.greet(); // 'Alice'
person2.greet(); // 'Bob'
```

**Multiple levels of object property references:**

Only the **last level** matters:

```javascript
const obj = {
  a: {
    b: {
      c: function() {
        console.log(this);
      }
    }
  }
};

obj.a.b.c(); // this is obj.a.b (the immediate parent)
```

### Implicitly Lost

A common pitfall is losing implicit binding:

```javascript
const person = {
  name: 'Alice',
  greet() {
    console.log(this.name);
  }
};

const greet = person.greet; // Assign to variable
greet(); // undefined (or error in strict mode)
```

**What happened:**
1. `person.greet` is assigned to `greet` variable
2. `greet()` is called as standalone function
3. **Default binding** applies, not implicit
4. `this` is global object (where `name` is undefined)

**Common scenario: Callbacks**

```javascript
const person = {
  name: 'Alice',
  greet() {
    console.log(this.name);
  }
};

setTimeout(person.greet, 1000); // undefined after 1 second
```

**Why:** `setTimeout` calls the function directly, losing the object reference.

**Solutions:**

```javascript
// 1. Wrapper function
setTimeout(() => person.greet(), 1000);

// 2. Bind (covered later)
setTimeout(person.greet.bind(person), 1000);

// 3. Arrow function as method (but has trade-offs)
const person = {
  name: 'Alice',
  greet: () => {
    console.log(this.name); // Won't work as expected!
  }
};
```

### 3. Explicit Binding

**Rule:** You can explicitly set `this` using `call()`, `apply()`, or `bind()`.

#### call()

Syntax: `func.call(thisArg, arg1, arg2, ...)`

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: 'Alice' };

greet.call(person, 'Hello'); // "Hello, Alice"
```

**Execution flow:**

1. `call()` is invoked on the `greet` function
2. First argument (`person`) becomes `this` inside `greet`
3. Remaining arguments (`'Hello'`) are passed to the function
4. Function executes with `this` set to `person`

#### apply()

Syntax: `func.apply(thisArg, [argsArray])`

Same as `call()`, but arguments are passed as an array:

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

greet.apply(person, ['Hello', '!']); // "Hello, Alice!"
```

**Use case for apply():**

```javascript
const numbers = [5, 6, 2, 3, 7];

// Find max using apply
const max = Math.max.apply(null, numbers); // 7

// Modern alternative: spread operator
const max = Math.max(...numbers); // 7
```

#### bind()

Syntax: `func.bind(thisArg, arg1, arg2, ...)`

**Critical difference:** `bind()` doesn't call the function. It **returns a new function** with `this` permanently bound.

```javascript
function greet() {
  console.log(this.name);
}

const person = { name: 'Alice' };

const boundGreet = greet.bind(person);

boundGreet(); // "Alice"
```

**Execution flow:**

1. `bind()` is called on `greet`
2. Creates a **new function** (exotic function object)
3. This new function has an internal `[[BoundThis]]` slot set to `person`
4. When called, always uses `[[BoundThis]]` as `this`

**Partial application:**

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

const sayHello = greet.bind(person, 'Hello');

sayHello('!'); // "Hello, Alice!"
sayHello('?'); // "Hello, Alice?"
```

**Hard binding:**

Once bound, `this` cannot be overridden:

```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1 };
const obj2 = { a: 2 };

const bar = foo.bind(obj1);

bar(); // 1
bar.call(obj2); // Still 1 (bind wins!)
```

### 4. new Binding

**Rule:** When a function is called with `new`, `this` refers to the newly created object.

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person('Alice');
console.log(alice.name); // "Alice"
```

**What `new` does (review):**

1. Creates a new empty object: `{}`
2. Sets object's `[[Prototype]]` to constructor's `prototype`
3. **Binds `this` to the new object**
4. Executes constructor function
5. Returns the new object (unless constructor returns an object)

**Step-by-step execution:**

```javascript
function Person(name) {
  // new creates: const this = {};
  // new sets: Object.setPrototypeOf(this, Person.prototype);
  
  this.name = name;
  
  // new returns: return this;
}

const alice = new Person('Alice');
```

**Overriding new's return:**

```javascript
function Person(name) {
  this.name = name;
  return { different: 'object' }; // Explicitly return object
}

const alice = new Person('Alice');
console.log(alice); // { different: 'object' }
console.log(alice.name); // undefined
```

If constructor returns an object, that object is returned instead of `this`.

## Binding Precedence

When multiple rules could apply, which one wins?

**Precedence order (highest to lowest):**

1. **new binding**
2. **Explicit binding** (call/apply/bind)
3. **Implicit binding**
4. **Default binding**

### new vs Explicit

```javascript
function foo(something) {
  this.a = something;
}

const obj1 = {};

const bar = foo.bind(obj1);
bar(2);
console.log(obj1.a); // 2

const baz = new bar(3);
console.log(obj1.a); // 2 (unchanged)
console.log(baz.a);  // 3 (new wins!)
```

**new wins** over bind.

### Explicit vs Implicit

```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1, foo };
const obj2 = { a: 2 };

obj1.foo(); // 1 (implicit)
obj1.foo.call(obj2); // 2 (explicit wins!)
```

**Explicit wins** over implicit.

### Implicit vs Default

```javascript
const obj = {
  a: 1,
  foo() {
    console.log(this.a);
  }
};

obj.foo(); // 1 (implicit)

const foo = obj.foo;
foo(); // undefined (default, implicit lost)
```

**Implicit wins** over default when call site has object context.

## Arrow Functions

Arrow functions don't have their own `this`. They **lexically** capture `this` from the enclosing scope.

### Lexical this

```javascript
const obj = {
  name: 'Alice',
  greet: function() {
    setTimeout(() => {
      console.log(this.name); // 'Alice'
    }, 1000);
  }
};

obj.greet();
```

**What happens:**

1. `obj.greet()` is called
2. `this` inside `greet` is `obj` (implicit binding)
3. Arrow function captures this `this` value
4. When arrow function executes (after 1 second), it uses captured `this`
5. Logs "Alice"

**Contrast with regular function:**

```javascript
const obj = {
  name: 'Alice',
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // undefined
    }, 1000);
  }
};

obj.greet();
```

Regular function has its own `this` (default binding → global object).

### Arrow Functions Cannot Be Bound

```javascript
const obj1 = { a: 1 };
const obj2 = { a: 2 };

const foo = () => console.log(this.a);

foo.call(obj1); // Ignores obj1
foo.apply(obj2); // Ignores obj2
foo.bind(obj1)(); // Ignores obj1
```

Arrow functions **ignore** explicit binding attempts.

### Common Use Cases

**1. Event handlers:**

```javascript
class Button {
  constructor() {
    this.count = 0;
    this.element = document.querySelector('button');
    
    // Arrow function preserves this
    this.element.addEventListener('click', () => {
      this.count++;
      console.log(this.count);
    });
  }
}
```

**2. Array methods:**

```javascript
const obj = {
  numbers: [1, 2, 3],
  multiplier: 2,
  
  multiply() {
    return this.numbers.map(n => n * this.multiplier);
    // Arrow function uses obj as this
  }
};

console.log(obj.multiply()); // [2, 4, 6]
```

**3. Promises:**

```javascript
class DataFetcher {
  constructor() {
    this.data = null;
  }
  
  async fetch() {
    const response = await fetch('/api/data');
    this.data = await response.json(); // this is DataFetcher instance
    return this.data;
  }
}
```

## Common Patterns and Pitfalls

### 1. Method Extraction

**Problem:**
```javascript
const calculator = {
  value: 0,
  add(n) {
    this.value += n;
    return this;
  }
};

const add = calculator.add;
add(5); // Error: Cannot read property 'value' of undefined
```

**Solutions:**

```javascript
// 1. Bind method
const add = calculator.add.bind(calculator);

// 2. Arrow function wrapper
const add = (n) => calculator.add(n);

// 3. Use class with arrow function property
class Calculator {
  value = 0;
  
  add = (n) => {
    this.value += n;
    return this;
  }
}
```

### 2. Callbacks Losing Context

**Problem:**
```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }
  
  start() {
    setInterval(function() {
      this.seconds++; // this is window/global
      console.log(this.seconds);
    }, 1000);
  }
}
```

**Solutions:**

```javascript
// 1. Arrow function
start() {
  setInterval(() => {
    this.seconds++;
    console.log(this.seconds);
  }, 1000);
}

// 2. Bind
start() {
  setInterval(function() {
    this.seconds++;
    console.log(this.seconds);
  }.bind(this), 1000);
}

// 3. Store this reference
start() {
  const self = this;
  setInterval(function() {
    self.seconds++;
    console.log(self.seconds);
  }, 1000);
}
```

### 3. Nested Functions

**Problem:**
```javascript
const obj = {
  name: 'Alice',
  greet() {
    function inner() {
      console.log(this.name); // undefined
    }
    inner();
  }
};

obj.greet();
```

**Why:** `inner()` is called without object context → default binding.

**Solutions:**

```javascript
// 1. Arrow function
greet() {
  const inner = () => {
    console.log(this.name);
  };
  inner();
}

// 2. Bind
greet() {
  function inner() {
    console.log(this.name);
  }
  inner.bind(this)();
}

// 3. Pass this
greet() {
  function inner(context) {
    console.log(context.name);
  }
  inner(this);
}
```

### 4. Class Methods as Callbacks

**Problem:**
```javascript
class Component {
  constructor() {
    this.state = { count: 0 };
  }
  
  handleClick() {
    this.state.count++;
  }
  
  render() {
    return `<button onclick="handleClick()">Click</button>`;
  }
}

const component = new Component();
// Clicking button: Error - this is undefined
```

**Solutions:**

```javascript
// 1. Bind in constructor
class Component {
  constructor() {
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.state.count++;
  }
}

// 2. Arrow function property
class Component {
  state = { count: 0 };
  
  handleClick = () => {
    this.state.count++;
  }
}

// 3. Arrow function in render
render() {
  return `<button onclick="${() => this.handleClick()}">Click</button>`;
}
```

## Advanced Concepts

### Soft Binding

Create a binding that can be overridden (unlike hard bind):

```javascript
Function.prototype.softBind = function(obj, ...args) {
  const fn = this;
  
  return function(...innerArgs) {
    const context = (!this || this === globalThis) ? obj : this;
    return fn.apply(context, [...args, ...innerArgs]);
  };
};

function foo() {
  console.log(this.name);
}

const obj1 = { name: 'obj1' };
const obj2 = { name: 'obj2' };

const bar = foo.softBind(obj1);

bar(); // "obj1" (soft bound)
bar.call(obj2); // "obj2" (can be overridden)

obj2.bar = bar;
obj2.bar(); // "obj2" (implicit binding works)
```

### this in eval()

```javascript
const obj = { a: 1 };

function foo() {
  eval("console.log(this.a)");
}

foo.call(obj); // 1 (eval inherits this)
```

### this in Event Handlers

In DOM event handlers, `this` is the element that received the event:

```javascript
document.querySelector('button').addEventListener('click', function() {
  console.log(this); // The button element
});

// Arrow function - doesn't work the same
document.querySelector('button').addEventListener('click', () => {
  console.log(this); // Lexical this (probably window)
});
```

### this in Constructors Without new

```javascript
function Person(name) {
  this.name = name;
}

const alice = Person('Alice'); // Forgot new

console.log(alice); // undefined
console.log(window.name); // 'Alice' (in browsers)
```

**Defense:**

```javascript
function Person(name) {
  if (!(this instanceof Person)) {
    return new Person(name);
  }
  this.name = name;
}

const alice = Person('Alice'); // Works even without new
```

## Call, Apply, Bind Internals

### How call() Works

Simplified implementation:

```javascript
Function.prototype.myCall = function(context, ...args) {
  // Handle null/undefined context
  context = context ?? globalThis;
  
  // Create unique property on context
  const uniqueKey = Symbol('fn');
  
  // Assign function to context
  context[uniqueKey] = this;
  
  // Call function (this binding is now context)
  const result = context[uniqueKey](...args);
  
  // Clean up
  delete context[uniqueKey];
  
  return result;
};

// Usage
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: 'Alice' };
greet.myCall(person, 'Hello'); // "Hello, Alice"
```

### How apply() Works

```javascript
Function.prototype.myApply = function(context, argsArray) {
  return this.myCall(context, ...(argsArray || []));
};
```

### How bind() Works

```javascript
Function.prototype.myBind = function(context, ...boundArgs) {
  const fn = this;
  
  return function(...callArgs) {
    return fn.apply(context, [...boundArgs, ...callArgs]);
  };
};

// Usage
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };
const sayHello = greet.myBind(person, 'Hello');

sayHello('!'); // "Hello, Alice!"
```

## Performance Considerations

### bind() Creates New Functions

Every `bind()` call creates a new function object:

```javascript
class Component {
  constructor() {
    this.items = [1, 2, 3];
  }
  
  // BAD: Creates new function every render
  render() {
    return this.items.map(item => 
      <div onClick={this.handleClick.bind(this, item)}>
        {item}
      </div>
    );
  }
  
  // GOOD: Bind once in constructor
  constructor() {
    this.items = [1, 2, 3];
    this.handleClick = this.handleClick.bind(this);
  }
}
```

### Arrow Functions in Classes

```javascript
class Component {
  // Creates property on instance (not prototype)
  handleClick = () => {
    // Memory: Each instance has its own function
  }
  
  // Method on prototype (shared)
  handleClick() {
    // Memory: One function shared by all instances
    // But needs binding
  }
}
```

**Trade-off:** Arrow function properties use more memory but don't need binding.

## Best Practices

### 1. Use Arrow Functions for Lexical this

```javascript
class Component {
  state = { count: 0 };
  
  increment = () => {
    this.state.count++;
  }
}
```

### 2. Bind in Constructor for Performance

```javascript
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    // Can be reused without creating new functions
  }
}
```

### 3. Be Explicit About this

```javascript
// Good: Clear what this refers to
function processUser(user) {
  return user.name.toUpperCase();
}

// Avoid: Relying on this when not needed
function processUser() {
  return this.name.toUpperCase();
}
```

### 4. Use call/apply for Borrowing Methods

```javascript
const arrayLike = { 0: 'a', 1: 'b', length: 2 };

// Borrow Array methods
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr); // ['a', 'b']
```

## Key Takeaways

### this Binding Rules (Precedence)
1. **new binding**: `new Foo()` → `this` is new object
2. **Explicit binding**: `call/apply/bind` → `this` is specified object
3. **Implicit binding**: `obj.foo()` → `this` is `obj`
4. **Default binding**: `foo()` → `this` is global (or undefined in strict mode)

### Arrow Functions
- No own `this`, lexically captured
- Cannot be bound with call/apply/bind
- Cannot be used as constructors
- Ideal for callbacks and preserving context

### Call, Apply, Bind
- **call**: Invoke immediately, args as list
- **apply**: Invoke immediately, args as array
- **bind**: Return new function, permanent binding

### Common Pitfalls
- Method extraction loses context
- Callbacks without binding
- Nested functions create new contexts
- Arrow functions as methods don't work as expected

### Best Practices
- Use arrow functions for lexical this
- Bind once in constructors
- Be explicit when possible
- Understand call site to determine this

---

*Mastering `this` requires understanding the call site and knowing which binding rule applies.*