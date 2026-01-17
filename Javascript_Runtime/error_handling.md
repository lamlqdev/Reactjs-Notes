# Error Handling Deep Dive

## Overview

Error handling is crucial for building robust JavaScript applications. Understanding how errors work internally, how they propagate, and how to handle them effectively is essential for writing reliable code.

This document explores:
- Error object internals
- Error types and inheritance
- Stack traces
- Error propagation mechanisms
- Try/catch performance
- Best practices for error handling

## Error Object Basics

### The Error Constructor

```javascript
const error = new Error('Something went wrong');

console.log(error.message); // 'Something went wrong'
console.log(error.name);    // 'Error'
console.log(error.stack);   // Stack trace (implementation-specific)
```

### Error Object Properties

Every Error object has:

**Standard properties:**
- `message`: Error description string
- `name`: Error type name (default: 'Error')

**Non-standard but widely supported:**
- `stack`: Stack trace showing where error occurred
- `fileName`: File where error was created (Firefox)
- `lineNumber`: Line number where error occurred (Firefox)
- `columnNumber`: Column number (Firefox)

### Creating Errors

```javascript
// Constructor with message
const error1 = new Error('Error message');

// Constructor can be called without new
const error2 = Error('Error message');

// Both create equivalent objects
console.log(error1 instanceof Error); // true
console.log(error2 instanceof Error); // true
```

## Built-in Error Types

JavaScript provides several built-in error types that inherit from Error.

### 1. Error (Base Type)

Generic error, parent of all other error types:

```javascript
throw new Error('Generic error');
```

### 2. SyntaxError

Thrown when parsing invalid JavaScript:

```javascript
try {
  eval('function {'); // Invalid syntax
} catch (e) {
  console.log(e instanceof SyntaxError); // true
  console.log(e.name); // 'SyntaxError'
}
```

**Note:** Syntax errors in regular code (not `eval`) are caught during parsing, before code execution.

### 3. ReferenceError

Thrown when accessing an undefined variable:

```javascript
try {
  console.log(nonExistentVariable);
} catch (e) {
  console.log(e instanceof ReferenceError); // true
  console.log(e.message); // 'nonExistentVariable is not defined'
}
```

### 4. TypeError

Thrown when a value is not of the expected type:

```javascript
try {
  null.f(); // Cannot call method on null
} catch (e) {
  console.log(e instanceof TypeError); // true
  console.log(e.message); // "Cannot read property 'f' of null"
}

try {
  const obj = {};
  obj.method(); // obj.method is undefined
} catch (e) {
  console.log(e instanceof TypeError); // true
  console.log(e.message); // "obj.method is not a function"
}
```

### 5. RangeError

Thrown when a value is not in the allowed range:

```javascript
try {
  new Array(-1); // Array length must be positive
} catch (e) {
  console.log(e instanceof RangeError); // true
}

try {
  (123).toFixed(101); // Precision out of range
} catch (e) {
  console.log(e instanceof RangeError); // true
}
```

### 6. URIError

Thrown by URI handling functions:

```javascript
try {
  decodeURIComponent('%'); // Invalid URI component
} catch (e) {
  console.log(e instanceof URIError); // true
}
```

### 7. EvalError

Historically thrown by `eval()`, rarely used in modern JavaScript:

```javascript
// Rarely encountered in practice
throw new EvalError('Eval error');
```

### Error Type Hierarchy

```
Error (base)
├── SyntaxError
├── ReferenceError
├── TypeError
├── RangeError
├── URIError
└── EvalError
```

All error types inherit from `Error.prototype`.

## Creating Custom Error Types

### Basic Custom Error

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateUser(user) {
  if (!user.name) {
    throw new ValidationError('User must have a name');
  }
  if (!user.email) {
    throw new ValidationError('User must have an email');
  }
}

try {
  validateUser({ name: 'Alice' });
} catch (e) {
  console.log(e instanceof ValidationError); // true
  console.log(e.name); // 'ValidationError'
  console.log(e.message); // 'User must have an email'
}
```

### Custom Error with Additional Properties

```javascript
class HTTPError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'HTTPError';
    this.statusCode = statusCode;
  }
}

class NotFoundError extends HTTPError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  
  if (response.status === 404) {
    throw new NotFoundError(`User ${id} not found`);
  }
  
  if (!response.ok) {
    throw new HTTPError(
      `HTTP Error: ${response.statusText}`,
      response.status
    );
  }
  
  return response.json();
}

try {
  await fetchUser(123);
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log('User not found:', e.message);
  } else if (e instanceof HTTPError) {
    console.log(`HTTP ${e.statusCode}:`, e.message);
  } else {
    console.log('Unexpected error:', e);
  }
}
```

### Preserving Stack Traces

Modern JavaScript automatically captures stack traces, but for older environments:

```javascript
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
    
    // Maintains proper stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
```

## Stack Traces

### Understanding Stack Traces

A stack trace shows the sequence of function calls that led to the error:

```javascript
function a() {
  b();
}

function b() {
  c();
}

function c() {
  throw new Error('Error in c');
}

try {
  a();
} catch (e) {
  console.log(e.stack);
}
```

**Output (example in V8):**
```
Error: Error in c
    at c (file.js:10:9)
    at b (file.js:6:3)
    at a (file.js:2:3)
    at Object.<anonymous> (file.js:14:3)
```

**Reading the stack:**
1. Error occurred in function `c`
2. `c` was called by function `b`
3. `b` was called by function `a`
4. `a` was called at the top level

### Stack Trace Depth

Stack traces are limited in depth (usually around 10-200 frames):

```javascript
// V8 default: 10 stack frames
Error.stackTraceLimit = 50; // Increase limit

function recursiveFunction(n) {
  if (n === 0) {
    throw new Error('Base case');
  }
  recursiveFunction(n - 1);
}

try {
  recursiveFunction(100);
} catch (e) {
  console.log(e.stack); // Will show up to 50 frames
}
```

### Async Stack Traces

Modern engines preserve async stack traces:

```javascript
async function a() {
  await b();
}

async function b() {
  await c();
}

async function c() {
  throw new Error('Async error');
}

a().catch(e => console.log(e.stack));
```

**Output includes async calls:**
```
Error: Async error
    at c (file.js:10:9)
    at async b (file.js:6:3)
    at async a (file.js:2:3)
```

The `async` keyword in the stack trace indicates asynchronous calls.

## Error Propagation

### Synchronous Error Propagation

Errors propagate up the call stack until caught:

```javascript
function level3() {
  throw new Error('Error at level 3');
}

function level2() {
  level3(); // Error propagates from here
}

function level1() {
  try {
    level2(); // Error caught here
  } catch (e) {
    console.log('Caught:', e.message);
  }
}

level1(); // "Caught: Error at level 3"
```

**Execution flow:**

1. `level1()` called
2. Inside `try` block, calls `level2()`
3. `level2()` calls `level3()`
4. `level3()` throws error
5. Error propagates to `level2()` (no catch)
6. Error propagates to `level1()` (has catch)
7. Catch block executes
8. Program continues after try/catch

### If No Catch Exists

```javascript
function throwError() {
  throw new Error('Uncaught error');
}

throwError(); // Program terminates with unhandled error
console.log('This never executes');
```

**In browsers:** Error logged to console, script stops  
**In Node.js:** Process crashes (unless handled by `process.on('uncaughtException')`)

### Asynchronous Error Propagation

**Promises:**

```javascript
async function level3() {
  throw new Error('Async error');
}

async function level2() {
  await level3();
}

async function level1() {
  try {
    await level2();
  } catch (e) {
    console.log('Caught:', e.message);
  }
}

level1(); // "Caught: Async error"
```

Errors in async functions become rejected promises that propagate through the promise chain.

**Callbacks (don't propagate automatically):**

```javascript
function readFile(callback) {
  fs.readFile('file.txt', (err, data) => {
    if (err) {
      callback(err); // Manual error passing
      return;
    }
    callback(null, data);
  });
}

readFile((err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log(data);
});
```

## Try/Catch/Finally

### Basic Try/Catch

```javascript
try {
  // Code that might throw
  riskyOperation();
} catch (e) {
  // Handle error
  console.error('Error:', e.message);
}
```

### Catching Specific Errors

```javascript
try {
  riskyOperation();
} catch (e) {
  if (e instanceof TypeError) {
    console.log('Type error:', e.message);
  } else if (e instanceof ReferenceError) {
    console.log('Reference error:', e.message);
  } else {
    console.log('Unknown error:', e);
    throw e; // Re-throw if not handled
  }
}
```

### Finally Block

`finally` always executes, whether error was thrown or not:

```javascript
function processFile() {
  const file = openFile();
  
  try {
    processData(file);
    return 'Success';
  } catch (e) {
    console.error('Error processing file:', e);
    return 'Failure';
  } finally {
    file.close(); // Always executes
    console.log('File closed');
  }
}
```

**Execution order:**

```javascript
function test() {
  try {
    console.log('1: Try');
    return 'try value';
  } catch (e) {
    console.log('2: Catch');
    return 'catch value';
  } finally {
    console.log('3: Finally');
  }
}

const result = test();
console.log('4: Result:', result);
```

**Output:**
```
1: Try
3: Finally
4: Result: try value
```

**Finally executes before return!**

### Finally Overrides Return

```javascript
function test() {
  try {
    return 'try';
  } finally {
    return 'finally'; // Overrides try's return
  }
}

console.log(test()); // 'finally'
```

**Best practice:** Avoid return in finally blocks to prevent confusion.

## Error Handling Patterns

### 1. Error Wrapping

Wrap low-level errors in domain-specific errors:

```javascript
class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

async function getUser(id) {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return result[0];
  } catch (e) {
    throw new DatabaseError(`Failed to fetch user ${id}`, e);
  }
}

try {
  await getUser(123);
} catch (e) {
  console.log(e.message); // High-level message
  console.log(e.originalError); // Low-level details
}
```

### 2. Error Recovery

Attempt recovery before propagating:

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      lastError = e;
      if (i < maxRetries - 1) {
        await delay(1000 * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
}
```

### 3. Error Boundaries (React Pattern)

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 4. Result Type Pattern

Avoid throwing errors, return success/failure objects:

```javascript
function divide(a, b) {
  if (b === 0) {
    return { success: false, error: 'Division by zero' };
  }
  return { success: true, value: a / b };
}

const result = divide(10, 2);

if (result.success) {
  console.log('Result:', result.value);
} else {
  console.error('Error:', result.error);
}
```

### 5. Option Type Pattern

Return null/undefined for expected failures:

```javascript
function findUser(id) {
  const user = users.find(u => u.id === id);
  return user ?? null; // Explicit null for "not found"
}

const user = findUser(123);

if (user !== null) {
  console.log(user.name);
} else {
  console.log('User not found');
}
```

## Performance Considerations

### Try/Catch Performance

Try/catch has minimal overhead in modern engines **when no error is thrown**:

```javascript
// Negligible performance impact
function safeOperation() {
  try {
    normalOperation();
  } catch (e) {
    handleError(e);
  }
}
```

**However:** Throwing and catching errors is expensive:

```javascript
// SLOW: Using exceptions for control flow
function findUser(id) {
  try {
    return users[id];
  } catch (e) {
    return null;
  }
}

// FASTER: Use conditional logic
function findUser(id) {
  return users[id] ?? null;
}
```

### Avoid Exceptions for Flow Control

```javascript
// BAD: Using exceptions for validation
function validateAge(age) {
  try {
    if (age < 0) throw new Error('Invalid');
    return true;
  } catch (e) {
    return false;
  }
}

// GOOD: Use return values
function validateAge(age) {
  return age >= 0;
}
```

### Stack Trace Generation is Expensive

Creating Error objects with stack traces has overhead:

```javascript
// Expensive
const error = new Error('Failed');
logger.log(error.stack);

// Cheaper if stack not needed
const error = { message: 'Failed' };
logger.log(error.message);
```

## Error Handling Best Practices

### 1. Be Specific About Errors

```javascript
// BAD: Generic error
if (!user) {
  throw new Error('Error');
}

// GOOD: Descriptive error
if (!user) {
  throw new Error(`User with ID ${userId} not found`);
}
```

### 2. Use Custom Error Types

```javascript
// Create hierarchy of errors
class AppError extends Error {}
class ValidationError extends AppError {}
class AuthenticationError extends AppError {}
class NetworkError extends AppError {}

// Handle specifically
catch (e) {
  if (e instanceof ValidationError) {
    // Show validation errors to user
  } else if (e instanceof NetworkError) {
    // Retry or show offline message
  } else {
    // Log unexpected errors
  }
}
```

### 3. Don't Swallow Errors

```javascript
// BAD: Silent failure
try {
  riskyOperation();
} catch (e) {
  // Nothing - error is lost!
}

// GOOD: Log or handle
try {
  riskyOperation();
} catch (e) {
  console.error('Operation failed:', e);
  // Or re-throw, or handle appropriately
}
```

### 4. Fail Fast

```javascript
// BAD: Continuing with invalid data
function processUser(user) {
  const name = user?.name ?? 'Unknown';
  // Continues with potentially invalid data
}

// GOOD: Validate early
function processUser(user) {
  if (!user || !user.name) {
    throw new ValidationError('Valid user with name required');
  }
  // Now safe to proceed
}
```

### 5. Centralized Error Handling

```javascript
// Express.js example
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof AuthenticationError) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 6. Provide Context in Errors

```javascript
// BAD: No context
throw new Error('Invalid value');

// GOOD: Include context
throw new Error(
  `Invalid value for ${fieldName}: expected ${expected}, got ${actual}`
);
```

### 7. Clean Up Resources

```javascript
async function processFile(filename) {
  const file = await fs.open(filename);
  
  try {
    await processData(file);
  } finally {
    await file.close(); // Always clean up
  }
}
```

## Debugging Errors

### 1. Error Logging

```javascript
function logError(error, context = {}) {
  console.error({
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  });
}

try {
  riskyOperation();
} catch (e) {
  logError(e, { userId: currentUser.id, operation: 'riskyOperation' });
}
```

### 2. Source Maps

For production code (minified/transpiled), use source maps to get meaningful stack traces:

```javascript
// webpack.config.js
module.exports = {
  devtool: 'source-map', // Generates .map files
  // ...
};
```

### 3. Error Monitoring Services

Integrate with services like Sentry, Rollbar, etc.:

```javascript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_DSN',
  beforeSend(event, hint) {
    // Modify event before sending
    return event;
  }
});

// Errors automatically captured
// Or manually:
try {
  riskyOperation();
} catch (e) {
  Sentry.captureException(e);
}
```

## Key Takeaways

### Error Types
- Built-in types: Error, TypeError, ReferenceError, etc.
- Create custom errors extending Error
- Use specific error types for better handling
- Preserve stack traces in custom errors

### Stack Traces
- Show function call sequence leading to error
- Implementation-specific format
- Limited depth (configurable in V8)
- Modern engines preserve async stack traces

### Error Propagation
- Errors propagate up call stack until caught
- Uncaught errors terminate program
- Async errors propagate through promise chain
- Callbacks require manual error passing

### Try/Catch/Finally
- Catch blocks handle errors
- Finally always executes
- Finally can override return values
- Minimal performance overhead when no error thrown

### Best Practices
- Be specific about error messages
- Use custom error types
- Never swallow errors silently
- Fail fast with validation
- Centralize error handling
- Provide context in errors
- Clean up resources in finally

### Performance
- Try/catch is cheap when no error thrown
- Throwing errors is expensive
- Avoid exceptions for control flow
- Stack trace generation has overhead

---

*Effective error handling makes applications more robust, maintainable, and easier to debug.*