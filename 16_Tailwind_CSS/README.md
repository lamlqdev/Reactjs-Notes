# Tailwind v4 Design System — Key Learnings

Lessons extracted from a production codebase and applied to Tailwind v4.
Use this as a reference when setting up any new project.

---

## The Core Mental Model

```
:root { }          raw values       — the only place you touch when rebranding
@theme { }         token registry   — maps raw vars into Tailwind utility classes
@layer components  semantic classes — bundles utilities into meaningful names
JSX / HTML         consumption      — uses named classes, never hardcoded values
```

The goal: **your components should never contain magic numbers or color hex codes.**

---

## Lesson 1 — Design Tokens via CSS Variables

### What it is
Store all raw values (colors, spacing, radii) in `:root` as CSS custom properties.
Tailwind becomes a thin layer on top — it only holds references, not actual values.

### Why it matters
- Rebrand by changing `:root` only — zero JSX changes needed
- Dark mode by overriding `:root` under a `[data-theme="dark"]` selector
- Scales to any team size: designers own `:root`, developers own components

### How to do it in Tailwind v4

```css
/* :root — raw values */
:root {
  --gap-m: 24px;
  --fg-primary: #242629;
}

/* @theme — register with Tailwind */
@theme {
  --spacing-gap-m: var(--gap-m);          /* generates: gap-gap-m, p-gap-m, ... */
  --color-foreground-primary: var(--fg-primary); /* generates: text-foreground-primary */
}
```

### Key difference from v3
In v3, this mapping lived in `tailwind.config.js`. In v4, it moves into CSS via `@theme`.
No config file needed at all.

---

## Lesson 2 — Semantic Color Naming

### What it is
Name colors by their **role in the UI**, not their visual appearance.

```css
/* Bad — describes appearance */
--color-gray-900: #242629;
--color-gray-500: #7f8183;

/* Good — describes purpose */
--fg-primary: #242629;     /* main text */
--fg-secondary: #7f8183;   /* supporting text */
--fg-critical: #d25123;    /* errors, warnings */
```

### Color role categories
| Category | Purpose | Examples |
|---|---|---|
| `foreground-*` | Text and icons | `foreground-primary`, `foreground-secondary` |
| `bg-*` | Surfaces and backgrounds | `bg-primary`, `bg-secondary` |
| `interactive-*` | Buttons, links, clickable UI | `interactive-primary`, `interactive-primary-hover` |
| `border-*` | All borders and dividers | `border-default`, `border-focus`, `border-critical` |
| `status-*` | Feedback states | `status-success-bg`, `status-error-bg` |
| `brand-*` | Brand identity | `brand-primary`, `brand-secondary` |

### In JSX

```tsx
/* Before: visual names — change design = search entire codebase */
<button className="bg-gray-900 hover:bg-gray-700 text-white border-gray-300" />

/* After: semantic names — change design = update :root only */
<button className="bg-interactive-primary hover:bg-interactive-primary-hover
                   text-foreground-inverse border-border-default" />
```

### Dark mode becomes trivial

```css
[data-theme="dark"] {
  --fg-primary: #ffffff;
  --bg-primary: #0f0f0f;
  --interactive-primary: #ffffff;
}
/* Every component updates automatically — no class changes */
```

---

## Lesson 3 — Typography Component Classes

### What it is
Bundle font-family, font-size, font-weight, and line-height into one semantic class
using `@layer components`.

### Why it matters
- Avoid repeating `font-funnel-sans font-light text-[21px] leading-[135%]` everywhere
- Typography stays consistent — changing `.body-1` updates every instance
- Clear hierarchy: `header-1` through `header-5`, `body-1` through `body-5`

### Structure

```css
@layer components {

  /* Heading scale — uses display font */
  .header-1 {
    font-family: var(--font-display);
    font-size: var(--font-size-title-1); /* scales responsively */
    line-height: 120%;
  }

  /* Body scale — uses body font */
  .body-3 {
    font-family: var(--font-body);
    font-weight: 300;
    font-size: var(--font-size-body-3);
    line-height: 140%;
  }
}
```

### Usage pattern
Typography classes only set font properties. Color is always applied separately:

```tsx
<h1 className="header-1 text-foreground-primary" />
<p  className="body-3 text-foreground-secondary" />
<span className="caption-1 text-foreground-tertiary" />
```

This separation means you can reuse `.body-3` with any color without creating variants.

### Two-font system
The project uses two distinct fonts for clear hierarchy:

```
Display font (SharpGrotesk) → headings, buttons, labels, caps
Body font (FunnelSans)      → paragraphs, descriptions, captions
```

This creates visual contrast without relying solely on size.

---

## Lesson 4 — Responsive Scaling via CSS Variables

### What it is
Instead of writing breakpoint classes in JSX (`md:p-6 lg:p-8 xl:p-12`),
override the CSS variables themselves at each breakpoint.

### Why it matters
- JSX stays clean — no breakpoint classes in components
- Change the responsive behavior in one place (`:root`) for the entire app
- Font sizes, spacing, and radii all scale together consistently

### How it works

```css
/* Base values */
:root {
  --padding-m: 24px;
  --font-size-title-1: 40px;
}

/* Override at larger screens */
@media (min-width: 960px) {
  :root {
    --padding-m: 32px;
    --font-size-title-1: 48px;
  }
}

@media (min-width: 1440px) {
  :root {
    --padding-m: 40px;
    --font-size-title-1: 56px;
  }
}
```

```tsx
/* This component is fully responsive — no breakpoint classes */
<section className="px-p-m">
  <h1 className="header-1 text-foreground-primary" />
</section>
```

### When to still use breakpoint classes
Use `m:`, `l:`, `xl:` classes when you need **structural changes**, not just size changes:

```tsx
/* Layout change — still needs breakpoint class */
<div className="flex-col m:flex-row" />

/* Size change — handled by CSS var override, no class needed */
<div className="px-p-m" />
```

---

## Lesson 5 — @layer components for Shared Utilities

### What it is
Use `@layer components` to create reusable utility bundles beyond just typography.

### Common patterns

```css
@layer components {

  /* Layout shortcuts */
  .flex-center   { display: flex; justify-content: center; align-items: center; }
  .flex-between  { display: flex; justify-content: space-between; align-items: center; }

  /* Transition presets */
  .transition-bg {
    transition-property: background-color;
    transition-duration: 250ms;
    transition-timing-function: var(--ease-entrance);
  }

  /* Utility */
  .scrollbar-hide { scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
}
```

### Why @layer components over plain CSS classes
Classes in `@layer components` can be overridden by Tailwind utility classes.
This means you can still do:

```tsx
<p className="body-3 text-foreground-secondary leading-loose" />
/* leading-loose overrides the line-height set in .body-3 */
```

Plain CSS classes without `@layer` would have higher specificity and block overrides.

---

## Lesson 6 — Naming Conventions

Consistent naming makes the system predictable. Key patterns from the project:

### Spacing scale
```
xxs < xs < s < m < l < xl < xxl
```
Used for both gap and padding. The same scale applies everywhere —
no need to remember whether to use `4 / 6 / 8` or `1rem / 1.5rem`.

### Color naming formula
```
--color-{role}-{element}-{state}

--color-foreground-primary         (role: foreground, no element, no state)
--color-background-interactive-primary-hover  (role: background, element: interactive, state: hover)
--color-border-input-controls-focus           (role: border, element: input-controls, state: focus)
```

### Breakpoint naming
Use semantic names tied to your design system, not device names:
```
s (560px) → m (768px) → l (960px) → xl (1440px) → xxl (1920px)
```

---

## File Structure Reference

```
globals.css
│
├── @import "tailwindcss"
│
├── @theme { }
│   ├── fonts, breakpoints
│   ├── spacing  → points to :root vars
│   ├── radii    → points to :root vars
│   ├── font sizes → points to :root vars
│   └── colors (semantic) → points to :root vars
│
├── :root { }
│   └── all raw values (the only place to edit for rebrand)
│
├── @media breakpoints { :root overrides }
│   └── spacing and font sizes grow at each breakpoint
│
├── @layer base { }
│   └── resets, body defaults
│
└── @layer components { }
    ├── layout helpers (.flex-center, .flex-between)
    ├── typography (.header-1~5, .body-1~5, .caption-1~2)
    ├── button labels (.btn-label-1~2)
    └── utility classes (.transition-bg, .scrollbar-hide)
```

---

## Quick Checklist for New Projects

- [ ] Define font roles: display font (headings) and body font (content)
- [ ] Build spacing scale in `:root` using a consistent naming scheme (xxs → xxl)
- [ ] Create semantic color tokens grouped by role (foreground, background, interactive, border, status)
- [ ] Register all tokens in `@theme` so Tailwind generates utility classes
- [ ] Set up `@media` breakpoint overrides in `:root` — never rely on hardcoded responsive classes for size scaling
- [ ] Create typography classes in `@layer components` covering heading, body, and caption scales
- [ ] Test dark mode early: add `[data-theme="dark"]` overrides and verify the whole system flips correctly