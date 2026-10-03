import { expect, test } from "@playwright/test";
import { mockImageGeneration } from "@/tests/e2e/helpers/mockImageGeneration";

/**
 * Tote Bag Preview Configuration Tests
 *
 * Verifies that the tote bag product configuration is correct.
 * Uses the existing design-adjustment test approach but for tote bags.
 */

test.describe("Tote Bag Preview Configuration", () => {
  test("verifies tote bag preview configuration in step 6", async ({ page, isMobile }) => {
    test.skip(isMobile, "Print-area geometry is rendered in the desktop preview");
    test.setTimeout(90_000);
    await mockImageGeneration(page, "Simple geometric pattern");
    await page.route("**/rest/v1/catalog_products?*", async (route) => {
      const response = await route.fetch();
      const products = await response.json();
      if (!Array.isArray(products)) {
        await route.fulfill({ response });
        return;
      }
      await route.fulfill({
        response,
        json: products.map((product) =>
          product.display_title === "Canvas Tote Bag"
            ? { ...product, blueprint_id: 553 }
            : product,
        ),
      });
    });
    // Go to stamp page
    await page.goto("/stamp");
    await expect(page.getByRole("button", { name: /logout from your account/i })).toBeVisible({ timeout: 20_000 });

    // Hero -> Step 1: Click begin customization CTA
    await page.getByRole("button", { name: /begin customiz/i }).click();

    // Step 1 -> Step 2: Skip upload (no image uploaded)
    await page.getByRole("button", { name: /skip upload/i }).click();

    // Step 2 -> 3: seed a prompt and generate
    await page.getByRole("textbox", { name: /prompt input/i }).fill(
      "Simple geometric pattern",
    );
    await page.getByRole("button", { name: /stamp it/i }).click();

    // Step 4: pick the first result (generation takes time)
    // Button text is "Use this image"
    await page.getByRole("button", { name: /use this image/i }).first().click({
      timeout: 180_000,
    });

    // Step 5: Find and select a tote bag product
    const step5 = page.locator("#step-5");
    const toteBagButton = step5.getByRole("button", { name: /select canvas tote bag/i });
    const continueButton = step5.getByRole("button", { name: /continue to customization/i });
    await toteBagButton.click();
    await expect(continueButton).toBeEnabled({ timeout: 10_000 }).catch(async () => {
      // Catalog refreshes can replace a card immediately after selection.
      if (await toteBagButton.isVisible()) await toteBagButton.click();
    });
    await expect(continueButton).toBeEnabled({ timeout: 30_000 });
    await continueButton.click();

    // Verify step 6 is visible
    await expect(page.locator("#step-6")).toBeVisible();

    // Verify the design overlay exists and check its positioning
    const designOverlay = page.getByTestId("design-overlay");
    await expect(designOverlay).toBeVisible({ timeout: 5_000 });

    // Get the placement values
    const style = await designOverlay.evaluate((el) => ({
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
    }));

    // With x: 0.5, y: 0.5 and scale: 0.5, expected values:
    // The default placement keeps the design centered within the safe area.
    expect(style.left).toBe("50%");
    expect(style.top).toBe("50%");
    expect(style.width).toBe("50%");

    // Verify print area positioning
    const printArea = page.getByTestId("print-area");
    await expect(printArea).toBeVisible();

    const printAreaStyle = await printArea.evaluate((el) => ({
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
    }));

    // Expected tote print area: left: 22%, top: 32%, width: 56%, height: 52%
    expect(printAreaStyle.left).toBe("22%");
    expect(printAreaStyle.top).toBe("32%");
    expect(printAreaStyle.width).toBe("56%");
    expect(printAreaStyle.height).toBe("52%");

    // Take screenshot for visual verification
    await page.screenshot({ path: "test-results/tote-bag-preview-final.png" });
  });
});
