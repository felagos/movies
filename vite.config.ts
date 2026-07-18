import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // react-compiler's memoization-check branches are compiler artifacts, not source
    // logic — they inflate branch-coverage misses under test, so skip them in Vitest.
    ...(process.env.VITEST ? [] : [babel({ presets: [reactCompilerPreset()] })]),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      VITE_TMDB_TOKEN: 'test-token',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.css',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/router.tsx',
        'src/test/**',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
        perFile: true,
      },
    },
  },
})
