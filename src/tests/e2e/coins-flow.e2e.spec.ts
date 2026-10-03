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

  test("authenticated user sees coins display and can access generate form", async ({ page, isMobile }) => {
    // 1. Visit stamp page
    await page.goto("/stamp");
    if (isMobile) {
      await page.getByRole("button", { name: /begin customiz/i }).click();
      await page.getByRole("button", { name: /skip upload/i }).click();
    }

    // 2. Navigate to synthesis section
    await page.locator("#step-2").scrollIntoViewIfNeeded();

    // 3. Wait for page to load
    await page.waitForTimeout(2000);

    // 4. Verify coins display is visible
    const coinsDisplay = page.locator('[data-testid="coins-display"]:visible').first();
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

    const coinsDisplay = page.locator('[data-testid="coins-display"]:visible').first();
    await expect(coinsDisplay).toBeVisible({ timeout: 10000 });

    // Verify format is "X / 5" where X is 0-5
    const coinsText = await coinsDisplay.textContent();
    expect(coinsText).toMatch(/\d+ Coins available/);

    // Verify "Daily coins" label is present
    expect(coinsText).toContain("Coins available");
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

    test("stamp route redirects to the homepage", async ({ page }) => {
      await page.goto("/stamp");
      await expect(page).toHaveURL(/\/\?redirectedFrom=%2Fstamp$/);
      await expect(page.locator("#step-2")).toHaveCount(0);
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

    const coinsDisplay = page.locator('[data-testid="coins-display"]:visible').first();
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

      const coinsDisplay = page.locator('[data-testid="coins-display"]:visible').first();
      await expect(coinsDisplay).toBeVisible({ timeout: 10000 });
    });

  });
});
