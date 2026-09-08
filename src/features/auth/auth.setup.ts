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

  // Check if already authenticated
  const isAlreadyAuth = await page
    .getByRole("button", { name: /logout|sign out/i })
    .isVisible({ timeout: 5_000 })
    .catch(() => false);

  if (isAlreadyAuth) {
    console.log("User already authenticated, skipping login flow.");
  } else {
    // Need to login
    const openLoginButton = page
      .getByRole("button", { name: /open login dialog|login/i })
      .first();
    await openLoginButton.click();

    const loginDialog = page.getByRole("dialog").first();
    await loginDialog.getByLabel(/email/i).fill(email ?? "");
    await loginDialog.locator("#password").fill(password ?? "");
    await loginDialog.getByRole("button", { name: /^login$/i }).click();

    const signOutButton = page.getByRole("button", { name: /sign out|logout/i });
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
  }

  // Validate authenticated session by checking for logout button presence
  const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
  await expect(logoutButton).toBeVisible({ timeout: 5_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
