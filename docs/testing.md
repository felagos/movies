# Testing

Vitest + React Testing Library (jsdom environment). Vitest was chosen over Jest because it reuses `vite.config.ts` directly — same plugins, same `import.meta.env` handling — with no separate ESM/CSS-transform config needed.

## Test setup

- Test files use `.test.ts` (no JSX) or `.test.tsx` (renders components/hooks under a `QueryClientProvider`/`MemoryRouter` wrapper) extension.
- Colocated next to source, matching the folder-per-component convention: `Card.tsx` → `Card.test.tsx`.
- `@testing-library/react` provides `render`/`screen`/`fireEvent`/`cleanup`/`renderHook`. Plain `fireEvent` covers every interaction in this app (click, mouseenter, mouseleave) — no `@testing-library/user-event` needed.
- `@testing-library/jest-dom/vitest` matchers (`toBeInTheDocument`, `toHaveClass`, `toHaveAttribute`) are registered globally via `src/test/setup.ts`.
- `vite.config.ts`'s `test.env` sets `VITE_TMDB_TOKEN` to a fixed test value, since `src/api/tmdb.ts` reads it at module load and there's no `.env` in CI.
- The `react-compiler` Babel plugin is skipped under Vitest (`process.env.VITEST` check in `vite.config.ts`) — its auto-memoization inserts compiler-generated branches that inflate branch-coverage misses without corresponding to real source logic.

## Test patterns

- **describe/test hierarchy**: group related tests with `describe` blocks.
- **Mock lifecycle**: set up mocks/spies in `beforeEach`, `cleanup()` + `vi.restoreAllMocks()` in `afterEach`.
- **Fake timers**: components with delays (`Card.tsx`'s 450ms hover-intent timer) use `vi.useFakeTimers()` in `beforeEach`, `vi.clearAllTimers()` in `afterEach`, `vi.useRealTimers()` in `afterAll`. Timer advances that trigger a React state update must be wrapped in `act()` from `@testing-library/react`, or the DOM won't reflect the update synchronously.

## Coverage

`yarn test:coverage` enforces 90% lines/functions/branches/statements **per file** (`coverage.thresholds.perFile: true` in `vite.config.ts`) — an aggregate-only threshold would let one well-tested file mask a weak one.

Excluded from coverage, with reasoning:
- `**/*.css` — no logic, not testable.
- `src/vite-env.d.ts` — type-only ambient declarations, no runtime code.
- `src/main.tsx` — side-effecting at module scope (`createRoot(...).render(...)`), no exported function to call; testing it would only assert `createRoot` was invoked with a JSX tree, with no real behavior to break.
- `src/router.tsx` — static declarative route array, zero branches/functions; the route wiring is already exercised for real by the `App`/`Home`/`Detail` tests, which render under `MemoryRouter`.

One defensive guard is marked `/* v8 ignore next */` in `src/components/Carousel/Carousel.tsx` (the `if (!track) return` null-ref check) — React attaches the scroll track's ref during mount, before any click handler can fire, so the guard is unreachable from a real interaction and mocking a null ref gets silently overwritten by React's own commit phase.

## Writing tests

Invoke the `ts-test-structure` skill when:
- Adding test coverage for a function, component, or hook.
- Organizing or restructuring test files.
- Setting up mocks or spies.

Example: `Add tests for useVideos hook` → skill scaffolds `src/hooks/useVideos.test.tsx` using `renderHook` + a local `QueryClientProvider` wrapper, spies on `getVideos` from `api/tmdb.ts`, and asserts the `enabled` gating behavior.
