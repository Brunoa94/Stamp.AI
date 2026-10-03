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
import { existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Resolve relative to the repo root, not the source file location.
// auth.setup.ts is at src/features/auth/auth.setup.ts → root is 3 levels up.
const AUTH_FILE = path.resolve(__dirname, "../../../playwright/.auth/user.json");

setup("authenticate", async ({ browser, page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    setup.skip(
      true,
      "Skipping auth setup: TEST_USER_EMAIL and TEST_USER_PASSWORD are not configured.",
    );
  }

  // Reuse a still-valid session so repeated local runs do not consume the
  // server's login rate limit.
  if (existsSync(AUTH_FILE)) {
    const savedContext = await browser.newContext({ storageState: AUTH_FILE });
    try {
      const savedPage = await savedContext.newPage();
      await savedPage.goto("/orders");
      if (new URL(savedPage.url()).pathname === "/orders") {
        await savedContext.storageState({ path: AUTH_FILE });
        return;
      }
    } finally {
      await savedContext.close();
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("E2E authentication requires test Supabase URL and anon key.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });
  if (error || !data.session) {
    throw new Error(`E2E login failed: ${error?.message ?? "no session returned"}`);
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
  await page.context().addCookies([{
    name: `sb-${projectRef}-auth-token`,
    value: `base64-${Buffer.from(JSON.stringify(data.session)).toString("base64url")}`,
    url: baseURL,
    sameSite: "Lax",
  }]);
  await page.goto("/orders");
  await expect(page).toHaveURL(/\/orders(?:\?|$)/);

  await page.context().storageState({ path: AUTH_FILE });
});
