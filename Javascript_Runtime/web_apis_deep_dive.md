# Web APIs Deep Dive

## Overview

Web APIs are browser-provided interfaces that extend JavaScript's capabilities beyond the core language. They enable interaction with browser features, DOM manipulation, asynchronous operations, and system resources.

This document covers the internal mechanics of key Web APIs:
- Observer APIs (Intersection, Mutation, Resize, Performance)
- Web Workers
- Service Workers
- IndexedDB
- requestAnimationFrame

## Observer APIs

Observer APIs provide efficient ways to monitor changes to DOM elements, viewport visibility, and performance metrics.

### Intersection Observer

Intersection Observer provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or the viewport.

#### Basic Usage

```javascript
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element is visible:', entry.target);
    }
  });
});

const element = document.querySelector('.observed');
observer.observe(element);
```

#### How It Works Internally

**Step 1: Observer Creation**
```javascript
const observer = new IntersectionObserver(callback, options);
```

**Callback signature:**
```javascript
function callback(entries, observer) {
  // entries: Array of IntersectionObserverEntry objects
  // observer: The IntersectionObserver instance
}
```

**Step 2: Registration**

When you call `observer.observe(element)`:
1. Element is added to observer's internal list
2. Browser starts tracking element's position
3. Initial intersection calculation happens asynchronously

**Step 3: Intersection Calculation**

Browser checks intersection:
- During rendering pipeline (not on every frame)
- When scrolling stops
- When element position changes
- On initial observation

**Step 4: Callback Invocation**

If intersection changes:
1. Create IntersectionObserverEntry objects
2. Push to microtask queue
3. Execute callback when microtask queue is processed

#### IntersectionObserverEntry Properties

```javascript
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    console.log(entry.isIntersecting);      // Boolean: Is visible?
    console.log(entry.intersectionRatio);   // 0-1: How much is visible?
    console.log(entry.intersectionRect);    // Visible portion rectangle
    console.log(entry.boundingClientRect);  // Element's bounds
    console.log(entry.rootBounds);          // Root element's bounds
    console.log(entry.target);              // The observed element
    console.log(entry.time);                // Timestamp
  });
});
```

#### Configuration Options

```javascript
const options = {
  root: null,           // Viewport (default) or ancestor element
  rootMargin: '0px',    // Margin around root (CSS syntax)
  threshold: 0.5        // Trigger at 50% visibility
  // Or array: [0, 0.25, 0.5, 0.75, 1]
};

const observer = new IntersectionObserver(callback, options);
```

**rootMargin example:**
```javascript
const observer = new IntersectionObserver(callback, {
  rootMargin: '50px 0px -50px 0px' // Top, Right, Bottom, Left
  // Expands top by 50px, shrinks bottom by 50px
});
```

**threshold example:**
```javascript
const observer = new IntersectionObserver(callback, {
  threshold: [0, 0.25, 0.5, 0.75, 1]
  // Callback fires at 0%, 25%, 50%, 75%, 100% visibility
});
```

#### Practical Use Case: Lazy Loading Images

```javascript
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // Load actual image
      img.classList.remove('lazy');
      observer.unobserve(img); // Stop observing this image
    }
  });
});

document.querySelectorAll('img.lazy').forEach(img => {
  imageObserver.observe(img);
});
```

**HTML:**
```html
<img class="lazy" data-src="actual-image.jpg" src="placeholder.jpg">
```

#### Performance Benefits

**Traditional scroll listening:**
```javascript
// BAD: Fires on every scroll event
window.addEventListener('scroll', () => {
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      // Element is visible
    }
  });
});
```

**Intersection Observer:**
- Runs asynchronously (doesn't block main thread)
- Browser-optimized calculations
- Fires only when intersection changes
- Batches multiple observations

### Mutation Observer

Mutation Observer watches for changes to the DOM tree.

#### Basic Usage

```javascript
const observer = new MutationObserver((mutations, observer) => {
  mutations.forEach(mutation => {
    console.log('Type:', mutation.type);
    console.log('Target:', mutation.target);
  });
});

const config = {
  attributes: true,      // Watch attribute changes
  childList: true,       // Watch child node changes
  subtree: true,         // Watch descendants too
  characterData: true,   // Watch text content changes
  attributeOldValue: true,    // Store old attribute values
  characterDataOldValue: true // Store old text values
};

observer.observe(document.body, config);
```

#### Mutation Types

**1. Attributes:**
```javascript
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'attributes') {
      console.log('Attribute changed:', mutation.attributeName);
      console.log('Old value:', mutation.oldValue);
      console.log('New value:', mutation.target.getAttribute(mutation.attributeName));
    }
  });
});

observer.observe(element, {
  attributes: true,
  attributeOldValue: true,
  attributeFilter: ['class', 'data-custom'] // Only watch specific attributes
});

element.className = 'new-class'; // Triggers callback
```

**2. Child List:**
```javascript
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      console.log('Added nodes:', mutation.addedNodes);
      console.log('Removed nodes:', mutation.removedNodes);
    }
  });
});

observer.observe(container, { childList: true });

container.appendChild(newElement); // Triggers callback
```

**3. Character Data:**
```javascript
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'characterData') {
      console.log('Text changed from:', mutation.oldValue);
      console.log('To:', mutation.target.textContent);
    }
  });
});

const textNode = document.createTextNode('Initial text');
element.appendChild(textNode);

observer.observe(textNode, {
  characterData: true,
  characterDataOldValue: true
});

textNode.textContent = 'New text'; // Triggers callback
```

#### MutationRecord Properties

```javascript
mutation.type          // 'attributes', 'childList', or 'characterData'
mutation.target        // The affected node
mutation.addedNodes    // NodeList of added nodes
mutation.removedNodes  // NodeList of removed nodes
mutation.previousSibling  // Previous sibling of added/removed nodes
mutation.nextSibling      // Next sibling of added/removed nodes
mutation.attributeName    // Name of changed attribute
mutation.attributeNamespace // Namespace of changed attribute
mutation.oldValue         // Previous value (if enabled)
```

#### Execution Timing

Mutation Observer callbacks run **as microtasks**:

```javascript
const observer = new MutationObserver(mutations => {
  console.log('2. Mutation observed');
});

observer.observe(document.body, { childList: true });

console.log('1. Before mutation');
document.body.appendChild(document.createElement('div'));
console.log('3. After mutation');

Promise.resolve().then(() => {
  console.log('4. Microtask');
});

console.log('5. Synchronous end');
```

**Output:**
```
1. Before mutation
3. After mutation
5. Synchronous end
2. Mutation observed
4. Microtask
```

Mutation callbacks run after synchronous code but before the next task.

#### Practical Use Case: Monitoring Dynamic Content

```javascript
const contentObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Initialize any new components
        if (node.matches('[data-component]')) {
          initializeComponent(node);
        }
        // Re-run syntax highlighting
        if (node.matches('pre code')) {
          highlightCode(node);
        }
      }
    });
  });
});

contentObserver.observe(document.body, {
  childList: true,
  subtree: true
});
```

### Resize Observer

Resize Observer provides notifications when an element's size changes.

#### Basic Usage

```javascript
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    console.log('Element:', entry.target);
    console.log('Size:', entry.contentRect);
    console.log('Border box:', entry.borderBoxSize);
    console.log('Content box:', entry.contentBoxSize);
  });
});

observer.observe(element);
```

#### ResizeObserverEntry Properties

```javascript
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    // contentRect: DOMRectReadOnly (deprecated but widely supported)
    const { width, height } = entry.contentRect;
    
    // Modern: borderBoxSize and contentBoxSize (arrays)
    const borderBox = entry.borderBoxSize[0];
    console.log('Border box:', borderBox.inlineSize, borderBox.blockSize);
    
    const contentBox = entry.contentBoxSize[0];
    console.log('Content box:', contentBox.inlineSize, contentBox.blockSize);
  });
});
```

**Box sizing:**
- **Content box**: Element's content area (excluding padding and border)
- **Border box**: Element including padding and border

#### Execution Timing

Resize Observer callbacks run **before paint, after layout**:

```javascript
element.style.width = '500px'; // Layout updated
// Resize Observer callback fires here
// Paint happens here
```

This allows you to make adjustments before the browser paints.

#### Practical Use Case: Responsive Component

```javascript
class ResponsiveCard {
  constructor(element) {
    this.element = element;
    this.observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const width = entry.contentRect.width;
        
        // Apply different layouts based on size
        if (width < 300) {
          this.element.classList.add('compact');
        } else if (width < 600) {
          this.element.classList.remove('compact');
          this.element.classList.add('normal');
        } else {
          this.element.classList.remove('compact', 'normal');
          this.element.classList.add('expanded');
        }
      });
    });
    
    this.observer.observe(this.element);
  }
  
  disconnect() {
    this.observer.disconnect();
  }
}
```

### Performance Observer

Performance Observer monitors performance-related events.

#### Basic Usage

```javascript
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    console.log('Name:', entry.name);
    console.log('Type:', entry.entryType);
    console.log('Duration:', entry.duration);
  });
});

observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
```

#### Entry Types

**1. Navigation Timing:**
```javascript
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    console.log('DNS lookup:', entry.domainLookupEnd - entry.domainLookupStart);
    console.log('TCP connection:', entry.connectEnd - entry.connectStart);
    console.log('Response time:', entry.responseEnd - entry.responseStart);
    console.log('DOM processing:', entry.domComplete - entry.domLoading);
  });
});

observer.observe({ entryTypes: ['navigation'] });
```

**2. Resource Timing:**
```javascript
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    if (entry.initiatorType === 'img') {
      console.log('Image:', entry.name);
      console.log('Size:', entry.transferSize);
      console.log('Load time:', entry.duration);
    }
  });
});

observer.observe({ entryTypes: ['resource'] });
```

**3. User Timing (Custom Measurements):**
```javascript
// Mark specific points
performance.mark('task-start');
expensiveTask();
performance.mark('task-end');

// Measure between marks
performance.measure('task-duration', 'task-start', 'task-end');

// Observe measurements
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure'] });
```

**4. Long Tasks:**
```javascript
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    console.warn('Long task detected:', entry.duration, 'ms');
    console.log('Started at:', entry.startTime);
  });
});

observer.observe({ entryTypes: ['longtask'] });
```

Tasks longer than 50ms are considered "long tasks" and can cause jank.

## Web Workers

Web Workers allow running JavaScript in background threads, separate from the main thread.

### Creating a Worker

**Main thread (main.js):**
```javascript
const worker = new Worker('worker.js');

// Send message to worker
worker.postMessage({ type: 'start', data: [1, 2, 3] });

// Receive messages from worker
worker.onmessage = (event) => {
  console.log('Result from worker:', event.data);
};

// Handle errors
worker.onerror = (error) => {
  console.error('Worker error:', error);
};

// Terminate worker
worker.terminate();
```

**Worker thread (worker.js):**
```javascript
// Listen for messages
self.onmessage = (event) => {
  console.log('Received:', event.data);
  
  // Perform heavy computation
  const result = processData(event.data.data);
  
  // Send result back
  self.postMessage({ type: 'complete', result });
};

function processData(data) {
  // CPU-intensive work here
  return data.map(x => x * 2);
}
```

### How Workers Work

**Step 1: Worker Creation**
```javascript
const worker = new Worker('worker.js');
```

1. Browser creates new thread
2. Loads worker.js in that thread
3. Returns Worker object immediately (non-blocking)

**Step 2: Message Passing**

Workers communicate via **message passing** (not shared memory):

```javascript
// Main thread
worker.postMessage(data);
```

1. Data is **cloned** using structured clone algorithm
2. Message queued in worker's message queue
3. Control returns immediately to main thread

**Step 3: Worker Execution**

Worker processes messages from its event loop:

```javascript
// Worker
self.onmessage = (event) => {
  // Process event.data
  self.postMessage(result);
};
```

**Step 4: Response**

```javascript
// Main thread
worker.onmessage = (event) => {
  // Handle event.data
};
```

Response is also cloned and sent back through message queue.

### Structured Clone Algorithm

Data sent between workers is cloned, not shared:

**Can be cloned:**
- Primitives (strings, numbers, booleans)
- Arrays, objects
- Dates, RegExp
- Blob, File, FileList
- ArrayBuffer, TypedArrays
- Map, Set
- ImageData

**Cannot be cloned:**
- Functions
- DOM nodes
- Symbols
- Objects with getters/setters (in some cases)

```javascript
// This works
worker.postMessage({
  array: [1, 2, 3],
  date: new Date(),
  buffer: new Uint8Array([1, 2, 3])
});

// This fails
worker.postMessage({
  callback: () => {} // Error: Functions cannot be cloned
});
```

### Transferable Objects

For large data (like ArrayBuffers), use **transferable objects** to avoid cloning:

```javascript
const buffer = new ArrayBuffer(1024 * 1024); // 1MB

// Transfer ownership (zero-copy)
worker.postMessage({ buffer }, [buffer]);

// buffer is now unusable in main thread
console.log(buffer.byteLength); // 0 (neutered)
```

**What happens:**
1. Ownership of buffer transfers to worker
2. No copying occurs (very fast)
3. Original buffer becomes invalid

### Shared Workers

Shared Workers can be accessed by multiple scripts:

**Main scripts:**
```javascript
// script1.js
const worker = new SharedWorker('shared-worker.js');

worker.port.postMessage('Hello from script 1');
worker.port.onmessage = (event) => {
  console.log('Script 1 received:', event.data);
};

// script2.js
const worker = new SharedWorker('shared-worker.js');

worker.port.postMessage('Hello from script 2');
worker.port.onmessage = (event) => {
  console.log('Script 2 received:', event.data);
};
```

**Shared Worker:**
```javascript
const connections = [];

self.onconnect = (event) => {
  const port = event.ports[0];
  connections.push(port);
  
  port.onmessage = (event) => {
    console.log('Received:', event.data);
    
    // Broadcast to all connections
    connections.forEach(conn => {
      conn.postMessage(`Broadcast: ${event.data}`);
    });
  };
};
```

### Practical Use Case: Image Processing

```javascript
// Main thread
const worker = new Worker('image-processor.js');

async function processImage(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      worker.postMessage({
        type: 'process',
        imageData: e.target.result
      });
    };
    
    worker.onmessage = (event) => {
      if (event.data.type === 'complete') {
        resolve(event.data.result);
      }
    };
    
    worker.onerror = reject;
    
    reader.readAsDataURL(imageFile);
  });
}

// Worker (image-processor.js)
self.onmessage = async (event) => {
  if (event.data.type === 'process') {
    const imageData = event.data.imageData;
    
    // CPU-intensive image processing
    const processed = await applyFilters(imageData);
    
    self.postMessage({
      type: 'complete',
      result: processed
    });
  }
};
```

## Service Workers

Service Workers are special workers that act as network proxies, enabling offline functionality and caching.

### Service Worker Lifecycle

**1. Registration:**
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
    })
    .catch(error => {
      console.error('Registration failed:', error);
    });
}
```

**2. Installation:**
```javascript
// sw.js
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
        '/offline.html'
      ]);
    })
  );
});
```

**3. Activation:**
```javascript
self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== 'v1')
          .map(name => caches.delete(name))
      );
    })
  );
});
```

**4. Fetch Interception:**
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request);
      })
  );
});
```

### Caching Strategies

**1. Cache First:**
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

**2. Network First:**
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
```

**3. Stale While Revalidate:**
```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('dynamic').then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        
        return response || fetchPromise;
      });
    })
  );
});
```

## requestAnimationFrame

`requestAnimationFrame` schedules code to run before the next repaint, ideal for animations.

### Basic Usage

```javascript
function animate() {
  // Update animation
  element.style.left = position + 'px';
  position += 1;
  
  // Request next frame
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### How It Works

**Execution timing:**

1. Browser schedules next repaint
2. Before painting, runs all queued `requestAnimationFrame` callbacks
3. Browser paints
4. Repeat

**Frame rate:** Typically 60 FPS (16.67ms per frame), but matches display refresh rate.

### Compared to setTimeout

```javascript
// BAD: Using setTimeout for animation
function animate() {
  element.style.left = position + 'px';
  position += 1;
  setTimeout(animate, 16); // Approximate 60 FPS
}

// GOOD: Using requestAnimationFrame
function animate() {
  element.style.left = position + 'px';
  position += 1;
  requestAnimationFrame(animate);
}
```

**Why requestAnimationFrame is better:**
- Syncs with display refresh rate
- Pauses when tab is inactive (saves CPU)
- Batches DOM changes before paint
- Smoother animations

### Practical Example: Smooth Scroll

```javascript
function smoothScrollTo(targetY, duration = 1000) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();
  
  function scroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeProgress = progress * (2 - progress);
    
    window.scrollTo(0, startY + distance * easeProgress);
    
    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }
  
  requestAnimationFrame(scroll);
}
```

## Key Takeaways

### Observer APIs
- **Intersection Observer**: Efficient visibility detection, runs asynchronously
- **Mutation Observer**: Monitors DOM changes, callbacks run as microtasks
- **Resize Observer**: Detects size changes, runs before paint
- **Performance Observer**: Monitors performance metrics, minimal overhead

### Web Workers
- Run JavaScript in separate threads
- Communicate via message passing (cloned data)
- Cannot access DOM
- Use transferable objects for large data
- Ideal for CPU-intensive tasks

### Service Workers
- Act as network proxies
- Enable offline functionality
- Lifecycle: Install → Activate → Fetch
- Implement caching strategies
- Control navigation and resource requests

### requestAnimationFrame
- Schedules work before browser paints
- Syncs with display refresh rate
- Automatically pauses when tab inactive
- Better than setTimeout for animations

---

*Web APIs extend JavaScript's capabilities, enabling powerful features like offline support, background processing, and optimized UI updates.*