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

// Resolve relative to the repo root, not the source file location.
// auth.setup.ts is at src/features/auth/auth.setup.ts → root is 3 levels up.
const AUTH_FILE = path.resolve(__dirname, "../../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    setup.skip(
      true,
      "Skipping auth setup: TEST_USER_EMAIL and TEST_USER_PASSWORD are not configured.",
    );
  }

  await page.goto("/");

  const openLoginButton = page
    .getByRole("button", { name: /open login dialog|login/i })
    .first();
  await openLoginButton.click();

  const loginDialog = page.getByRole("dialog").first();
  await loginDialog.getByLabel(/email/i).fill(email ?? "");
  await loginDialog.locator("#password").fill(password ?? "");
  await loginDialog.getByRole("button", { name: /^login$/i }).click();

  const signOutButton = page.getByRole("button", { name: /sign out/i });
  const loginError = loginDialog.getByRole("alert");

  const authResult = await Promise.race([
    signOutButton
      .waitFor({ state: "visible", timeout: 20_000 })
      .then(() => "success" as const),
    loginError
      .waitFor({ state: "visible", timeout: 20_000 })
      .then(() => "error" as const),
  ]).catch(() => "timeout" as const);

  if (authResult !== "success") {
    const errorText = (await loginError.textContent())?.trim();
    throw new Error(
      errorText
        ? `E2E login failed: ${errorText}`
        : "E2E login failed: unable to authenticate with provided test credentials.",
    );
  }

  // Validate authenticated session by opening a protected page and ensuring wizard is visible.
  await page.goto("/stamp");
  await expect(page.locator("#design-pipeline")).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
