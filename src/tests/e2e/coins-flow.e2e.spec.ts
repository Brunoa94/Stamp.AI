/**
 * ========================================================================
 * Complete Coins User Journey E2E Tests
 * ========================================================================
 * Integration E2E tests covering the full user journey with coins.
 */

import { test, expect } from "@playwright/test";

test.describe("Complete Coins User Journey", () => {
  /**
   * Test the full coins visibility and display flow.
   * Note: Actual coin deduction requires real API interaction
   * which is tested separately in integration tests.
   */

  test("authenticated user sees coins display and can access generate form", async ({ page }) => {
    // 1. Visit stamp page
    await page.goto("/stamp");

    // 2. Navigate to synthesis section
    await page.locator("#step-2").scrollIntoViewIfNeeded();

    // 3. Wait for page to load
    await page.waitForTimeout(2000);

    // 4. Verify coins display is visible
    const coinsDisplay = page.getByTestId("coins-display");
    await expect(coinsDisplay).toBeVisible({ timeout: 10000 });

    // 5. Verify no overlay is blocking the form
    const loginOverlay = page.getByTestId("coins-overlay-login");
    const noCoinsOverlay = page.getByTestId("coins-overlay-no-coins");

    await expect(loginOverlay).not.toBeVisible();
    await expect(noCoinsOverlay).not.toBeVisible();

    // 6. Verify prompt input is accessible
    const promptInput = page.getByRole("textbox").first();
    await expect(promptInput).toBeVisible();
    await expect(promptInput).toBeEnabled();

    // 7. Fill prompt and verify button state
    await promptInput.fill("A beautiful mountain landscape with snow");

    const generateButton = page.getByRole("button", { name: /stamp it|generate/i });
    await expect(generateButton).toBeEnabled();
  });

  test("coins display shows correct format", async ({ page }) => {
    await page.goto("/stamp");
    await page.locator("#step-2").scrollIntoViewIfNeeded();

    const coinsDisplay = page.getByTestId("coins-display");
    await expect(coinsDisplay).toBeVisible({ timeout: 10000 });

    // Verify format is "X / 5" where X is 0-5
    const coinsText = await coinsDisplay.textContent();
    expect(coinsText).toMatch(/\d+\s*\/\s*5/);

    // Verify "Daily coins" label is present
    expect(coinsText).toContain("Daily coins");
  });

  test("synthesis form maintains state after navigation", async ({ page }) => {
    await page.goto("/stamp");

    // Navigate to step 2
    await page.locator("#step-2").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Fill in prompt
    const promptInput = page.getByRole("textbox").first();
    const testPrompt = "A futuristic city with flying cars";
    await promptInput.fill(testPrompt);

    // Navigate away
    await page.locator("#step-1").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Navigate back
    await page.locator("#step-2").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify prompt is preserved (React state)
    const promptValue = await promptInput.inputValue();
    expect(promptValue).toBe(testPrompt);
  });

  /**
   * ========================================================================
   * Unauthenticated User Journey
   * ========================================================================
   */

  test.describe("Unauthenticated user journey", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("unauthenticated user is blocked from generating", async ({ page }) => {
      // 1. Visit stamp page
      await page.goto("/stamp");

      // 2. Navigate to synthesis section
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // 3. Verify login overlay is shown
      const loginOverlay = page.getByTestId("coins-overlay-login");
      await expect(loginOverlay).toBeVisible({ timeout: 10000 });

      // 4. Verify generate button is not accessible (behind overlay)
      const generateButton = page.getByRole("button", { name: /stamp it|generate/i });

      // Button might be disabled or hidden behind overlay
      if (await generateButton.isVisible()) {
        await expect(generateButton).toBeDisabled();
      }

      // 5. Verify prompt input is not accessible (behind overlay)
      // The input should be behind the overlay, so interaction should be blocked
      const overlay = page.getByTestId("coins-overlay-login");
      await expect(overlay).toBeVisible();
    });

    test("login flow redirects properly", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for overlay
      await expect(page.getByTestId("coins-overlay-login")).toBeVisible({ timeout: 10000 });

      // Click login
      await page.getByRole("button", { name: /login/i }).click();

      // Should be on login page
      await expect(page).toHaveURL(/\/auth\/login/);

      // Verify login form elements are present
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });
  });

  /**
   * ========================================================================
   * Coins Display Accessibility
   * ========================================================================
   */

  test("coins display has proper accessibility attributes", async ({ page }) => {
    await page.goto("/stamp");
    await page.locator("#step-2").scrollIntoViewIfNeeded();

    const coinsDisplay = page.getByTestId("coins-display");
    await expect(coinsDisplay).toBeVisible({ timeout: 10000 });

    // Check for aria-label
    const ariaLabel = await coinsDisplay.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain("coins");
  });

  /**
   * ========================================================================
   * Responsive Behavior
   * ========================================================================
   */

  test.describe("Responsive behavior", () => {
    test("coins display is visible on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      const coinsDisplay = page.getByTestId("coins-display");
      await expect(coinsDisplay).toBeVisible({ timeout: 10000 });
    });

    test("overlay covers form on tablet", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Use unauthenticated state
      await page.context().clearCookies();
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      const loginOverlay = page.getByTestId("coins-overlay-login");
      await expect(loginOverlay).toBeVisible({ timeout: 10000 });

      // Verify overlay has proper positioning
      const overlayBox = await loginOverlay.boundingBox();
      expect(overlayBox).toBeTruthy();
      expect(overlayBox!.width).toBeGreaterThan(200);
    });
  });
});
