/**
 * ========================================================================
 * Stamp Coins E2E Tests
 * ========================================================================
 * End-to-end tests for the coins flow in the Stamp feature.
 * Tests authentication overlays, coins display, and generation flow.
 */

import { test, expect } from "@playwright/test";

test.describe("Stamp Coins Flow", () => {
  /**
   * ========================================================================
   * Unauthenticated User Tests
   * ========================================================================
   */

  test.describe("Unauthenticated user", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("redirects visitors to the homepage before showing the stamp form", async ({ page }) => {
      await page.goto("/stamp");
      await expect(page).toHaveURL(/\/\?redirectedFrom=%2Fstamp$/);
      await expect(page.locator("#step-2")).toHaveCount(0);
    });
  });

  /**
   * ========================================================================
   * Authenticated User Tests
   * ========================================================================
   * These tests use the default authenticated state from auth.setup.ts
   */

  test.describe("Authenticated user with coins", () => {
    test("should display coins count", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for coins display to be visible
      const coinsDisplay = page.locator('[data-testid="coins-display"]:visible').first();
      await expect(coinsDisplay).toBeVisible({ timeout: 10000 });

      // Should contain a number
      const coinsText = await coinsDisplay.textContent();
      expect(coinsText).toMatch(/\d+ Coins available/);
    });

    test("should not show login overlay for authenticated user", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Login overlay should not be visible
      const loginOverlay = page.getByTestId("coins-overlay-login");
      await expect(loginOverlay).not.toBeVisible();
    });

    test("should have Generate button enabled when user has coins and prompt", async ({ page, isMobile }) => {
      await page.goto("/stamp");
      if (isMobile) {
        await page.getByRole("button", { name: /begin customiz/i }).click();
        await page.getByRole("button", { name: /skip upload/i }).click();
      }
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for form to be ready
      await page.waitForTimeout(2000);

      // Fill in a prompt
      const promptInput = page.getByRole("textbox").first();
      await promptInput.fill("A beautiful sunset over mountains");

      // Generate button should be enabled
      const generateButton = page.getByRole("button", { name: /stamp it|generate/i });
      await expect(generateButton).toBeEnabled();
    });

    test("should disable Generate button when prompt is empty", async ({ page, isMobile }) => {
      await page.goto("/stamp");
      if (isMobile) {
        await page.getByRole("button", { name: /begin customiz/i }).click();
        await page.getByRole("button", { name: /skip upload/i }).click();
      }
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for form to be ready
      await page.waitForTimeout(2000);

      // Clear any existing prompt
      const promptInput = page.getByRole("textbox").first();
      await promptInput.clear();

      // Generate button should be disabled
      const generateButton = page.getByRole("button", { name: /stamp it|generate/i });
      await expect(generateButton).toBeDisabled();
    });
  });

});
