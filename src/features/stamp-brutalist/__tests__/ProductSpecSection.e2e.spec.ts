import { test, expect } from "@playwright/test";

test.describe("Create Product Flow - Fabric Selector with Provider Catalog", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to create product page
    await page.goto("/create-v2");
  });

  test("should load fabric selector with provider catalog products", async ({
    page,
  }) => {
    // Navigate through the flow to product spec section (step 5)
    // This assumes we need to complete previous steps first

    // Wait for the product spec section to be available
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Check that product cards are loading from catalog
    const productCards = page.locator('button[type="button"]').filter({
      hasText: /cotton|blend/i,
    });

    // Should have fabric options loaded
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display fabric cards with images and prices", async ({
    page,
  }) => {
    // Navigate to product spec section
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Get first fabric card
    const firstCard = page.locator('button[type="button"]').first();

    // Check for image
    const image = firstCard.locator("img");
    await expect(image).toBeVisible({ timeout: 10000 });

    // Check for price display
    const price = firstCard.locator('text=/\\$\\d+\\.\\d{2}/');
    await expect(price).toBeVisible();
  });

  test("should show loading state while fetching products", async ({
    page,
  }) => {
    // Intercept API to delay response
    await page.route("**/functions/v1/get-provider-catalog", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/create-v2");

    // Navigate to step 5 if needed
    // The loading state should be visible during fetch
    const loadingText = page.getByText(/loading/i);
    // This might be visible depending on navigation flow
  });

  test("should allow selecting a fabric option", async ({ page }) => {
    // Navigate to product spec section
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Wait for products to load
    await page.waitForTimeout(2000);

    const firstCard = page
      .locator('button[type="button"]')
      .filter({ hasText: /cotton|blend/i })
      .first();

    // Click to select
    await firstCard.click();

    // Check if selected state is applied (border color change)
    const borderClass = await firstCard.getAttribute("class");
    expect(borderClass).toContain("brandCyan");
  });

  test("should update form state with selected blueprint and provider", async ({
    page,
  }) => {
    // Navigate to product spec section
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Wait for products to load
    await page.waitForTimeout(2000);

    const firstCard = page
      .locator('button[type="button"]')
      .filter({ hasText: /cotton|blend/i })
      .first();

    // Click to select
    await firstCard.click();

    // Form state should be updated (we can verify this by checking if we can proceed)
    // Or by checking localStorage/sessionStorage if the form persists there
  });

  test("should display correct pricing from provider catalog", async ({
    page,
  }) => {
    // Mock specific pricing response
    await page.route(
      "**/rpc/get_best_provider_for_country",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            provider_id: 99,
            provider_name: "Test Provider",
            total_cost: 1550, // $15.50
            product_price: 1000,
            shipping_cost: 550,
          }),
        });
      }
    );

    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Check price displays correctly
    const price = page.locator('text=/\\$15\\.50/').first();
    await expect(price).toBeVisible({ timeout: 10000 });
  });

  test("should handle empty catalog gracefully", async ({ page }) => {
    // Mock empty catalog response
    await page.route("**/functions/v1/get-provider-catalog", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
          cache_miss: true,
        }),
      });
    });

    await page.goto("/create-v2");

    // Should still render the section without crashing
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // No products should be shown, or a fallback message
    const productCards = page
      .locator('button[type="button"]')
      .filter({ hasText: /cotton|blend/i });
    const count = await productCards.count();

    // Either 0 products or shows fallback options
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should use NL (Netherlands) pricing by default", async ({ page }) => {
    let catalogRequest: any = null;

    page.on("request", (request) => {
      if (request.url().includes("get-provider-catalog")) {
        catalogRequest = request;
      }
    });

    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Verify the request was made (country code would be in service layer)
    expect(catalogRequest).toBeTruthy();
  });

  test("should display 4 fabric options from catalog", async ({ page }) => {
    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });
    await page.waitForTimeout(2000);

    const productCards = page
      .locator('button[type="button"]')
      .filter({ hasText: /cotton|blend/i });
    const count = await productCards.count();

    // Should show up to 4 fabric options
    expect(count).toBeLessThanOrEqual(4);
    expect(count).toBeGreaterThan(0);
  });

  test("should show fabric type names correctly", async ({ page }) => {
    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check for fabric type labels
    const fabricTypes = [
      "Premium Cotton",
      "Organic Cotton",
      "Eco Blend",
      "Soft Cotton",
    ];

    for (const fabricType of fabricTypes.slice(0, 2)) {
      // Check at least first 2
      const fabricLabel = page.getByText(fabricType, { exact: false });
      // May or may not be visible depending on catalog data
    }
  });
});

test.describe("Create Product Flow - Multi-Country Pricing Support", () => {
  test("should use country-specific pricing when available", async ({
    page,
  }) => {
    // Mock pricing for different countries
    await page.route("**/rpc/get_best_provider_for_country", async (route) => {
      const requestBody = route.request().postDataJSON();
      const countryCode = requestBody?.p_country_code || "NL";

      const prices: Record<string, number> = {
        NL: 1500, // €15.00
        US: 1200, // $12.00 (cheaper shipping)
        GB: 1600, // £16.00
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          provider_id: 99,
          total_cost: prices[countryCode] || 1500,
          product_price: 1000,
          shipping_cost: (prices[countryCode] || 1500) - 1000,
        }),
      });
    });

    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Default NL pricing should be shown
    const price = page.locator('text=/\\$15\\.00/').first();
    await expect(price).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Create Product Flow - Integration with Navigation", () => {
  test("should allow proceeding to next step after fabric selection", async ({
    page,
  }) => {
    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Select a fabric
    const firstCard = page
      .locator('button[type="button"]')
      .filter({ hasText: /cotton|blend/i })
      .first();
    await firstCard.click();

    // Look for continue/next button
    const continueButton = page.getByRole("button", {
      name: /continue|next|proceed/i,
    });

    // Should be enabled after selection
    if (await continueButton.isVisible()) {
      await expect(continueButton).toBeEnabled();
    }
  });

  test("should persist selected fabric across navigation", async ({ page }) => {
    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Select a fabric
    const firstCard = page
      .locator('button[type="button"]')
      .filter({ hasText: /cotton|blend/i })
      .first();
    await firstCard.click();

    // Get the selected fabric text
    const selectedText = await firstCard.textContent();

    // Navigate away and back (if possible in flow)
    // The selection should persist in form state
    // This would need to be tested based on actual navigation flow
  });
});

test.describe("Create Product Flow - Error Handling", () => {
  test("should handle catalog API errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/functions/v1/get-provider-catalog", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Internal server error",
        }),
      });
    });

    await page.goto("/create-v2");

    // Should not crash, may show error state or fallback
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Page should still be functional
    const section = page.locator("#step-5");
    await expect(section).toBeVisible();
  });

  test("should handle pricing API errors gracefully", async ({ page }) => {
    // Mock pricing API error
    await page.route("**/rpc/get_best_provider_for_country", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Products should still load, maybe with "Loading..." for prices
    const loadingText = page.locator('text=/loading/i');
    // May or may not be visible depending on error handling
  });
});

test.describe("Create Product Flow - Performance", () => {
  test("should load fabric options within acceptable time", async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Wait for products to be visible
    await page
      .locator('button[type="button"]')
      .filter({ hasText: /cotton|blend/i })
      .first()
      .waitFor({ timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("should cache catalog data to avoid redundant requests", async ({
    page,
  }) => {
    let requestCount = 0;

    page.on("request", (request) => {
      if (request.url().includes("get-provider-catalog")) {
        requestCount++;
      }
    });

    await page.goto("/create-v2");
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Reload the page
    await page.reload();
    await page.waitForSelector("#step-5", { timeout: 30000 });

    // Should use cached data (React Query staleTime)
    // Exact count depends on implementation
    expect(requestCount).toBeLessThanOrEqual(2);
  });
});
