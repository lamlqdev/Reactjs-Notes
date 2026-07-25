# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

A personal React.js learning repository combining markdown documentation with working code examples. Each topic area lives in its own folder with both a README.md (theory + explanations) and a Vite-based React project (runnable demos).

## Running the Code Projects

Each project with a `package.json` is standalone. Navigate into the project directory and use standard Vite commands:

```bash
cd <ProjectFolder>
npm install
npm run dev      # Start dev server (usually http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

Projects with code: `01_React_Essentials`, `02_useEffect`, `03_useRef_Portal`, `04_React_Performance_Rendering`, `05_Custom_Hooks`, `06_ContextAPI_useReducer`, `Authentication`, `Axios_Tanstack_Query`, `Fetching_Data`, `React_Hook_Form`, `React_Router`, `Unit_Testing`.

The `Redux_Redux_Toolkit` folder contains two separate sub-projects:
- `Redux_Redux_Toolkit/Redux/` — traditional Redux
- `Redux_Redux_Toolkit/Redux-Toolkit/` — modern RTK approach

## Running Tests

```bash
cd Unit_Testing
npm install
npm run test      # Run Vitest test suite
```

## Repository Structure

| Folder | Type | What it covers |
|--------|------|----------------|
| `React_Essentials/` | Docs + Code | Core React concepts, JSX, props, state |
| `useEffect/` | Docs + Code | Side effects, cleanup, dependency arrays |
| `useRef_Portal/` | Docs + Code | DOM refs, `useImperativeHandle`, portals |
| `05_Custom_Hooks/` | Docs + Code | Extracting and composing custom hooks |
| `06_ContextAPI_useReducer/` | Docs + Code | Global state without Redux |
| `Redux_Redux_Toolkit/` | Docs + Code | Redux fundamentals and RTK patterns |
| `React_Router/` | Docs + Code | React Router v6, loaders, actions |
| `Fetching_Data/` | Docs + Code | Fetch API, HTTP patterns |
| `Axios_Tanstack_Query/` | Docs + Code | Axios + TanStack Query (React Query) |
| `React_Hook_Form/` | Docs + Code | Form handling with RHF + Zod validation |
| `Authentication/` | Docs + Code | JWT, protected routes, RBAC |
| `04_React_Performance_Rendering/` | Docs + Code | `memo`, `useMemo`, `useCallback`, lazy loading |
| `Styling/` | Docs | CSS Modules, Styled Components comparison |
| `Tailwind_CSS/` | Code | Tailwind utility class examples |
| `TypeScript/` | Docs | TypeScript type system for React |
| `Unit_Testing/` | Docs + Code | Vitest + React Testing Library |
| `Javascript_Runtime/` | Docs only | V8 internals, event loop, closures, promises |

## Tech Stack

- **Build**: Vite 5
- **UI**: React 18 + TypeScript
- **Forms**: React Hook Form + Zod
- **Data fetching**: TanStack Query (React Query) + Axios
- **State**: Context API, Redux, Redux Toolkit
- **Testing**: Vitest + React Testing Library
- **Styling**: Tailwind CSS, CSS Modules, Styled Components

## Documentation Style

README files in each module follow a consistent pattern: concept explanation → beginner example → advanced example → visual diagram (in `public/`). When editing docs, match this structure and keep code examples minimal but runnable. Diagrams are images stored in each project's `public/` folder and referenced in READMEs.

The `Javascript_Runtime/` folder contains 12 standalone markdown deep-dives; they are documentation-only with no associated project.
