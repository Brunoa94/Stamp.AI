import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".", testMatch: "*.spec.mjs", workers: 1, reporter: "list",
  use: { baseURL: "http://127.0.0.1:3104", bypassCSP: true },
  webServer: [
    { cwd: root, command: "node tests/promotions/fixture-server.mjs", url: "http://127.0.0.1:55432/health", reuseExistingServer: false },
    { cwd: root, command: "npm run dev -- --webpack --hostname 127.0.0.1 --port 3104", url: "http://127.0.0.1:3104", reuseExistingServer: false,
      env: { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:55432", NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon",
        SUPABASE_SERVICE_ROLE_KEY: "fixture-service",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fixture", REVALIDATION_SECRET: "fixture-revalidation", NEXT_DIST_DIR: ".next-webpack" }, timeout: 120000 },
  ],
});
