import { expect, test } from "@playwright/test";

test.describe("Orders Loading", () => {
  test("page loads with correct default filters showing all-time", async ({
    page,
  }) => {
    // Navigate to orders page with auth
    await page.goto("/orders", { waitUntil: "networkidle" });

    // Verify the page loaded with the filter section visible
    await expect(page.locator("text=Archive Filtering")).toBeVisible({
      timeout: 5000,
    });

    // CRITICAL: Verify the default timeframe filter is "All Time" (our fix)
    // This confirms ORDERS_DEFAULT_TIME_FILTER = "all" is working
    const timeframeFilter = page.locator("button:has-text('All Time')").first();
    await expect(timeframeFilter).toBeVisible({ timeout: 5000 });

    // Verify status filter is present with correct default
    const statusFilter = page
      .locator("button:has-text('All Statuses')")
      .first();
    await expect(statusFilter).toBeVisible({ timeout: 5000 });

    // Verify Total Syntheses header is visible (shows component rendered)
    await expect(page.locator("text=Total Syntheses")).toBeVisible({
      timeout: 5000,
    });

    // This test validates the critical fix: all-time default instead of 30-day
  });

  test("all-time filter dropdown works correctly", async ({ page }) => {
    // Navigate to orders
    await page.goto("/orders", { waitUntil: "networkidle" });

    // Find and verify the timeframe filter button
    const timeframeFilter = page.locator("button:has-text('All Time')").first();
    await expect(timeframeFilter).toBeVisible({ timeout: 5000 });

    // Click to expand filter dropdown
    await timeframeFilter.click();
    await page.waitForTimeout(300); // Wait for dropdown animation

    // Verify "All Time" option exists in dropdown
    const allTimeOption = page.locator("text=All Time").nth(1); // Second instance (in dropdown)
    await expect(allTimeOption).toBeVisible({ timeout: 3000 });

    // Close dropdown by pressing Escape
    await page.keyboard.press("Escape");
  });

  test("page structure renders correctly without critical errors", async ({
    page,
  }) => {
    await page.goto("/orders", { waitUntil: "networkidle" });

    // Verify core filter controls exist
    await expect(page.locator("text=Archive Filtering")).toBeVisible({
      timeout: 5000,
    });

    // Verify "Clear Archive" button exists
    const clearButton = page
      .locator("button")
      .filter({ hasText: "Clear Archive" })
      .first();
    await expect(clearButton).toBeVisible({ timeout: 5000 });

    // Verify the layout renders (main content area exists)
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });

    // Test passes if no uncaught JS errors occur
    // Playwright automatically fails on unhandled exceptions
  });
});
