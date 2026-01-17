# JavaScript Iterators & Generators - Deep Dive

## Overview

Iterators and generators are fundamental to understanding modern JavaScript's approach to iteration and lazy evaluation. They power features like `for...of` loops, spread operators, destructuring, and async iteration.

This document explores the internal mechanics of iterators and generators, and how they enable powerful patterns in JavaScript.

## The Iteration Protocol

JavaScript defines two protocols that work together to enable iteration:

1. **Iterable Protocol**: Defines how an object can be iterated
2. **Iterator Protocol**: Defines the standard way to produce a sequence of values

### Iterable Protocol

An object is **iterable** if it implements the `@@iterator` method, accessible via `Symbol.iterator`.

```javascript
const iterableObject = {
  [Symbol.iterator]() {
    // Must return an iterator
  }
};
```

**Built-in iterables:**
- Arrays
- Strings
- Maps
- Sets
- TypedArrays
- Arguments object
- NodeList

### Iterator Protocol

An object is an **iterator** if it implements a `next()` method that returns an object with:
- `value`: The next value in the sequence
- `done`: Boolean indicating if the sequence is complete

```javascript
const iterator = {
  next() {
    return {
      value: someValue,
      done: false // or true when finished
    };
  }
};
```

## How Iteration Works

### The for...of Loop

When you use `for...of`, JavaScript performs these steps:

```javascript
const arr = [1, 2, 3];

for (const value of arr) {
  console.log(value);
}
```

**What happens behind the scenes:**

1. **Get the iterator**: Call `arr[Symbol.iterator]()`
2. **Call next() repeatedly**: Until `done` is `true`
3. **Extract values**: Get the `value` from each result
4. **Handle completion**: Stop when `done: true`

**Manual equivalent:**

```javascript
const arr = [1, 2, 3];

// Step 1: Get the iterator
const iterator = arr[Symbol.iterator]();

// Step 2-4: Iterate manually
let result = iterator.next();
while (!result.done) {
  console.log(result.value); // Extract value
  result = iterator.next();  // Get next
}
```

### Creating a Custom Iterable

```javascript
const range = {
  from: 1,
  to: 5,
  
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    
    // Return an iterator object
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

**Execution flow:**

**First iteration:**
1. `for...of` calls `range[Symbol.iterator]()`
2. Returns iterator object with `current = 1`, `last = 5`
3. Calls `iterator.next()`
4. `current (1) <= last (5)`: true
5. Returns `{ value: 1, done: false }`
6. `current` incremented to 2
7. Logs: 1

**Second iteration:**
1. Calls `iterator.next()` again
2. `current (2) <= last (5)`: true
3. Returns `{ value: 2, done: false }`
4. `current` incremented to 3
5. Logs: 2

**...continues until:**

**Final iteration:**
1. Calls `iterator.next()`
2. `current (6) <= last (5)`: false
3. Returns `{ done: true }`
4. Loop terminates

### Iterator Object as Iterable

An iterator can also be made iterable by returning itself:

```javascript
const range = {
  from: 1,
  to: 5,
  
  [Symbol.iterator]() {
    this.current = this.from;
    return this; // Return itself
  },
  
  next() {
    if (this.current <= this.to) {
      return { value: this.current++, done: false };
    } else {
      return { done: true };
    }
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

**Note:** This approach has a limitation - you can only iterate once at a time.

## Generators

Generators are a special type of function that can pause execution and resume later. They provide an easier way to create iterators.

### Generator Function Basics

A generator function is declared with `function*` (asterisk):

```javascript
function* generateSequence() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = generateSequence();

console.log(generator.next()); // { value: 1, done: false }
console.log(generator.next()); // { value: 2, done: false }
console.log(generator.next()); // { value: 3, done: false }
console.log(generator.next()); // { value: undefined, done: true }
```

### What Happens When You Call a Generator Function

**Critical understanding:** Calling a generator function **does not execute its code**. Instead, it returns a generator object.

```javascript
function* gen() {
  console.log('Start');
  yield 1;
  console.log('Middle');
  yield 2;
  console.log('End');
}

const generator = gen(); // Nothing logged yet!

generator.next(); // Logs: "Start", returns { value: 1, done: false }
generator.next(); // Logs: "Middle", returns { value: 2, done: false }
generator.next(); // Logs: "End", returns { value: undefined, done: true }
```

**Execution flow:**

**Step 1:** `const generator = gen()`
- Generator function is called
- No code inside executes
- Returns a generator object
- Generator is in **suspended state** at the start

**Step 2:** First `generator.next()`
- Execution begins
- Runs until first `yield`
- Logs: "Start"
- Returns `{ value: 1, done: false }`
- Generator **suspends** at the `yield 1` line

**Step 3:** Second `generator.next()`
- Execution **resumes** from where it paused
- Runs until next `yield`
- Logs: "Middle"
- Returns `{ value: 2, done: false }`
- Generator **suspends** at the `yield 2` line

**Step 4:** Third `generator.next()`
- Execution resumes
- No more `yield` statements
- Logs: "End"
- Function completes
- Returns `{ value: undefined, done: true }`
- Generator is now in **completed state**

### Generator Objects are Iterators

Generator objects implement the iterator protocol:

```javascript
function* generateSequence() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = generateSequence();

// Generator objects have a next() method
console.log(typeof generator.next); // "function"

// Can be used with for...of
for (const value of generateSequence()) {
  console.log(value); // 1, 2, 3
}

// Can be spread
const arr = [...generateSequence()]; // [1, 2, 3]
```

### Generators are Also Iterable

Generator objects implement both protocols:

```javascript
function* gen() {
  yield 1;
}

const generator = gen();

// Has Symbol.iterator
console.log(typeof generator[Symbol.iterator]); // "function"

// Symbol.iterator returns itself
console.log(generator[Symbol.iterator]() === generator); // true
```

### Using Generators to Create Iterables

Generators make creating iterables much simpler:

```javascript
// Without generator (verbose)
const rangeObj = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
};

// With generator (concise)
const range = {
  from: 1,
  to: 5,
  
  *[Symbol.iterator]() {
    for (let value = this.from; value <= this.to; value++) {
      yield value;
    }
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

## Yield Deep Dive

### Yield as a Two-Way Street

`yield` not only returns a value but can also **receive** a value from the outside:

```javascript
function* gen() {
  const result1 = yield 1;
  console.log('Received:', result1);
  
  const result2 = yield 2;
  console.log('Received:', result2);
}

const generator = gen();

console.log(generator.next());      // { value: 1, done: false }
console.log(generator.next('A'));   // Logs: "Received: A"
                                     // { value: 2, done: false }
console.log(generator.next('B'));   // Logs: "Received: B"
                                     // { value: undefined, done: true }
```

**Execution flow:**

**Step 1:** `generator.next()`
- Starts execution
- Reaches `yield 1`
- Returns `{ value: 1, done: false }`
- **Pauses** at the `yield 1` expression
- `result1` is not assigned yet

**Step 2:** `generator.next('A')`
- Resumes execution
- The value `'A'` **replaces** the `yield 1` expression
- `result1 = 'A'`
- Logs: "Received: A"
- Reaches `yield 2`
- Returns `{ value: 2, done: false }`
- Pauses

**Step 3:** `generator.next('B')`
- Resumes execution
- The value `'B'` replaces the `yield 2` expression
- `result2 = 'B'`
- Logs: "Received: B"
- Function completes
- Returns `{ value: undefined, done: true }`

**Important:** The **first** `next()` call cannot pass a value because there's no `yield` waiting for it yet.

### Yield*

`yield*` delegates to another iterable or generator:

```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield 0;
  yield* gen1(); // Delegate to gen1
  yield 3;
}

console.log([...gen2()]); // [0, 1, 2, 3]
```

**What `yield*` does:**

```javascript
function* gen2() {
  yield 0;
  
  // yield* gen1() is equivalent to:
  for (const value of gen1()) {
    yield value;
  }
  
  yield 3;
}
```

**Execution flow:**

1. Yields 0
2. `yield* gen1()` starts
3. Gets iterator from `gen1()`
4. Yields 1 (from gen1)
5. Yields 2 (from gen1)
6. gen1 completes
7. Yields 3
8. Completes

### Return in Generators

Generators can use `return` to finish early:

```javascript
function* gen() {
  yield 1;
  return 'Done';
  yield 2; // Never reached
}

const generator = gen();

console.log(generator.next()); // { value: 1, done: false }
console.log(generator.next()); // { value: 'Done', done: true }
console.log(generator.next()); // { value: undefined, done: true }
```

**Important:** `for...of` ignores the returned value:

```javascript
function* gen() {
  yield 1;
  yield 2;
  return 3;
}

for (const value of gen()) {
  console.log(value); // 1, 2 (3 is not logged)
}

// But spread includes the return value in older implementations
// Modern engines also ignore it
const arr = [...gen()]; // [1, 2]
```

## Generator Methods

Generator objects have additional methods beyond `next()`:

### throw()

Throws an error at the current `yield` position:

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } catch (e) {
    console.log('Caught:', e.message);
  }
  yield 3;
}

const generator = gen();

console.log(generator.next());         // { value: 1, done: false }
console.log(generator.throw(new Error('Oops'))); // Logs: "Caught: Oops"
                                                  // { value: 3, done: false }
console.log(generator.next());         // { value: undefined, done: true }
```

**Execution flow:**

1. First `next()`: yields 1, pauses at `yield 1`
2. `throw()`: resumes, error thrown at `yield 1` position, caught, continues to `yield 3`
3. Second `next()`: completes

### return()

Forces the generator to finish:

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = gen();

console.log(generator.next());      // { value: 1, done: false }
console.log(generator.return('X')); // { value: 'X', done: true }
console.log(generator.next());      // { value: undefined, done: true }
```

**With finally:**

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log('Cleanup');
    yield 3; // Can still yield in finally
  }
}

const generator = gen();

console.log(generator.next());      // { value: 1, done: false }
console.log(generator.return('X')); // Logs: "Cleanup"
                                     // { value: 3, done: false }
console.log(generator.next());      // { value: 'X', done: true }
```

## Practical Use Cases

### Infinite Sequences

Generators can represent infinite sequences without consuming infinite memory:

```javascript
function* infiniteSequence() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

const gen = infiniteSequence();

console.log(gen.next().value); // 0
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
// Can continue forever, only generates values on demand
```

### ID Generation

```javascript
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const generateId = idGenerator();

console.log(generateId.next().value); // 1
console.log(generateId.next().value); // 2
console.log(generateId.next().value); // 3
```

### Lazy Evaluation

Generators enable lazy evaluation - values are computed only when needed:

```javascript
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// Take only what you need
function* take(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ >= n) return;
    yield value;
  }
}

const first10Fibs = [...take(10, fibonacci())];
console.log(first10Fibs); // [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

### Data Pipeline

Generators can be chained to create data processing pipelines:

```javascript
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
}

function* filter(iterable, predicate) {
  for (const value of iterable) {
    if (predicate(value)) {
      yield value;
    }
  }
}

function* map(iterable, mapper) {
  for (const value of iterable) {
    yield mapper(value);
  }
}

// Create pipeline
const pipeline = map(
  filter(numbers(), x => x % 2 === 0),
  x => x * 2
);

console.log([...pipeline]); // [4, 8]
```

**Execution is lazy:**
- Nothing executes until we consume the pipeline
- Each stage processes one item at a time
- Memory efficient for large datasets

### Tree Traversal

```javascript
class TreeNode {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
  
  *[Symbol.iterator]() {
    yield this.value;
    if (this.left) yield* this.left;
    if (this.right) yield* this.right;
  }
}

const tree = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, new TreeNode(6), new TreeNode(7))
);

console.log([...tree]); // [1, 2, 4, 5, 3, 6, 7]
```

## Generator Composition

Generators can be composed to build complex iterators from simple ones:

```javascript
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

function* repeat(iterable, times) {
  for (let i = 0; i < times; i++) {
    yield* iterable;
  }
}

function* chain(...iterables) {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

// Compose generators
const result = [...chain(
  range(1, 3),
  repeat(range(10, 12), 2)
)];

console.log(result); // [1, 2, 3, 10, 11, 12, 10, 11, 12]
```

## Async Iteration

JavaScript also supports async iterators and async generators for asynchronous data sources.

### Async Iterables

An async iterable implements `Symbol.asyncIterator`:

```javascript
const asyncIterable = {
  async *[Symbol.asyncIterator]() {
    yield 1;
    yield 2;
    yield 3;
  }
};

// Use with for await...of
(async () => {
  for await (const value of asyncIterable) {
    console.log(value); // 1, 2, 3
  }
})();
```

### Async Generators

Async generators combine generators with promises:

```javascript
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

(async () => {
  for await (const value of asyncGenerator()) {
    console.log(value); // 1, 2, 3
  }
})();
```

### Practical Example: Paginated API

```javascript
async function* fetchPages(url) {
  let page = 1;
  
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    
    if (data.items.length === 0) break;
    
    yield* data.items;
    page++;
  }
}

// Usage
(async () => {
  for await (const item of fetchPages('/api/items')) {
    console.log(item);
    // Process items one by one as pages are fetched
  }
})();
```

## Performance Considerations

### Memory Efficiency

Generators are memory-efficient because they produce values on demand:

```javascript
// Array - all values in memory at once
function rangeArray(n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(i);
  }
  return result;
}

// Generator - one value at a time
function* rangeGenerator(n) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

// For n = 1,000,000:
// rangeArray: ~8MB of memory
// rangeGenerator: negligible memory
```

### Performance Trade-offs

**Generators are slower than arrays for:**
- Random access (no indexing)
- Multiple iterations (need to regenerate)
- Small datasets (overhead not worth it)

**Generators are better for:**
- Large or infinite sequences
- Single-pass iteration
- Lazy evaluation scenarios
- Memory-constrained environments

## Common Patterns and Idioms

### Generator-based Iterator

```javascript
class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
  
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  }
}

const range = new Range(1, 5);
console.log([...range]); // [1, 2, 3, 4, 5]
```

### Stateful Iteration

```javascript
function* statefulGenerator() {
  let state = { count: 0 };
  
  while (true) {
    const input = yield state.count;
    
    if (input === 'reset') {
      state.count = 0;
    } else if (typeof input === 'number') {
      state.count += input;
    } else {
      state.count++;
    }
  }
}

const gen = statefulGenerator();

console.log(gen.next());        // { value: 0, done: false }
console.log(gen.next(5));       // { value: 5, done: false }
console.log(gen.next());        // { value: 6, done: false }
console.log(gen.next('reset')); // { value: 0, done: false }
```

## Key Takeaways

### Iterators
- Implement the `next()` method returning `{ value, done }`
- Enable `for...of`, spread, destructuring
- Can be created manually or via generators

### Generators
- Declared with `function*`
- Use `yield` to pause and resume execution
- Return generator objects that are both iterators and iterables
- Enable lazy evaluation and infinite sequences

### Execution Model
- Calling a generator function returns a generator object (doesn't execute code)
- Each `next()` call resumes execution until the next `yield`
- Generator state is preserved between `next()` calls
- `yield` can both send and receive values

### Practical Benefits
- Memory efficiency for large datasets
- Cleaner iterator implementation
- Powerful composition patterns
- Natural expression of sequential algorithms

### Advanced Features
- `yield*` for delegation
- `throw()` and `return()` methods
- Async iteration with `Symbol.asyncIterator`
- Async generators for asynchronous data sources

---

*Generators provide a powerful way to work with sequences and enable elegant solutions to complex iteration problems.*