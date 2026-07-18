# Testing

This project uses the `ts-test-structure` skill for organizing and writing test files.

## Test setup

- Test files use `.test.ts` or `.test.tsx` extension.
- Both Jest and Vitest are supported — the project currently uses **no test runner configured**, so add a test framework when needed.
- Use `ts-test-structure` skill to generate new test files or restructure existing ones.

## Test patterns

- **describe/test hierarchy**: Group related tests with `describe` blocks.
- **Mock lifecycle**: Set up mocks in `beforeEach`, clean up in `afterEach`.
- **Spy cleanup**: Call `afterAll` to clear timers if any test sets them.

## Writing tests

Invoke the `ts-test-structure` skill when:
- Adding test coverage for a function, component, or class.
- Organizing or restructuring test files.
- Setting up mocks or spies.
- Asking about Jest/Vitest conventions.

Example: `Add tests for useTrendingMovies hook` → skill detects Jest/Vitest and scaffolds the file with the right imports and structure.
