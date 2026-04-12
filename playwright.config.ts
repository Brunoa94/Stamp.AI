import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// Load Next.js environment files (.env.local, etc.)
loadEnvConfig(process.cwd());

/**
 * Playwright configuration for the Stamp.AI E2E test suite.
 *
 * Environment variables:
 *   BASE_URL          - override the dev server URL (default: http://localhost:3000)
 *   TEST_USER_EMAIL   - Supabase test user email
 *   TEST_USER_PASSWORD- Supabase test user password
 */
export default defineConfig({
  testDir: "./src",
  testMatch: "**/*.e2e.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },

  projects: [
    // Auth setup project – runs once, saves session to file
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
    },

    // Main test project – reuses authenticated session
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // Mobile viewport project for responsive tests
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
