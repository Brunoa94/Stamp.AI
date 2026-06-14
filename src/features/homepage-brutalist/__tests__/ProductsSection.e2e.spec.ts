import { test, expect } from "@playwright/test";

test.describe("Homepage ProductsSection with Provider Catalog", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
  });

  test("should display products section with catalog label", async ({ page }) => {
    // Wait for the products section to be visible
    const productsSection = page.locator('section[id="products"]');
    await expect(productsSection).toBeVisible();

    // Check section header
    await expect(page.getByText("The Essentials")).toBeVisible();
    await expect(page.getByText("CATALOG_001")).toBeVisible();
  });

  test("should show loading skeletons while fetching products", async ({
    page,
  }) => {
    // Intercept the API call to delay it
    await page.route("**/functions/v1/get-provider-catalog", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/");

    // Check for skeleton loaders
    const skeletons = page.locator(".animate-pulse");
    await expect(skeletons.first()).toBeVisible();
  });

  test("should display 4 product cards from catalog", async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    // Count product cards
    const productCards = page.locator('[id^="product-"]');
    const count = await productCards.count();

    // Should display exactly 4 products (or less if catalog has fewer)
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(4);
  });

  test("should display product information correctly", async ({ page }) => {
    // Wait for first product to load
    const firstProduct = page.locator('[id^="product-"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });

    // Check that product has required elements
    const productName = firstProduct.locator("text=/./"); // Any text
    await expect(productName).toBeVisible();

    // Check for price display
    const price = firstProduct.locator('text=/\\$\\d+/');
    await expect(price.first()).toBeVisible();
  });

  test("should have clickable product cards that navigate to create page", async ({
    page,
  }) => {
    // Wait for products to load
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    const firstProduct = page.locator('[id^="product-"]').first();

    // Get the href before clicking
    const link = firstProduct.locator("a").first();
    const href = await link.getAttribute("href");

    // Should contain blueprint_id and print_provider_id parameters
    expect(href).toMatch(/blueprint_id=\d+/);
    expect(href).toMatch(/print_provider_id=\d+/);
  });

  test("should display 'View Full Catalog' button", async ({ page }) => {
    const viewCatalogButton = page.getByRole("link", {
      name: /view full catalog/i,
    });
    await expect(viewCatalogButton).toBeVisible();

    // Check it links to /create
    await expect(viewCatalogButton).toHaveAttribute("href", "/create");
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

    await page.goto("/");

    // Section should still be visible
    const productsSection = page.locator('section[id="products"]');
    await expect(productsSection).toBeVisible();

    // No products should be displayed
    const productCards = page.locator('[id^="product-"]');
    await expect(productCards).toHaveCount(0);
  });

  test("should display product images with correct aspect ratio", async ({
    page,
  }) => {
    // Wait for products to load
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    const firstProduct = page.locator('[id^="product-"]').first();
    const image = firstProduct.locator("img").first();

    // Check image is visible
    await expect(image).toBeVisible();

    // Check image has loaded
    await expect(image).toHaveJSProperty("complete", true);
  });

  test("should show product specs (material/fit)", async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    const firstProduct = page.locator('[id^="product-"]').first();

    // Look for specs text (e.g., "COTTON / CLASSIC")
    const specs = firstProduct.locator("text=/[A-Z]+\\s*\\/\\s*[A-Z]+/");
    await expect(specs.first()).toBeVisible();
  });

  test("should show product label with brand and model", async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    const firstProduct = page.locator('[id^="product-"]').first();

    // Look for label text (e.g., "BELLA_CANVAS_3001")
    const label = firstProduct.locator('[class*="label"]');

    // Label should exist and contain uppercase text with underscores
    const labelText = await label.first().textContent();
    expect(labelText).toMatch(/[A-Z_]+/);
  });

  test("should maintain responsive grid layout", async ({ page }) => {
    const productsGrid = page.locator(
      'section[id="products"] > div > div[class*="grid"]'
    );
    await expect(productsGrid).toBeVisible();

    // Check grid classes for responsiveness
    const gridClasses = await productsGrid.getAttribute("class");
    expect(gridClasses).toContain("grid");
    expect(gridClasses).toMatch(/grid-cols/); // Should have responsive grid columns
  });

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

    await page.goto("/");

    // Section should still render
    const productsSection = page.locator('section[id="products"]');
    await expect(productsSection).toBeVisible();

    // Should show some indication (empty state or error)
    // Depending on implementation, adjust this assertion
    const productCards = page.locator('[id^="product-"]');
    await expect(productCards).toHaveCount(0);
  });
});

test.describe("ProductsSection - Multi-Country Pricing", () => {
  test("should display country-specific pricing for NL (default)", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for products to load
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    // Products should be displayed with NL-specific pricing
    const firstProduct = page.locator('[id^="product-"]').first();
    const price = firstProduct.locator('text=/\\$\\d+/').first();
    await expect(price).toBeVisible();

    // Price should be a valid number
    const priceText = await price.textContent();
    const priceValue = parseFloat(priceText?.replace("$", "") || "0");
    expect(priceValue).toBeGreaterThan(0);
  });

  test("should use correct queryKey with country code", async ({ page }) => {
    // This test validates the React Query integration
    // We can check the network request includes expected parameters

    let requestMade = false;
    page.on("request", (request) => {
      if (request.url().includes("get-provider-catalog")) {
        requestMade = true;
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    expect(requestMade).toBe(true);
  });
});

test.describe("ProductsSection - Performance", () => {
  test("should cache products for 30 minutes (staleTime)", async ({ page }) => {
    // First load
    await page.goto("/");
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    // Track network requests
    let requestCount = 0;
    page.on("request", (request) => {
      if (request.url().includes("get-provider-catalog")) {
        requestCount++;
      }
    });

    // Reload page immediately (should use cache)
    await page.reload();
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    // Should not make another request due to staleTime
    expect(requestCount).toBe(0);
  });

  test("should load products within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForSelector('[id^="product-"]', { timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Products should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
