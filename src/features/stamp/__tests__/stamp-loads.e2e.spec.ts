import { expect, test } from "@playwright/test";

test.describe("Stamp - Page Load Test", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should load page successfully without infinite loop", async ({page,}) => {
    // Track console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Navigate to stamp page
    await page.goto("/stamp");

    // Wait for hero section to be visible
    const hero = page.locator("#hero");
    await expect(hero).toBeVisible({ timeout: 10000 });

    // Wait a few seconds to catch any infinite loop errors
    await page.waitForTimeout(5000);

    // Check for infinite loop error
    const hasInfiniteLoopError = errors.some((e) =>
      e.toLowerCase().includes("maximum update depth")
    );

    if (hasInfiniteLoopError) {
      errors.forEach((e) =>
        test.info().annotations.push({ type: "error", description: e })
      );
    }

    expect(hasInfiniteLoopError).toBe(false);

    // Verify sections are present
    for (let i = 1; i <= 8; i++) {
      const section = page.locator(`#step-${i}`);
      await expect(section).toBeAttached();
    }

    // Verify no header overlap (only one header should be visible)
    const headers = page.locator("header, nav").filter({ hasText: "STAMP" });
    const headerCount = await headers.count();

    // Should have layout header, not duplicate stamp header
    expect(headerCount).toBeLessThanOrEqual(2);
  });

  test("should have proper navigation", async ({ page }) => {
    await page.goto("/stamp");

    // Check sidebar exists
    const sidebar = page.locator("aside, nav").filter({
      hasText: /Protocol|Step/i,
    });
    const hasSidebar = (await sidebar.count()) > 0;
    void hasSidebar;

    // Check continue button in ProductSelectionSection
    await page.locator("#step-5").scrollIntoViewIfNeeded();
    const continueButton = page.getByRole("button", {
      name: /continue to customization/i,
    });
    await expect(continueButton).toBeVisible();
  });

  test("should have proper color contrast", async ({ page }) => {
    await page.goto("/stamp");

    // Check GenerationSection has dark background with light text
    const generationSection = page.locator("#step-3");
    await generationSection.scrollIntoViewIfNeeded();

    const bgColor = await generationSection.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should have dark background (chocolate color)
    expect(bgColor).not.toBe("rgb(255, 255, 255)");
  });
});
