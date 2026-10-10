import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Integration test config: only the `*.integration.test.ts` suites, which
 * talk to a live Supabase project. Requires NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY; without them the suites skip themselves
 * (see src/tests/integration/setup-auth.ts).
 *
 * Run with `npm run test:integration`.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.integration.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
