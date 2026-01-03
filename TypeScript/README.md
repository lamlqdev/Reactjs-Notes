# TypeScript Fundamentals

This module covers essential TypeScript concepts including basic types, type narrowing, compiler configuration, generics, and advanced type features.

---

## I. Basic Types

TypeScript provides several basic types that can be used to annotate variables, function parameters, and return values.

### Primitive Types

```typescript
// String
let name: string = "John";
let message: string = `Hello, ${name}!`;

// Number (includes integers and floats)
let age: number = 30;
let price: number = 99.99;

// Boolean
let isActive: boolean = true;
let isCompleted: boolean = false;

// Null and Undefined
let nullValue: null = null;
let undefinedValue: undefined = undefined;
```

### Null vs Undefined

`undefined` and `null` are two distinct types in TypeScript, though they both represent the absence of a value.

**`undefined`** means a variable has been declared but has not yet been assigned a value:

```typescript
let testVar: string | undefined;
console.log(testVar); // shows undefined
console.log(typeof testVar); // shows "undefined"
```

**`null`** is an assignment value. It can be assigned to a variable as a representation of no value:

```typescript
let testVar: string | null = null;
console.log(testVar); // shows null
console.log(typeof testVar); // shows "object" (JavaScript quirk)
```

**Key Differences:**

```typescript
// Type checking
console.log(null === undefined); // false (not the same type)
console.log(null == undefined); // true (loose equality, same "value")
console.log(null === null); // true (both type and value are the same)

// typeof behavior
typeof undefined; // "undefined"
typeof null; // "object" (this is a bug in JavaScript, but kept for compatibility)
```

**When to use:**

- Use `undefined` when a variable hasn't been initialized or a property doesn't exist
- Use `null` when you want to explicitly represent "no value" or "empty"
- In TypeScript with `strictNullChecks`, you must explicitly allow `null` or `undefined` in union types

Reference: [Stack Overflow - null vs undefined](https://stackoverflow.com/questions/5076944/what-is-the-difference-between-null-and-undefined-in-javascript)

### Arrays

```typescript
// Array of numbers
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// Array of mixed types (using union)
let mixed: (string | number)[] = ["hello", 42, "world", 100];
```

### Tuples

Tuples allow you to express an array with a fixed number of elements where each element has a known type.

```typescript
// Tuple with fixed types
let person: [string, number] = ["John", 30];
let coordinates: [number, number] = [10.5, 20.3];

// Tuple with optional elements
let optionalTuple: [string, number?] = ["hello"];
optionalTuple = ["hello", 42];

// Named tuples (TypeScript 4.0+)
let namedTuple: [name: string, age: number] = ["John", 30];
```

### Enums

Enums allow you to define a set of named constants.

```typescript
// Numeric enum
enum Status {
  Pending,
  InProgress,
  Completed,
  Cancelled,
}

let currentStatus: Status = Status.InProgress; // 1

// String enum
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

let move: Direction = Direction.Up; // "UP"

// Const enum (inlined at compile time)
const enum Color {
  Red,
  Green,
  Blue,
}
```

### Any vs Unknown

`unknown` is the **type-safe counterpart of `any`**. The key differences are:

- **Anything is assignable to `unknown`** - just like `any`
- **`unknown` is NOT assignable to anything** except itself and `any` - without a type assertion or control flow based narrowing
- **No operations are permitted on `unknown`** without first asserting or narrowing to a more specific type

**Basic Examples:**

```typescript
let vAny: any = 10; // We can assign anything to any
let vUnknown: unknown = 10; // We can assign anything to unknown just like any

let s1: string = vAny; // Any is assignable to anything
let s2: string = vUnknown; // Invalid! We can't assign vUnknown to any other type (without an explicit assertion)

vAny.method(); // Ok; anything goes with any
vUnknown.method(); // Not ok; we don't know anything about this variable
```

**When to use:**

- **Use `unknown`** when:

  - You want to represent "any value" but require validation before use
  - You're designing APIs that return dynamic data
  - You want to force type checking before operations
  - You want the least-capable type that still allows any assignment

- **Avoid `any`** - it disables type checking entirely, defeating TypeScript's purpose

- **Use `any`** only as a last resort:
  - During gradual migration from JavaScript
  - With legacy code that cannot be properly typed
  - When you absolutely need maximum flexibility and accept the risks

Reference: [Stack Overflow - unknown vs any](https://stackoverflow.com/questions/51439843/unknown-vs-any)

### Never

`never` represents values that never occur. It's used for functions that never return or for impossible types:

```typescript
// Function that never returns
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// Impossible type (empty union)
type Impossible = string & number; // never

// Exhaustive checking
type Status = "pending" | "completed";
function handleStatus(status: Status) {
  switch (status) {
    case "pending":
      return "waiting";
    case "completed":
      return "done";
    default:
      const exhaustive: never = status; // Ensures all cases handled
      return exhaustive;
  }
}
```

### Union and Intersection Types

```typescript
// Union type - value can be one of several types
let id: string | number;
id = "abc123";
id = 12345;

function printId(id: string | number) {
  console.log(`ID: ${id}`);
}

// Intersection type - combines multiple types
interface Person {
  name: string;
  age: number;
}

interface Employee {
  employeeId: string;
  department: string;
}

type EmployeePerson = Person & Employee;

const employee: EmployeePerson = {
  name: "John",
  age: 30,
  employeeId: "E001",
  department: "Engineering",
};
```

### Object Types

```typescript
// Object type annotation
let user: { name: string; age: number; email?: string } = {
  name: "John",
  age: 30,
};

// Optional properties
interface Config {
  apiUrl: string;
  timeout?: number; // Optional
  retries: number;
}

// Readonly properties
interface Point {
  readonly x: number;
  readonly y: number;
}

const point: Point = { x: 10, y: 20 };
// point.x = 30; // Error: Cannot assign to 'x' because it is a read-only property
```

### Type Aliases

```typescript
// Create a new name for a type
type ID = string | number;
type Status = "pending" | "completed" | "cancelled";

function processOrder(id: ID, status: Status) {
  // ...
}

// Complex type alias
type Callback = (error: Error | null, data?: any) => void;
```

### == vs === (Equality Operators)

In JavaScript and TypeScript, `==` and `===` are comparison operators with different behaviors:

**`==` (Loose Equality)** performs type coercion before comparison:

```typescript
console.log(0 == "0"); // true (type coercion)
console.log(null == undefined); // true (special case)
console.log(false == 0); // true (type coercion)
console.log("" == 0); // true (type coercion)
console.log([] == false); // true (type coercion)
```

**`===` (Strict Equality)** compares both value and type without coercion:

```typescript
console.log(0 === "0"); // false (different types)
console.log(null === undefined); // false (different types)
console.log(false === 0); // false (different types)
console.log("" === 0); // false (different types)
console.log([] === false); // false (different types)
```

**Special Cases:**

```typescript
// null and undefined comparison
null == undefined; // true (special JavaScript rule)
null === undefined; // false

// NaN comparison
NaN === NaN; // false (NaN is never equal to itself)
Number.isNaN(NaN); // true (use this to check for NaN)

// Object comparison
{} === {}; // false (different object references)
const obj = {};
obj === obj; // true (same reference)
```

---

## II. Narrowing

Type narrowing is the process of refining types to more specific types than declared. TypeScript uses control flow analysis to narrow types.

### typeof Guards

Use `typeof` operator to check the runtime type of a value and narrow the type accordingly. TypeScript recognizes `typeof` checks and narrows the type in the corresponding branches.

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}
```

### instanceof Guards

Use `instanceof` operator to check if an object is an instance of a specific class. TypeScript narrows the type to that class within the checked branch, allowing access to class-specific properties and methods.

```typescript
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Dog extends Animal {
  breed: string;
  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
}

function move(animal: Animal) {
  if (animal instanceof Dog) {
    // TypeScript knows animal is Dog here
    console.log(`${animal.name} is a ${animal.breed}`);
  }
}
```

### in Operator Guards

Use the `in` operator to check if a property exists on an object. TypeScript narrows the type based on which properties are present, useful for distinguishing between union types with different properties.

```typescript
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(pet: Bird | Fish) {
  if ("fly" in pet) {
    pet.fly(); // TypeScript knows pet is Bird
  } else {
    pet.swim(); // TypeScript knows pet is Fish
  }
}
```

### Discriminated Unions

Use a common literal property (discriminant) to distinguish between union members. By checking the discriminant property, TypeScript can narrow the type to the specific union member, enabling safe access to member-specific properties.

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

### Truthiness Narrowing

Use truthiness checks (like `if`, `&&`, `||`) to narrow types by excluding falsy values (`null`, `undefined`, `0`, `false`, `""`, `NaN`). TypeScript understands that after a truthiness check, the value must be truthy, allowing safe access to properties and methods.

```typescript
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    // strs is string[] here
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    // strs is string here
    console.log(strs);
  }
}
```

### Equality Narrowing

Use equality checks (`===`, `!==`, `==`, `!=`) to narrow types. When comparing two values with `===`, TypeScript narrows both to their common type. This is particularly useful for finding the intersection of union types.

```typescript
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // x and y are both string here
    x.toUpperCase();
    y.toUpperCase();
  }
}
```

### Assertion Functions

Create custom type guards using assertion functions with `asserts` keyword. These functions throw an error if the assertion fails, and TypeScript narrows the type after the function call. Useful for runtime type validation and ensuring type safety.

```typescript
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== "string") {
    throw new Error("Not a string!");
  }
}

function processValue(value: unknown) {
  assertIsString(value);
  // TypeScript knows value is string here
  value.toUpperCase();
}
```

---

## III. TypeScript Compiler and Config

The TypeScript compiler (`tsc`) converts TypeScript code to JavaScript and can be configured via `tsconfig.json`.

### Basic Compilation

```bash
# Compile a single file
tsc app.ts

# Compile with watch mode
tsc app.ts --watch

# Compile all TypeScript files in project
tsc
```

### Common tsconfig.json Options

```json
{
  "compilerOptions": {
    // Target and Module
    "target": "ES2020", // JavaScript version to compile to (ES5, ES2015, ES2020, ESNext, etc.)
    "module": "commonjs", // Module system (commonjs, es2015, esnext, etc.)
    "lib": ["ES2020", "DOM"], // Library files to include

    // Output
    "outDir": "./dist", // Output directory
    "rootDir": "./src", // Root directory of input files

    // Type Checking
    "strict": true, // Enable all strict type checking options

    // Module Resolution
    "moduleResolution": "node", // Module resolution strategy
    "esModuleInterop": true, // Enable ES module interop
    "resolveJsonModule": true // Allow importing JSON files
  },
  "include": ["src/**/*"], // Glob patterns for files to include
  "exclude": ["node_modules", "dist", "**/*.test.ts"] // Glob patterns for files to exclude
}
```

### Important Options Explained

**`target`**: Determines which JavaScript version to compile to. Common values: `ES5`, `ES2020`, `ESNext`.

**`module`**: Specifies the module system. Common values: `commonjs` (Node.js), `es2015`/`esnext` (ES modules).

**`strict`**: Enables all strict type checking options (recommended). Equivalent to enabling:

- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

**`moduleResolution`**: How TypeScript resolves modules. Use `"node"` for Node.js-style resolution.

**`esModuleInterop`**: Allows default imports from CommonJS modules (e.g., `import React from 'react'`).

**`include`**: Glob patterns to include files. Works with `exclude`. Default: all `.ts`, `.tsx`, `.d.ts` files if not specified.

**`exclude`**: Glob patterns to exclude files from `include`.

---

## IV. Generics

Generics allow you to create reusable components that work with multiple types while maintaining type safety.

### Basic Generic Functions

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello"); // Explicit type argument
let output2 = identity("world"); // Type inference

// Generic with multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

let result = pair<string, number>("hello", 42);
```

### Generic Interfaces

```typescript
interface Box<T> {
  contents: T;
}

let stringBox: Box<string> = { contents: "hello" };
let numberBox: Box<number> = { contents: 42 };

// Generic interface with multiple type parameters
interface Pair<T, U> {
  first: T;
  second: U;
}
```

### Mapped Types

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Example usage
interface User {
  name: string;
  age: number;
  email?: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }

type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number; readonly email?: string; }
```

---

## V. Interfaces vs Type Aliases

Both interfaces and type aliases can be used to define object shapes, but they have some differences.

### Interfaces

```typescript
// Interface declaration
interface User {
  name: string;
  age: number;
}

// Extending interfaces
interface Admin extends User {
  permissions: string[];
}

// Merging (declaration merging)
interface Window {
  title: string;
}

interface Window {
  ts: TypeScriptAPI;
}

// The Window interface now has both title and ts properties
```

### Type Alias Examples

```typescript
// Type alias
type User = {
  name: string;
  age: number;
};

// Extending types (using intersection)
type Admin = User & {
  permissions: string[];
};

// Union types (only possible with type aliases)
type ID = string | number;
type Status = "pending" | "completed" | "cancelled";
```

### Key Differences

```typescript
// 1. Declaration merging - only interfaces
interface Animal {
  name: string;
}

interface Animal {
  species: string;
}
// Animal now has both name and species

// 2. Union/Intersection - type aliases are more flexible
type StringOrNumber = string | number;
type Combined = User & Admin;

// 3. Computed properties - type aliases support this
type Keys = "name" | "age";
type UserRecord = {
  [K in Keys]: string;
};

// 4. Extending - both support, but syntax differs
interface A extends B {}
type A = B & {};
```

### When to Use Which

- **Use Interfaces** when:

  - You need declaration merging
  - Defining object shapes for classes
  - Working with object-oriented code

- **Use Type Aliases** when:
  - You need union or intersection types
  - You need computed properties
  - You're creating type utilities
  - You need to define primitives, unions, or tuples

---

## VI. Utility Types

TypeScript provides several built-in utility types for common type transformations.

### Partial<T>

Makes all properties of T optional.

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }

function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}
```

### Required<T>

Makes all properties of T required.

```typescript
interface Config {
  apiUrl?: string;
  timeout?: number;
}

type RequiredConfig = Required<Config>;
// { apiUrl: string; timeout: number; }
```

### Readonly<T>

Makes all properties of T readonly.

```typescript
interface Mutable {
  value: number;
}

type Immutable = Readonly<Mutable>;
// { readonly value: number; }
```

### Pick<T, K>

Selects a subset of properties from T.

```typescript
interface User {
  name: string;
  age: number;
  email: string;
  password: string;
}

type PublicUser = Pick<User, "name" | "age" | "email">;
// { name: string; age: number; email: string; }
```

### Omit<T, K>

Removes properties from T.

```typescript
interface User {
  name: string;
  age: number;
  email: string;
  password: string;
}

type PublicUser = Omit<User, "password">;
// { name: string; age: number; email: string; }
```

### Record<K, T>

Creates an object type with keys of type K and values of type T.

```typescript
type PageInfo = {
  title: string;
  likes: number;
};

type Page = "home" | "about" | "contact";

const pages: Record<Page, PageInfo> = {
  home: { title: "Home", likes: 100 },
  about: { title: "About", likes: 50 },
  contact: { title: "Contact", likes: 25 },
};
```

---

## VII. Functions and Function Types

TypeScript provides powerful ways to type functions.

### Function Declarations

```typescript
function add(x: number, y: number): number {
  return x + y;
}

function greet(name: string): void {
  console.log(`Hello, ${name}!`);
}
```

### Function Expressions

```typescript
const multiply = function (x: number, y: number): number {
  return x * y;
};

const divide: (x: number, y: number) => number = function (x, y) {
  return x / y;
};
```

### Arrow Functions

```typescript
const subtract = (x: number, y: number): number => {
  return x - y;
};

const square = (x: number): number => x * x;
```

### Optional and Default Parameters

```typescript
function buildName(firstName: string, lastName?: string): string {
  if (lastName) {
    return `${firstName} ${lastName}`;
  }
  return firstName;
}

function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}
```

### Rest Parameters

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3, 4, 5); // 15
```

### Function Overloads

```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;
function format(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value ? "YES" : "NO";
}

format("hello"); // "HELLO"
format(42); // "42.00"
format(true); // "YES"
```

### Generic Functions

```typescript
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]); // number | undefined
const str = firstElement(["a", "b", "c"]); // string | undefined
```

### Function Type Aliases

```typescript
type MathOperation = (x: number, y: number) => number;

const add: MathOperation = (x, y) => x + y;
const multiply: MathOperation = (x, y) => x * y;

type EventHandler = (event: Event) => void;
type AsyncFunction<T> = () => Promise<T>;
```

---

## VIII. Classes and Inheritance

TypeScript adds type annotations and access modifiers to JavaScript classes.

### Basic Class

```typescript
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
  }
}

const person = new Person("John", 30);
```

### Access Modifiers

```typescript
class BankAccount {
  public accountNumber: string; // Accessible everywhere
  private balance: number; // Only accessible within class
  protected owner: string; // Accessible in class and subclasses

  constructor(accountNumber: string, balance: number, owner: string) {
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.owner = owner;
  }

  public getBalance(): number {
    return this.balance;
  }

  private validateAmount(amount: number): boolean {
    return amount > 0;
  }
}
```

### Readonly Properties

```typescript
class Point {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const point = new Point(10, 20);
// point.x = 30; // Error: Cannot assign to 'x' because it is a read-only property
```

### Parameter Properties

```typescript
class Person {
  constructor(
    public name: string,
    private age: number,
    protected email: string
  ) {
    // Properties are automatically created and assigned
  }
}

// Equivalent to:
class Person {
  public name: string;
  private age: number;
  protected email: string;

  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
}
```

### Inheritance

```typescript
class Animal {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  move(distance: number = 0): void {
    console.log(`${this.name} moved ${distance}m.`);
  }
}

class Dog extends Animal {
  private breed: string;

  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }

  bark(): void {
    console.log(`${this.name} barks!`);
  }

  move(distance: number = 5): void {
    console.log(`${this.name} runs ${distance}m.`);
    super.move(distance);
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.bark();
dog.move(10);
```

### Abstract Classes

```typescript
abstract class Shape {
  abstract getArea(): number;
  abstract getPerimeter(): number;

  displayInfo(): void {
    console.log(`Area: ${this.getArea()}, Perimeter: ${this.getPerimeter()}`);
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }

  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}
```

### Implementing Interfaces

```typescript
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Duck implements Flyable, Swimmable {
  fly(): void {
    console.log("Duck is flying");
  }

  swim(): void {
    console.log("Duck is swimming");
  }
}
```

### Static Members

```typescript
class MathUtils {
  static PI: number = 3.14159;

  static add(x: number, y: number): number {
    return x + y;
  }

  static multiply(x: number, y: number): number {
    return x * y;
  }
}

console.log(MathUtils.PI);
console.log(MathUtils.add(5, 3));
```

### Getters and Setters

```typescript
class Temperature {
  private _celsius: number = 0;

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Temperature cannot be below absolute zero");
    }
    this._celsius = value;
  }

  get fahrenheit(): number {
    return (this._celsius * 9) / 5 + 32;
  }

  set fahrenheit(value: number) {
    this._celsius = ((value - 32) * 5) / 9;
  }
}

const temp = new Temperature();
temp.celsius = 25;
console.log(temp.fahrenheit); // 77
```

---

## Documentation Links

- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
