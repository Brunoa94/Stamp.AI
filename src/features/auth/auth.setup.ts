/**
 * Auth setup – runs once before all test projects.
 * Logs in via the sign-in page and stores the Supabase session cookies
 * in playwright/.auth/user.json so every test reuses the same authenticated
 * browser state without re-logging in.
 *
 * Required env vars:
 *   TEST_USER_EMAIL
 *   TEST_USER_PASSWORD
 */
import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD env vars must be set to run E2E tests.",
    );
  }

  await page.goto("/auth/sign-in");

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait until we land on an authenticated page
  await page.waitForURL(/\/(stamp|dashboard|orders)/, { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
