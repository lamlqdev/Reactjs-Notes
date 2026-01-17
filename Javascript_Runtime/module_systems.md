# JavaScript Module Systems - Deep Dive

## Overview

JavaScript has evolved from a language with no native module system to supporting two major module systems:
- **ES Modules (ESM)**: Native JavaScript modules (import/export)
- **CommonJS (CJS)**: Node.js module system (require/module.exports)

Understanding how these systems work internally is crucial for modern JavaScript development.

## ES Modules (ESM)

ES Modules are the standardized module system in JavaScript, introduced in ES6 (ES2015).

### Basic Syntax

**Exporting:**
```javascript
// named exports
export const name = 'Alice';
export function greet() {
  console.log('Hello');
}

// default export
export default class User {
  constructor(name) {
    this.name = name;
  }
}
```

**Importing:**
```javascript
// named imports
import { name, greet } from './module.js';

// default import
import User from './module.js';

// combined
import User, { name, greet } from './module.js';

// namespace import
import * as module from './module.js';

// side-effect import
import './module.js';
```

### How ES Modules Load

ES Modules follow a three-phase loading process:

#### Phase 1: Construction (Parsing)

1. **Download the module file**
2. **Parse the module** to find import/export statements
3. **Create Module Record**: Internal data structure containing:
   - Module's code
   - List of imports
   - List of exports
   - Module status (unlinked, linking, linked, evaluating, evaluated)

**Important:** Parsing happens **before** execution. The engine can statically analyze all imports.

```javascript
// The engine knows about these imports before any code runs
import { a } from './moduleA.js';
import { b } from './moduleB.js';

console.log('This runs later');
```

#### Phase 2: Instantiation (Linking)

1. **Create Module Environment Record**: Memory space for module's bindings
2. **Connect imports to exports**: Link imported bindings to their exported counterparts
3. **Allocate memory**: For all exports (but don't initialize yet)

**Key concept:** Imports are **live bindings**, not copies.

```javascript
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js
import { count, increment } from './counter.js';

console.log(count); // 0
increment();
console.log(count); // 1 (live binding!)
```

The `count` in main.js is a **live reference** to the same memory location as in counter.js.

#### Phase 3: Evaluation

1. **Execute module code** top to bottom
2. **Initialize exports** with their actual values
3. **Mark module as evaluated**

**Execution happens only once** per module, even if imported multiple times.

```javascript
// logger.js
console.log('Logger module executed');
export const log = console.log;

// a.js
import { log } from './logger.js';

// b.js
import { log } from './logger.js';

// main.js
import './a.js';
import './b.js';
// Logs "Logger module executed" only ONCE
```

### Module Loading Algorithm

When the browser or Node.js encounters an import:

**Step 1: Module Resolution**
- Determine the absolute URL/path of the module
- Check if module is already in module map (cache)

**Step 2: Fetch (if not cached)**
- Download the module file
- Browser: HTTP request
- Node.js: File system read

**Step 3: Parse**
- Parse module code
- Find all import statements
- Create module record

**Step 4: Load Dependencies (Recursive)**
- For each import, repeat steps 1-3
- Build complete dependency graph

**Step 5: Instantiation**
- Create module environment records
- Link all imports to exports
- Bottom-up (leaves first, then parents)

**Step 6: Evaluation**
- Execute module code
- Bottom-up order (dependencies first)

### Example: Module Loading Walkthrough

```javascript
// File structure:
// main.js
// ├── a.js
// │   └── shared.js
// └── b.js
//     └── shared.js

// shared.js
console.log('Shared module loaded');
export const value = 42;

// a.js
import { value } from './shared.js';
console.log('Module A:', value);

// b.js
import { value } from './shared.js';
console.log('Module B:', value);

// main.js
import './a.js';
import './b.js';
console.log('Main module');
```

**Loading sequence:**

1. Parse main.js → finds imports for a.js and b.js
2. Parse a.js → finds import for shared.js
3. Parse b.js → finds import for shared.js (already in module map)
4. Parse shared.js
5. Instantiate shared.js → allocate memory for `value`
6. Instantiate a.js → link to shared.js exports
7. Instantiate b.js → link to shared.js exports
8. Instantiate main.js
9. **Evaluate shared.js** → logs "Shared module loaded", value = 42
10. **Evaluate a.js** → logs "Module A: 42"
11. **Evaluate b.js** → logs "Module B: 42"
12. **Evaluate main.js** → logs "Main module"

**Output:**
```
Shared module loaded
Module A: 42
Module B: 42
Main module
```

### Static vs Dynamic Imports

**Static imports** (analyzed at parse time):
```javascript
import { value } from './module.js';
```

**Dynamic imports** (resolved at runtime):
```javascript
const module = await import('./module.js');
```

#### Dynamic Import Execution

```javascript
async function loadModule(name) {
  console.log('Before import');
  const module = await import(`./${name}.js`);
  console.log('After import');
  console.log(module.default);
}

console.log('Start');
loadModule('feature');
console.log('End');
```

**Output:**
```
Start
Before import
End
After import
[module content]
```

**Execution flow:**

1. "Start" logged
2. `loadModule` called
3. "Before import" logged
4. `import()` initiates module load - returns Promise
5. Function pauses at `await`
6. Control returns to caller
7. "End" logged
8. Module loads and evaluates
9. Function resumes
10. "After import" logged
11. Module content logged

**Dynamic imports return a Promise** that resolves to the module namespace object:

```javascript
import('./module.js').then(module => {
  console.log(module.default);
  console.log(module.namedExport);
});
```

### Module Namespace Object

When you use `import * as name`, you get a **module namespace object**:

```javascript
// module.js
export const a = 1;
export const b = 2;
export default 3;

// main.js
import * as mod from './module.js';

console.log(mod.a); // 1
console.log(mod.b); // 2
console.log(mod.default); // 3

// Namespace object is frozen
mod.a = 10; // TypeError in strict mode, silently fails otherwise
```

The namespace object is:
- **Frozen**: Cannot add, delete, or modify properties
- **Live**: Values update if the module changes them
- **Special**: Has a null prototype

## CommonJS (CJS)

CommonJS is the module system used in Node.js. It's synchronous and designed for server-side use.

### Basic Syntax

**Exporting:**
```javascript
// Single export
module.exports = function() {
  console.log('Hello');
};

// Multiple exports
module.exports = {
  name: 'Alice',
  greet: function() {
    console.log('Hello');
  }
};

// Using exports shorthand
exports.name = 'Alice';
exports.greet = function() {
  console.log('Hello');
};
```

**Importing:**
```javascript
const module = require('./module.js');
const { name, greet } = require('./module.js');
```

### How CommonJS Works

#### The Module Wrapper

Every CommonJS module is wrapped in a function:

```javascript
// Your code:
const value = 42;
module.exports = value;

// Actual execution:
(function(exports, require, module, __filename, __dirname) {
  const value = 42;
  module.exports = value;
});
```

This wrapper provides:
- `exports`: Shorthand for `module.exports`
- `require`: Function to load modules
- `module`: Object representing current module
- `__filename`: Absolute path to current file
- `__dirname`: Absolute path to current directory

#### Module Object

```javascript
{
  id: '/path/to/module.js',
  path: '/path/to',
  exports: {},  // What gets returned by require()
  parent: null, // Module that required this one
  filename: '/path/to/module.js',
  loaded: false, // Whether module has finished loading
  children: [],  // Modules this one has required
  paths: [...]   // Paths to search for modules
}
```

#### Require Resolution Algorithm

When you call `require('./module')`:

**Step 1: Resolve path**
- If starts with `./` or `../`: Relative path
- If starts with `/`: Absolute path
- Otherwise: Look in node_modules

**Step 2: Check cache**
- Check `require.cache` using resolved path as key
- If cached, return `module.exports` immediately

**Step 3: Create module object**
- If not cached, create new module object
- Add to cache **before** loading (important for circular deps)

**Step 4: Load file**
- Read file from disk
- Wrap in module wrapper function

**Step 5: Execute**
- Call wrapper function with appropriate arguments
- Code executes and populates `module.exports`

**Step 6: Return**
- Return `module.exports`
- Mark module as loaded

### CommonJS Loading Example

```javascript
// a.js
console.log('A: Start');
const b = require('./b.js');
console.log('A: B loaded');
module.exports = { name: 'Module A' };
console.log('A: End');

// b.js
console.log('B: Start');
module.exports = { name: 'Module B' };
console.log('B: End');

// main.js
console.log('Main: Start');
const a = require('./a.js');
console.log('Main: A loaded');
const aAgain = require('./a.js'); // From cache
console.log('Main: A loaded again');
```

**Output:**
```
Main: Start
A: Start
B: Start
B: End
A: B loaded
A: End
Main: A loaded
Main: A loaded again
```

**Execution flow:**

1. main.js starts: "Main: Start"
2. Requires a.js (not in cache)
3. a.js starts: "A: Start"
4. a.js requires b.js (not in cache)
5. b.js starts: "B: Start"
6. b.js exports: module.exports = { name: 'Module B' }
7. b.js ends: "B: End"
8. Back to a.js: "A: B loaded"
9. a.js exports: module.exports = { name: 'Module A' }
10. a.js ends: "A: End"
11. Back to main.js: "Main: A loaded"
12. Requires a.js again: **Found in cache**, no execution
13. "Main: A loaded again"

### exports vs module.exports

```javascript
// These are equivalent:
exports.name = 'Alice';
module.exports.name = 'Alice';

// But this breaks the link:
exports = { name: 'Alice' }; // DON'T DO THIS
// exports is now a new object, but require() returns module.exports

// Correct way:
module.exports = { name: 'Alice' };
```

**Why:** `exports` is just a reference to `module.exports`. Reassigning `exports` breaks that reference.

### Module Caching

```javascript
// counter.js
let count = 0;
module.exports = {
  increment() {
    count++;
  },
  getCount() {
    return count;
  }
};

// a.js
const counter = require('./counter.js');
counter.increment();

// b.js
const counter = require('./counter.js');
console.log(counter.getCount()); // 1 (same instance!)
```

**Key point:** Module code executes only once. All require() calls get the **same object**.

## Circular Dependencies

Both module systems handle circular dependencies, but differently.

### Circular Dependencies in CommonJS

```javascript
// a.js
console.log('A: Start');
exports.done = false;
const b = require('./b.js');
console.log('A: B.done =', b.done);
exports.done = true;
console.log('A: End');

// b.js
console.log('B: Start');
exports.done = false;
const a = require('./a.js');
console.log('B: A.done =', a.done);
exports.done = true;
console.log('B: End');

// main.js
const a = require('./a.js');
console.log('Main: A.done =', a.done);
```

**Output:**
```
A: Start
B: Start
B: A.done = false
B: End
A: B.done = true
A: End
Main: A.done = true
```

**What happens:**

1. main.js requires a.js
2. a.js added to cache with `exports = { done: false }`
3. a.js requires b.js
4. b.js added to cache with `exports = { done: false }`
5. b.js requires a.js
6. a.js **found in cache** (partial exports: `{ done: false }`)
7. b.js gets incomplete a.js exports
8. b.js finishes: `{ done: true }`
9. a.js continues with complete b.js exports
10. a.js finishes: `{ done: true }`

**Critical:** When b.js requires a.js, it gets **partial exports** because a.js hasn't finished executing.

### Circular Dependencies in ES Modules

```javascript
// a.js
import { b } from './b.js';
console.log('A: Start');
export const a = 'A';
console.log('A: b =', b);

// b.js
import { a } from './a.js';
console.log('B: Start');
export const b = 'B';
console.log('B: a =', a);

// main.js
import './a.js';
```

**Output:**
```
B: Start
B: a = undefined
A: Start
A: b = B
```

**What happens:**

1. Parse main.js → imports a.js
2. Parse a.js → imports b.js
3. Parse b.js → imports a.js (circular)
4. Instantiate all modules:
   - Create memory for `a` in a.js (uninitialized)
   - Create memory for `b` in b.js (uninitialized)
   - Link imports
5. Evaluate b.js first (dependency):
   - Logs "B: Start"
   - `export const b = 'B'` → b is initialized
   - Logs "B: a = undefined" (a not initialized yet)
6. Evaluate a.js:
   - Logs "A: Start"
   - `export const a = 'A'` → a is initialized
   - Logs "A: b = B" (b already initialized)

**Key difference:** ES Modules use **live bindings**. The binding exists but the value is `undefined` until the export statement executes.

### Best Practice: Avoid Circular Dependencies

Circular dependencies often indicate design issues. Refactor to remove them:

```javascript
// Instead of:
// a.js imports b.js
// b.js imports a.js

// Refactor to:
// a.js imports shared.js
// b.js imports shared.js
// shared.js exports common functionality
```

## ESM vs CommonJS: Key Differences

### 1. Syntax

```javascript
// CommonJS
const module = require('./module');
module.exports = value;

// ES Modules
import module from './module.js';
export default value;
```

### 2. Loading

**CommonJS:**
- Synchronous
- Runtime loading
- Dynamic (can use in if statements, functions)

**ES Modules:**
- Can be asynchronous
- Static structure (analyzed at parse time)
- Must be at top level (except dynamic import)

### 3. Exports

**CommonJS:**
- Exports are **copies** of values
- `module.exports` is an object

```javascript
// counter.js
let count = 0;
module.exports = {
  count,
  increment() { count++; }
};

// main.js
const counter = require('./counter');
console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 0 (copy, not updated)
```

**ES Modules:**
- Exports are **live bindings**
- Can export primitives, functions, objects

```javascript
// counter.js
export let count = 0;
export function increment() { count++; }

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 (live binding!)
```

### 4. This Binding

**CommonJS:**
- `this` refers to `module.exports`

```javascript
console.log(this === module.exports); // true
```

**ES Modules:**
- `this` is `undefined` at top level

```javascript
console.log(this); // undefined
```

### 5. File Extension

**CommonJS:**
- `.js` extension optional
- `require('./module')` works

**ES Modules:**
- File extension **required** in browsers
- `import from './module.js'` (note .js)
- Node.js: Can omit if using .mjs or package.json type field

## Module Resolution

### Node.js Module Resolution

When you `require('module-name')`:

**Step 1: Core modules**
- Check if it's a built-in module (fs, path, http, etc.)
- If yes, return it

**Step 2: File modules**
- If starts with `./`, `../`, or `/`, treat as file path
- Try exact path
- Try adding `.js`, `.json`, `.node` extensions
- Try `index.js` if it's a directory

**Step 3: node_modules**
- Start from current directory
- Look in `./node_modules/module-name`
- If not found, go up: `../node_modules/module-name`
- Continue up to root
- Check global node_modules

**Step 4: package.json**
- If found directory, check for package.json
- Use "main" field for entry point
- Default to index.js if no main field

### ES Module Resolution (Browser)

Browsers require **absolute or relative URLs**:

```javascript
// Valid
import { value } from './module.js';
import { value } from '../utils/module.js';
import { value } from '/static/module.js';
import { value } from 'https://cdn.example.com/module.js';

// Invalid (bare specifier)
import { value } from 'module-name'; // Error!
```

**Import maps** allow bare specifiers:

```html
<script type="importmap">
{
  "imports": {
    "lodash": "https://cdn.skypack.dev/lodash"
  }
}
</script>

<script type="module">
import _ from 'lodash'; // Now works!
</script>
```

### Node.js ESM Resolution

Node.js supports both CommonJS and ES Modules:

**Determine module type:**
1. Files with `.mjs` extension → ES Module
2. Files with `.cjs` extension → CommonJS
3. Files with `.js`:
   - Check nearest package.json
   - If `"type": "module"` → ES Module
   - Otherwise → CommonJS (default)

**ES Module imports in Node.js:**
```javascript
// Absolute or relative paths
import { value } from './module.js'; // Extension required

// Bare specifiers (node_modules)
import _ from 'lodash';

// Built-in modules
import fs from 'fs';
import { readFile } from 'fs/promises';
```

## Interoperability

### Importing CommonJS from ES Modules

**In Node.js:**
```javascript
// math.cjs (CommonJS)
module.exports = {
  add: (a, b) => a + b
};

// main.mjs (ES Module)
import math from './math.cjs'; // Default import only
console.log(math.add(1, 2));

// Named imports don't work for most CJS modules
// import { add } from './math.cjs'; // Usually fails
```

**Default export:** The entire `module.exports` becomes the default export.

### Importing ES Modules from CommonJS

**Cannot use synchronous require():**
```javascript
// This doesn't work
const module = require('./esm-module.mjs'); // Error!
```

**Must use dynamic import:**
```javascript
// This works (returns a Promise)
(async () => {
  const module = await import('./esm-module.mjs');
  console.log(module.default);
})();
```

## Best Practices

### 1. Use ES Modules for New Code

```javascript
// Prefer this
import { value } from './module.js';
export const value = 42;

// Over this
const { value } = require('./module');
module.exports = { value: 42 };
```

### 2. Always Use File Extensions

```javascript
// Good
import { value } from './module.js';

// Avoid
import { value } from './module'; // May break in browsers
```

### 3. Avoid Default Exports for Libraries

```javascript
// Prefer named exports (better for tree-shaking)
export const funcA = () => {};
export const funcB = () => {};

// Over default exports
export default {
  funcA: () => {},
  funcB: () => {}
};
```

### 4. Keep Module Side Effects Minimal

```javascript
// BAD: Side effect on import
import './module.js'; // Modifies global state

// GOOD: Explicit initialization
import { init } from './module.js';
init();
```

### 5. Use Dynamic Imports for Code Splitting

```javascript
// Static import (loads immediately)
import { heavyFeature } from './heavy.js';

// Dynamic import (loads on demand)
button.addEventListener('click', async () => {
  const { heavyFeature } = await import('./heavy.js');
  heavyFeature();
});
```

## Key Takeaways

### ES Modules
- Static structure, analyzed at parse time
- Three-phase loading: construction, instantiation, evaluation
- Live bindings for exports
- Asynchronous loading supported
- `this` is undefined at top level
- File extensions required

### CommonJS
- Dynamic, runtime loading
- Synchronous by design
- Exports are copies of values
- Module wrapper provides local scope
- Simple caching mechanism
- `this` equals `module.exports`

### Module Loading
- ES Modules load in dependency order (bottom-up)
- CommonJS loads and executes immediately on first require
- Both systems cache modules to prevent re-execution
- Circular dependencies handled but differently

### Interoperability
- Can import CommonJS from ES Modules (default import)
- Cannot synchronously require ES Modules from CommonJS
- Use dynamic import() for loading ES Modules in CommonJS

### Best Practices
- Prefer ES Modules for new projects
- Always use file extensions
- Avoid circular dependencies
- Minimize module side effects
- Use dynamic imports for code splitting

---

*Understanding module systems is essential for organizing code and managing dependencies in modern JavaScript applications.*