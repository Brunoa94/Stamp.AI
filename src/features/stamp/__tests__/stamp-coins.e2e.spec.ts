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
    // Use empty storage state to simulate unauthenticated user
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should show login overlay over prompt textarea", async ({ page }) => {
      await page.goto("/stamp");

      // Navigate to the synthesis section (step-2)
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for the overlay to be visible
      const overlay = page.getByTestId("coins-overlay-login");
      await expect(overlay).toBeVisible({ timeout: 10000 });

      // Verify login message is shown
      await expect(page.getByText(/login or register/i)).toBeVisible();
    });

    test("should render Login and Register buttons", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for overlay
      await expect(page.getByTestId("coins-overlay-login")).toBeVisible({ timeout: 10000 });

      // Check buttons
      await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /register/i })).toBeVisible();
    });

    test("should navigate to login page when Login clicked", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for overlay
      await expect(page.getByTestId("coins-overlay-login")).toBeVisible({ timeout: 10000 });

      // Click login button
      await page.getByRole("button", { name: /login/i }).click();

      // Verify navigation to login page
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should navigate to register page when Register clicked", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for overlay
      await expect(page.getByTestId("coins-overlay-login")).toBeVisible({ timeout: 10000 });

      // Click register button
      await page.getByRole("button", { name: /register/i }).click();

      // Verify navigation to register page
      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test("should not show coins display for unauthenticated user", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Coins display should not be visible
      const coinsDisplay = page.getByTestId("coins-display");
      await expect(coinsDisplay).not.toBeVisible();
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
      const coinsDisplay = page.getByTestId("coins-display");
      await expect(coinsDisplay).toBeVisible({ timeout: 10000 });

      // Should contain a number
      const coinsText = await coinsDisplay.textContent();
      expect(coinsText).toMatch(/\d+\s*\/\s*5/);
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

    test("should have Generate button enabled when user has coins and prompt", async ({ page }) => {
      await page.goto("/stamp");
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

    test("should disable Generate button when prompt is empty", async ({ page }) => {
      await page.goto("/stamp");
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

  /**
   * ========================================================================
   * Overlay Styling Tests
   * ========================================================================
   */

  test.describe("Overlay styling", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should have backdrop blur effect on overlay", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for overlay
      await expect(page.getByTestId("coins-overlay-login")).toBeVisible({ timeout: 10000 });

      // Check for backdrop blur class
      const backdropElement = page.locator(".backdrop-blur-md").first();
      await expect(backdropElement).toBeVisible();
    });

    test("should cover the form area with overlay", async ({ page }) => {
      await page.goto("/stamp");
      await page.locator("#step-2").scrollIntoViewIfNeeded();

      // Wait for overlay
      const overlay = page.getByTestId("coins-overlay-login");
      await expect(overlay).toBeVisible({ timeout: 10000 });

      // Check overlay has inset-0 positioning
      const overlayClasses = await overlay.getAttribute("class");
      expect(overlayClasses).toContain("absolute");
      expect(overlayClasses).toContain("inset-0");
    });
  });
});
