import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// Load Next.js environment files (.env.local, etc.)
loadEnvConfig(process.cwd());

/**
 * Playwright configuration for navigation tests (no auth required)
 */
export default defineConfig({
  testDir: "./src",
  testMatch: "**/*navigation*.e2e.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on",
    screenshot: "on",
    video: "on",
  },

  projects: [
    {
      name: "chromium-no-auth",
      use: {
        ...devices["Desktop Chrome"],
        // No storage state - bypasses auth
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
