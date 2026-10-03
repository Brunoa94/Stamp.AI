import { expect, test } from "@playwright/test";
import { mockImageGeneration } from "@/tests/e2e/helpers/mockImageGeneration";

/**
 * Design Adjustment Panel (Step 6) E2E
 *
 * Requires an authenticated session (see playwright auth.setup) and drives
 * the stamp flow to Step 6 with a generated design and a selected t-shirt.
 */

async function goToCustomizationStep(page: import("@playwright/test").Page) {
  await mockImageGeneration(page, "Minimal line drawing of a mountain");
  await page.goto("/stamp");
  await expect(page.getByRole("button", { name: /logout from your account/i })).toBeVisible({ timeout: 20_000 });

  // Hero -> Step 1: Click begin customization CTA
  await page.getByRole("button", { name: /begin customiz/i }).click();

  // Step 1 -> Step 2: Skip upload (no image uploaded)
  await page.getByRole("button", { name: /skip upload/i }).click();

  // Step 2 -> 3: seed a prompt and generate
  await page.getByRole("textbox", { name: /prompt input/i }).fill(
    "Minimal line drawing of a mountain",
  );
  await page.getByRole("button", { name: /stamp it/i }).click();

  // Step 4: pick the first result (generation can take a while)
  await page.getByRole("button", { name: /use this image/i }).first().click({
    timeout: 180_000,
  });

  // Step 5: pick the first product
  await page.locator("#step-5").getByRole("button", { name: /select .*tee/i }).first().click();
  await page.getByRole("button", { name: /continue to customization/i }).click();

  await expect(page.locator("#step-6")).toBeVisible();
}

test.describe("Design Adjustment Panel", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await goToCustomizationStep(page);
  });

  test("shows the available print positions for the selected product", async ({ page, isMobile }) => {
    await expect(
      page.getByRole("radio", { name: /print on front/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: /print on back/i }),
    ).toBeVisible();
    if (!isMobile) {
      for (const name of [/move up/i, /move down/i, /move left/i, /move right/i]) {
        await expect(page.getByRole("button", { name })).toHaveAttribute("aria-label");
      }
    }
  });

  test("switches between front and back printing (single-select)", async ({ page }) => {
    const front = page.getByRole("radio", { name: /print on front/i });
    const back = page.getByRole("radio", { name: /print on back/i });
    await expect(front).toHaveAttribute("aria-checked", "true");

    await back.click();
    await expect(back).toHaveAttribute("aria-checked", "true");
    await expect(front).toHaveAttribute("aria-checked", "false");
    await page.screenshot({ path: "test-results/position-back-selected.png" });

    await front.click();
    await expect(front).toHaveAttribute("aria-checked", "true");
    await expect(back).toHaveAttribute("aria-checked", "false");
  });

  test("shows the back silhouette while the back is selected", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop placement controls are covered by this case");
    const silhouette = page.getByTestId("product-silhouette");
    await expect(silhouette).toHaveAttribute("data-silhouette-key", "apparel");

    await page.getByRole("radio", { name: /print on back/i }).click();
    await expect(silhouette).toHaveAttribute(
      "data-silhouette-key",
      "apparel-back",
    );
  });

  test("updates the preview when adjusting placement", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop placement controls are covered by this case");
    const overlay = page.getByTestId("design-overlay");
    const before = await overlay.evaluate((el) => el.style.top);

    await page.getByRole("button", { name: /move up/i }).click();

    const after = await overlay.evaluate((el) => el.style.top);
    expect(after).not.toBe(before);
    await page.screenshot({ path: "test-results/placement-adjusted.png" });
  });

  test("prevents placement outside the safe zone", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop placement controls are covered by this case");
    const moveUp = page.getByRole("button", { name: /move up/i });
    for (let i = 0; i < 10; i += 1) {
      await moveUp.click();
    }
    await expect(page.getByText(/safe print area/i)).toBeVisible();
  });

  test("resets placement to the default", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop placement controls are covered by this case");
    const overlay = page.getByTestId("design-overlay");
    const initial = await overlay.evaluate((el) => el.style.top);

    await page.getByRole("button", { name: /move up/i }).click();
    await page.getByRole("button", { name: /reset placement/i }).click();

    const after = await overlay.evaluate((el) => el.style.top);
    expect(after).toBe(initial);
  });

  test("creates the product with a back print", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop placement controls are covered by this case");
    await page.route("**/functions/v1/upload-printify-image", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          image: {
            id: "test-print-image",
            file_name: "test.png",
            width: 512,
            height: 512,
            size: 1024,
            mime_type: "image/png",
            preview_url: "https://placehold.co/512x512/png",
          },
        }),
      }),
    );
    await page.route("**/functions/v1/create-custom-product", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          product: {
            id: "test-back-print",
            title: "Test Back Print",
            variants: [{ id: 1, title: "Black / M", price: 2499, is_enabled: true }],
            images: [{ src: "https://placehold.co/512x512/png", position: "back", is_default: true }],
          },
        }),
      }),
    );
    await page.route("**/rest/v1/products?*", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 403, body: "test product stays local" })
        : route.continue(),
    );
    await page.getByRole("radio", { name: /print on back/i }).click();
    await page.getByRole("button", { name: /move up/i }).click();

    await page.getByRole("button", { name: /create product/i }).click();

    await expect(page.locator("#step-7")).toBeVisible();
    await expect(page.locator("#step-8")).toBeVisible({ timeout: 130_000 });
  });

});
