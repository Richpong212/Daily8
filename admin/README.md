# Daily 8 CMS

Internal content management system for authoring the Daily 8 exercise library, workout library and supporting reference data.

## Stack

- **Vite** + **React 19** (TypeScript)
- **React Router v7** (`react-router-dom`)
- **Tailwind CSS v4** for styling with a design-system-first approach
- **lucide-react** icons, **shadcn/ui** primitives

The project does **not** use TanStack Router / TanStack Start. All routing is standard React Router. There is no backend — every read/write is served by an in-memory store (`src/services/store.ts`) that simulates CRUD operations and notifies subscribed React components via `useSyncExternalStore`.

## Folder layout

```
src/
├── main.tsx              // entry point
├── App.tsx               // mounts the router
├── routes/               // React Router route definitions
│   └── AppRoutes.tsx
├── pages/                // page components (one per screen)
│   ├── Dashboard.tsx
│   ├── ExercisesList.tsx
│   ├── ExerciseEditor.tsx
│   ├── WorkoutsList.tsx
│   ├── WorkoutEditor.tsx
│   ├── SupportingData.tsx
│   ├── Media.tsx
│   └── NotFound.tsx
├── services/             // simulated API layer (CRUD + subscriptions)
│   ├── store.ts
│   ├── exercises.ts
│   ├── workouts.ts
│   └── supporting-data.ts
├── data/                 // seed / dummy data
│   └── seed.ts
├── types/                // shared TypeScript types
│   └── index.ts
├── components/
│   ├── layout/           // shell components (Sidebar, AppLayout)
│   ├── ui/               // shadcn primitives
│   ├── StatusBadge.tsx
│   └── ExerciseTile.tsx
├── hooks/
├── lib/
└── styles.css            // design tokens + Tailwind entry
```

## Design system

All colors, radii and status tokens live in `src/styles.css` as CSS custom properties (`oklch`) and are exposed to Tailwind via `@theme inline`. Semantic tokens include `--background`, `--card`, `--primary`, `--sidebar-*`, `--success`, `--warning`, `--info`, and `--destructive`. Components consume these through Tailwind utilities (`bg-primary`, `text-muted-foreground`, `bg-sidebar-primary`) rather than hardcoded hex values.

## Simulated CRUD

Every service module is a thin wrapper over the in-memory `store`:

```
services/exercises.ts   → useExercises / createExercise / updateExercise / deleteExercise …
services/workouts.ts    → useWorkouts / addGroup / addSlot / updateSlot / publishWorkout …
services/supporting-data.ts → CRUD for movement families, body regions, benefits, muscles, equipment, constraints and variant ladders
```

React components call these functions directly. When the store changes, subscribed components re-render. Replace the service modules with real HTTP calls (fetch/axios/…) when integrating with a real API — the surface area intentionally mirrors what a REST/GraphQL client would expose.

## Scripts

```
bun run dev       # start Vite dev server on :8080
bun run build     # production build
bun run preview   # preview the production build
bun run lint      # ESLint
```

## Content model

Editorial data is modelled around Exercises, Workouts (with Groups → Slots), and supporting reference tables (Movement Families, Body Regions, Benefits, Muscles, Equipment, Constraints, Variant Ladders). See `src/types/index.ts` for the full schema and `src/data/seed.ts` for representative seed data.
