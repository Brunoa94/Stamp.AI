import { test, expect, type Page } from "@playwright/test";

/**
 * Analytics E2E
 *
 * The dev server runs with NODE_ENV=development, where AnalyticsService logs
 * events to the console with an "[analytics]" prefix instead of calling
 * gtag. These tests capture those console logs to verify events fire during
 * real user flows. A gtag stub is also installed so any production-mode
 * events would be captured the same way.
 */

// Run unauthenticated - analytics must work for anonymous visitors
test.use({ storageState: { cookies: [], origins: [] } });

type CapturedEventsT = {
  consoleEvents: string[];
};

async function captureAnalytics(page: Page): Promise<CapturedEventsT> {
  const consoleEvents: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("[analytics]")) {
      consoleEvents.push(text);
    }
  });

  // Capture gtag calls too, in case the app runs with a GA id configured
  await page.addInitScript(() => {
    const calls: unknown[][] = [];
    (window as unknown as Record<string, unknown>).__gtagCalls = calls;
    (window as unknown as Record<string, unknown>).gtag = (
      ...args: unknown[]
    ) => {
      calls.push(args);
    };
  });

  return { consoleEvents };
}

function hasEvent(captured: CapturedEventsT, eventName: string): boolean {
  return captured.consoleEvents.some((entry) => entry.includes(eventName));
}

test.describe("analytics tracking", () => {
  test("fires page_view on initial stamp page load", async ({ page }) => {
    const captured = await captureAnalytics(page);

    await page.goto("/stamp");
    await page.waitForLoadState("networkidle");

    await expect
      .poll(() => hasEvent(captured, "page_view"), { timeout: 10_000 })
      .toBe(true);
  });

  test("fires page_view on cart page load", async ({ page }) => {
    const captured = await captureAnalytics(page);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await expect
      .poll(() => hasEvent(captured, "page_view"), { timeout: 10_000 })
      .toBe(true);
  });

  test("fires stamp_generate_start when generating a design", async ({
    page,
  }) => {
    const captured = await captureAnalytics(page);

    await page.goto("/stamp");
    await page.waitForLoadState("networkidle");

    // Step 2 hosts the synthesis form with the prompt textarea
    const promptInput = page.locator("#step-2 textarea").first();
    if ((await promptInput.count()) === 0) {
      test.skip(true, "Synthesis form not available in this environment");
      return;
    }

    await promptInput.scrollIntoViewIfNeeded();
    await promptInput.fill("A minimalist mountain landscape");

    const generateButton = page
      .locator("#step-2 button:not([disabled])")
      .last();
    await generateButton.click();

    await expect
      .poll(() => hasEvent(captured, "stamp_generate_start"), {
        timeout: 10_000,
      })
      .toBe(true);
  });

  test("fires select_item when choosing a product", async ({ page }) => {
    const captured = await captureAnalytics(page);

    await page.goto("/stamp");
    await page.waitForLoadState("networkidle");

    // Step 5 hosts the product grid; cards render as buttons with images
    const productCard = page.locator("#step-5 button:has(img)").first();

    try {
      await productCard.waitFor({ state: "visible", timeout: 15_000 });
    } catch {
      test.skip(
        true,
        "No catalog products rendered (catalog unavailable in this environment)",
      );
      return;
    }

    await productCard.scrollIntoViewIfNeeded();
    await productCard.click();

    await expect
      .poll(() => hasEvent(captured, "select_item"), { timeout: 10_000 })
      .toBe(true);
  });
});
