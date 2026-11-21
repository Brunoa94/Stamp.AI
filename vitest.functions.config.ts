import { defineConfig } from "vitest/config";

/**
 * Unit tests for the shared Edge Function helpers (supabase/functions/_shared).
 * They are plain TypeScript with no Deno-only imports, so vitest runs them in
 * CI. The per-function suites next to each index.ts import `jsr:`/URL modules
 * vitest cannot resolve and are not included.
 *
 * Run with `npm run test:functions`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["supabase/functions/_shared/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/*-integration.test.ts"],
  },
});
