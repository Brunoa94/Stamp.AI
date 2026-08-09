import { expect, test } from "@playwright/test";

/**
 * Design Adjustment Panel (Step 6) E2E
 *
 * Requires an authenticated session (see playwright auth.setup) and drives
 * the stamp flow to Step 6 with a generated design and a selected t-shirt.
 */

async function goToCustomizationStep(page: import("@playwright/test").Page) {
  await page.goto("/stamp");

  // Step 1 -> 2: skip upload, start from a prompt
  await page.getByRole("button", { name: /begin customizing/i }).click();
  await page.getByRole("button", { name: /next step/i }).click();

  // Step 2 -> 3: seed a prompt and generate
  await page.getByRole("textbox", { name: /prompt input/i }).fill(
    "Minimal line drawing of a mountain",
  );
  await page.getByRole("button", { name: /generate/i }).click();

  // Step 4: pick the first result (generation can take a while)
  await page.getByRole("button", { name: /use this prompt/i }).first().click({
    timeout: 120_000,
  });

  // Step 5: pick the first product
  await page.locator("#step-5").getByRole("button").first().click();

  await expect(page.locator("#step-6")).toBeVisible();
}

test.describe("Design Adjustment Panel", () => {
  test.beforeEach(async ({ page }) => {
    await goToCustomizationStep(page);
  });

  test("shows the available print positions for the selected product", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /toggle front print/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /toggle back print/i }),
    ).toBeVisible();
  });

  test("toggles print positions on and off", async ({ page }) => {
    const back = page.getByRole("button", { name: /toggle back print/i });
    await back.click();
    await expect(back).toHaveAttribute("aria-pressed", "true");
    await page.screenshot({ path: "test-results/position-toggle.png" });

    await back.click();
    await expect(back).toHaveAttribute("aria-pressed", "false");
  });

  test("updates the preview when adjusting placement", async ({ page }) => {
    const overlay = page.getByTestId("design-overlay");
    const before = await overlay.evaluate((el) => el.style.top);

    await page.getByRole("button", { name: /move up/i }).click();

    const after = await overlay.evaluate((el) => el.style.top);
    expect(after).not.toBe(before);
    await page.screenshot({ path: "test-results/placement-adjusted.png" });
  });

  test("prevents placement outside the safe zone", async ({ page }) => {
    const moveUp = page.getByRole("button", { name: /move up/i });
    for (let i = 0; i < 10; i += 1) {
      await moveUp.click();
    }
    await expect(page.getByText(/safe print area/i)).toBeVisible();
  });

  test("resets placement to the default", async ({ page }) => {
    const overlay = page.getByTestId("design-overlay");
    const initial = await overlay.evaluate((el) => el.style.top);

    await page.getByRole("button", { name: /move up/i }).click();
    await page.getByRole("button", { name: /reset placement/i }).click();

    const after = await overlay.evaluate((el) => el.style.top);
    expect(after).toBe(initial);
  });

  test("creates the product with custom placements", async ({ page }) => {
    await page.getByRole("button", { name: /toggle back print/i }).click();
    await page.getByRole("button", { name: /move up/i }).click();

    await page.getByRole("button", { name: /create product/i }).click();

    await expect(page.locator("#step-7")).toBeVisible();
    await expect(page.locator("#step-8")).toBeVisible({ timeout: 130_000 });
  });

  test("adjustment controls are labelled for assistive tech", async ({ page }) => {
    for (const name of [/move up/i, /move down/i, /move left/i, /move right/i]) {
      await expect(page.getByRole("button", { name })).toHaveAttribute(
        "aria-label",
      );
    }
  });
});
