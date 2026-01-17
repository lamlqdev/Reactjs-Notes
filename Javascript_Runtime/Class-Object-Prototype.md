# JavaScript Classes, Objects & Prototypes - Deep Dive

## Overview

JavaScript's object-oriented programming is prototype-based, not class-based like traditional OOP languages. Understanding the relationship between objects, prototypes, and the ES6 class syntax is crucial for mastering JavaScript.

This document explores what happens behind the scenes when we work with objects, prototypes, and classes.

## Objects in JavaScript

### Creating Objects

There are multiple ways to create objects in JavaScript:

```javascript
// Object literal
const obj1 = { name: 'Alice' };

// Object constructor
const obj2 = new Object();
obj2.name = 'Bob';

// Object.create()
const obj3 = Object.create(null);
obj3.name = 'Charlie';
```

### Object Internal Structure

When an object is created, it contains:
- **Own properties**: Properties directly on the object
- **[[Prototype]]**: Internal property linking to another object (the prototype)

The `[[Prototype]]` is an internal slot that cannot be directly accessed in code, but it's what makes prototype inheritance work.

### Accessing the Prototype

There are several ways to access an object's prototype:

```javascript
const obj = { name: 'Alice' };

// Modern approach
Object.getPrototypeOf(obj);

// Legacy (not recommended for production)
obj.__proto__;

// Constructor's prototype
obj.constructor.prototype;
```

## The Prototype Chain

### How Property Lookup Works

When you try to access a property on an object, JavaScript follows this process:

1. **Check the object itself**: Does the object have this property as an own property?
2. **Check the prototype**: If not found, check the object's `[[Prototype]]`
3. **Walk up the chain**: Continue checking each prototype's prototype
4. **Reach null**: If we reach an object with `[[Prototype]]` of `null`, the property is `undefined`

### Example: Prototype Chain Walkthrough

```javascript
const animal = {
  eats: true,
  walk() {
    console.log('Animal walks');
  }
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.jumps);  // Own property: true
console.log(rabbit.eats);   // From prototype: true
console.log(rabbit.sleeps); // Not found: undefined
```

**Execution flow for `rabbit.eats`:**

1. Engine checks: Does `rabbit` have an own property `eats`? No.
2. Engine checks: What is `rabbit`'s `[[Prototype]]`? It's `animal`.
3. Engine checks: Does `animal` have property `eats`? Yes, return `true`.

**Prototype chain:**
```
rabbit → animal → Object.prototype → null
```

### Property Shadowing

If you add a property to an object that already exists in its prototype chain, you create a "shadow" property:

```javascript
const animal = { eats: true };
const rabbit = Object.create(animal);

console.log(rabbit.eats); // true (from prototype)

rabbit.eats = false; // Creates own property

console.log(rabbit.eats); // false (own property shadows prototype)
console.log(animal.eats); // true (prototype unchanged)
```

**Important**: Setting a property creates an own property on the object, it doesn't modify the prototype.

## Constructor Functions

Before ES6 classes, constructor functions were the primary way to create objects with shared behavior.

### Constructor Function Basics

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const alice = new Person('Alice', 25);
```

### What Happens with `new`

When you call `new Person('Alice', 25)`, JavaScript does the following:

1. **Creates a new empty object**: `{}`
2. **Sets the prototype**: The new object's `[[Prototype]]` is set to `Person.prototype`
3. **Executes the constructor**: `Person` is called with `this` bound to the new object
4. **Returns the object**: Unless the constructor explicitly returns an object, the new object is returned

**Step-by-step execution:**

```javascript
// Step 1: Create new object
const newObj = {};

// Step 2: Set prototype
Object.setPrototypeOf(newObj, Person.prototype);
// Or: newObj.__proto__ = Person.prototype;

// Step 3: Execute constructor
Person.call(newObj, 'Alice', 25);
// Result: newObj = { name: 'Alice', age: 25 }

// Step 4: Return
// alice = newObj;
```

### The `prototype` Property

**Important distinction:**
- Every **function** has a `prototype` property (an object)
- Every **object** has a `[[Prototype]]` (internal slot)

```javascript
function Person(name) {
  this.name = name;
}

// Person.prototype is an object
console.log(typeof Person.prototype); // "object"

// Person.prototype has a constructor property
console.log(Person.prototype.constructor === Person); // true

const alice = new Person('Alice');

// alice's [[Prototype]] points to Person.prototype
console.log(Object.getPrototypeOf(alice) === Person.prototype); // true
```

**Prototype chain for `alice`:**
```
alice → Person.prototype → Object.prototype → null
```

### Adding Methods to the Prototype

Methods added to the prototype are shared across all instances:

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const alice = new Person('Alice');
const bob = new Person('Bob');

// Both share the same greet method
console.log(alice.greet === bob.greet); // true

// The method is not on the instances
console.log(alice.hasOwnProperty('greet')); // false
console.log(alice.hasOwnProperty('name'));  // true
```

**Why this matters:**
- Own properties (`name`) are stored on each instance
- Prototype methods (`greet`) are stored once and shared
- This saves memory when you have many instances

## ES6 Classes

ES6 introduced the `class` syntax, which is syntactic sugar over constructor functions and prototypes.

### Class Basics

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
}

const alice = new Person('Alice', 25);
```

### What Classes Really Are

**Critical understanding:** Classes are still functions under the hood.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

console.log(typeof Person); // "function"
console.log(Person.prototype); // Object with constructor and methods
```

### Class Syntax Breakdown

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
  
  static species() {
    return 'Homo sapiens';
  }
}
```

**What this creates:**

1. **`Person` function**: The constructor function
2. **`Person.prototype.greet`**: Instance method added to prototype
3. **`Person.species`**: Static method added to the constructor itself

**Equivalent constructor function:**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

Person.species = function() {
  return 'Homo sapiens';
};
```

### Instance vs Static Methods

```javascript
class MathHelper {
  constructor(value) {
    this.value = value;
  }
  
  // Instance method - called on instances
  double() {
    return this.value * 2;
  }
  
  // Static method - called on the class itself
  static add(a, b) {
    return a + b;
  }
}

const helper = new MathHelper(5);

// Instance method
console.log(helper.double()); // 10

// Static method
console.log(MathHelper.add(3, 4)); // 7

// This would fail:
// console.log(helper.add(3, 4)); // TypeError: helper.add is not a function
```

**Why the difference:**
- **Instance methods** are on `MathHelper.prototype`
- **Static methods** are on `MathHelper` itself (the constructor function)

## Class Inheritance

### Using `extends`

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
  }
  
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Max', 'Golden Retriever');
dog.speak(); // "Max barks"
```

### What `extends` Does

When you use `class Dog extends Animal`, JavaScript:

1. Sets `Dog.prototype`'s `[[Prototype]]` to `Animal.prototype`
2. Sets `Dog`'s `[[Prototype]]` to `Animal` (for static inheritance)

**Prototype chain for `dog`:**
```
dog → Dog.prototype → Animal.prototype → Object.prototype → null
```

**Static prototype chain:**
```
Dog → Animal → Function.prototype → Object.prototype → null
```

### The `super` Keyword

`super` has two uses:

**1. In constructor - calls parent constructor:**

```javascript
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Must call before accessing 'this'
    this.breed = breed;
  }
}
```

**Critical rule:** You **must** call `super()` before accessing `this` in a derived class constructor. This is because the parent constructor creates the `this` object.

**2. In methods - calls parent method:**

```javascript
class Dog extends Animal {
  speak() {
    super.speak(); // Call parent's speak method
    console.log('And wags tail');
  }
}

const dog = new Dog('Max');
dog.speak();
// "Max makes a sound"
// "And wags tail"
```

### Method Overriding

When a child class defines a method with the same name as the parent class, it **overrides** the parent method:

```javascript
class Animal {
  speak() {
    console.log('Generic sound');
  }
}

class Dog extends Animal {
  speak() {
    console.log('Bark');
  }
}

const dog = new Dog();
dog.speak(); // "Bark" (Dog's method, not Animal's)
```

**Lookup process:**
1. Check `dog` for own property `speak`: Not found
2. Check `Dog.prototype` for `speak`: Found! Execute it
3. (Never reaches `Animal.prototype.speak`)

## Object.create() Deep Dive

`Object.create()` creates a new object with a specified prototype.

### Basic Usage

```javascript
const personPrototype = {
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
};

const alice = Object.create(personPrototype);
alice.name = 'Alice';

alice.greet(); // "Hi, I'm Alice"
```

**What happens:**
1. New object `{}` is created
2. Its `[[Prototype]]` is set to `personPrototype`
3. Assigned to `alice`

### Object.create(null)

Creating an object with no prototype:

```javascript
const obj = Object.create(null);

console.log(obj.toString); // undefined
console.log(Object.getPrototypeOf(obj)); // null
```

**Use case:** Creating dictionaries/maps without inherited properties.

### Difference from Constructor Functions

```javascript
// Using constructor function
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};
const alice = new Person('Alice');

// Using Object.create
const personProto = {
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
};
const bob = Object.create(personProto);
bob.name = 'Bob';
```

**Key difference:**
- Constructor functions execute initialization logic
- `Object.create()` just sets the prototype, no initialization

## Practical Patterns

### Factory Functions with Prototypes

```javascript
const personMethods = {
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  },
  
  celebrateBirthday() {
    this.age++;
    console.log(`Now ${this.age} years old`);
  }
};

function createPerson(name, age) {
  const person = Object.create(personMethods);
  person.name = name;
  person.age = age;
  return person;
}

const alice = createPerson('Alice', 25);
const bob = createPerson('Bob', 30);

// Both share the same methods
console.log(alice.greet === bob.greet); // true
```

### Composition Over Inheritance

```javascript
const canEat = {
  eat(food) {
    console.log(`Eating ${food}`);
  }
};

const canWalk = {
  walk() {
    console.log('Walking');
  }
};

const canSwim = {
  swim() {
    console.log('Swimming');
  }
};

// Compose behaviors
function createDog(name) {
  return Object.assign(
    Object.create({ ...canEat, ...canWalk }),
    { name }
  );
}

function createFish(name) {
  return Object.assign(
    Object.create({ ...canEat, ...canSwim }),
    { name }
  );
}

const dog = createDog('Max');
dog.walk(); // "Walking"
dog.eat('bone'); // "Eating bone"

const fish = createFish('Nemo');
fish.swim(); // "Swimming"
// fish.walk(); // TypeError: fish.walk is not a function
```

## Common Pitfalls

### 1. Forgetting `new` Keyword

```javascript
function Person(name) {
  this.name = name;
}

const alice = Person('Alice'); // Forgot 'new'

console.log(alice); // undefined
console.log(window.name); // 'Alice' (in browsers, 'this' is global)
```

**Solution:** Use classes (they throw an error if called without `new`) or check in the constructor:

```javascript
function Person(name) {
  if (!(this instanceof Person)) {
    return new Person(name);
  }
  this.name = name;
}
```

### 2. Modifying Built-in Prototypes

```javascript
// DON'T DO THIS
Array.prototype.first = function() {
  return this[0];
};
```

**Why it's bad:**
- Can break existing code
- May conflict with future JavaScript features
- Affects all arrays in your application

### 3. Lost `this` Context

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
}

const alice = new Person('Alice');
const greetFunc = alice.greet;

greetFunc(); // TypeError: Cannot read property 'name' of undefined
```

**Solution:** Bind the method or use arrow functions:

```javascript
class Person {
  constructor(name) {
    this.name = name;
    this.greet = this.greet.bind(this);
  }
  
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
}

// Or use arrow function property (class field)
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet = () => {
    console.log(`Hi, I'm ${this.name}`);
  }
}
```

## Performance Considerations

### Memory Usage

```javascript
// BAD: Methods in constructor - each instance gets its own copy
function Person(name) {
  this.name = name;
  this.greet = function() {
    console.log(`Hi, I'm ${this.name}`);
  };
}

// GOOD: Methods on prototype - shared across instances
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

// With 1000 instances:
// BAD approach: 1000 greet functions in memory
// GOOD approach: 1 greet function in memory
```

### Prototype Chain Length

The longer the prototype chain, the slower property lookups become:

```javascript
// Shorter chain - faster
class Animal {}
class Dog extends Animal {}

// Longer chain - slower
class Animal {}
class Mammal extends Animal {}
class Canine extends Mammal {}
class Dog extends Canine {}
```

**Best practice:** Keep inheritance hierarchies shallow (2-3 levels max).

## Key Takeaways

### Objects and Prototypes
- Every object has a `[[Prototype]]` linking to another object
- Property lookup walks up the prototype chain until found or reaching `null`
- Own properties shadow prototype properties

### Constructor Functions
- Use `new` to create instances
- `this` refers to the new object being created
- Methods should be on `prototype` for memory efficiency

### Classes
- Syntactic sugar over constructor functions
- `extends` sets up prototype chain for inheritance
- `super()` must be called before accessing `this` in derived constructors

### Prototype Chain
- Enables inheritance and code reuse
- Affects property lookup performance
- Can be inspected with `Object.getPrototypeOf()`

### Best Practices
- Use classes for clarity and safety
- Don't modify built-in prototypes
- Keep inheritance hierarchies shallow
- Put shared methods on prototypes, instance data on objects

---

*Understanding prototypes is fundamental to mastering JavaScript's object model.*