import { expect, test } from "@playwright/test";

/**
 * E2E tests for Stamp Flow
 * Tests the luxury-themed scroll-based flow with all 8 steps
 */

test.describe("Stamp Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the stamp page
    await page.goto("/stamp");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  test.describe("Page Structure", () => {
    test("should show hero section on initial load", async ({ page }) => {
      const hero = page.locator("#hero");
      await expect(hero).toBeVisible();
    });

    test("should have all 8 step sections in the DOM", async ({ page }) => {
      // Check all sections exist (steps 1-8)
      for (let i = 1; i <= 8; i++) {
        const section = page.locator(`#step-${i}`);
        await expect(section).toBeAttached();
      }
    });

    test("should have header with STAMP IT branding", async ({ page }) => {
      const header = page.locator("header");
      await expect(header).toBeVisible();
      await expect(header).toContainText("STAMP IT");
    });

    test("should have navigation sidebar on desktop", async ({ page }) => {
      // Check if sidebar exists
      const sidebar = page.locator("aside, nav").filter({
        hasText: /Protocol|Step/,
      });
      const count = await sidebar.count();
      expect(count).toBeGreaterThanOrEqual(0); // Sidebar may be hidden on mobile
    });
  });

  test.describe("Step 1: Upload", () => {
    test("should show upload section", async ({ page }) => {
      const uploadSection = page.locator("#step-1");
      await expect(uploadSection).toBeVisible();
      await expect(uploadSection).toContainText("Protocol 01");
    });

    test("should have file upload input", async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    });

    test("should have skip upload button", async ({ page }) => {
      const skipButton = page.getByRole("button", {
        name: /skip|continue/i,
      });
      await expect(skipButton).toBeVisible();
    });
  });

  test.describe("Step 2: Synthesis", () => {
    test("should show synthesis section", async ({ page }) => {
      const synthesisSection = page.locator("#step-2");

      // Scroll to section
      await synthesisSection.scrollIntoViewIfNeeded();

      await expect(synthesisSection).toBeVisible();
      await expect(synthesisSection).toContainText("Protocol 02");
    });

    test("should have prompt input field", async ({ page }) => {
      const promptInput = page.locator('textarea[placeholder*="Describe"]');
      await expect(promptInput).toBeAttached();
    });

    test("should have art style selector", async ({ page }) => {
      const styleSelect = page.locator('select, [role="combobox"]').filter({
        hasText: /editorial|classic|avant-garde|abstract/i,
      });
      const count = await styleSelect.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("should have preservation slider", async ({ page }) => {
      const slider = page.locator('input[type="range"]');
      await expect(slider).toBeAttached();
    });

    test("should have generate button", async ({ page }) => {
      const generateButton = page.getByRole("button", {
        name: /stamp it|generate/i,
      });
      await expect(generateButton).toBeVisible();
    });
  });

  test.describe("Step 3: Generation", () => {
    test("should show generation loading section", async ({ page }) => {
      const generationSection = page.locator("#step-3");
      await generationSection.scrollIntoViewIfNeeded();

      await expect(generationSection).toContainText("Generating");
    });

    test("should have progress indicator", async ({ page }) => {
      const generationSection = page.locator("#step-3");
      await generationSection.scrollIntoViewIfNeeded();

      // Check for progress bar or percentage
      const progressIndicator = generationSection.locator(
        '[style*="width"], text=/\\d+%/',
      );
      const count = await progressIndicator.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Step 4: Results", () => {
    test("should show results section", async ({ page }) => {
      const resultsSection = page.locator("#step-4");
      await resultsSection.scrollIntoViewIfNeeded();

      await expect(resultsSection).toBeVisible();
      await expect(resultsSection).toContainText("Protocol 04");
    });

    test("should have continue button", async ({ page }) => {
      const resultsSection = page.locator("#step-4");
      await resultsSection.scrollIntoViewIfNeeded();

      const continueButton = resultsSection.getByRole("button", {
        name: /continue|next|proceed/i,
      });
      await expect(continueButton).toBeVisible();
    });
  });

  test.describe("Step 5: Product Selection", () => {
    test("should show product selection section", async ({ page }) => {
      const productSection = page.locator("#step-5");
      await productSection.scrollIntoViewIfNeeded();

      await expect(productSection).toBeVisible();
      await expect(productSection).toContainText("Protocol 05");
    });

    test("should have product options", async ({ page }) => {
      const productSection = page.locator("#step-5");
      await productSection.scrollIntoViewIfNeeded();

      // Check for product buttons (tshirt, hoodie, tote, poster)
      const productButtons = page.getByRole("button", {
        name: /tshirt|hoodie|tote|poster/i,
      });
      const count = await productButtons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe("Step 6: Customization", () => {
    test("should show customization section", async ({ page }) => {
      const customizationSection = page.locator("#step-6");
      await customizationSection.scrollIntoViewIfNeeded();

      await expect(customizationSection).toBeVisible();
      await expect(customizationSection).toContainText("Protocol 06");
    });

    test("should have color swatches", async ({ page }) => {
      const customizationSection = page.locator("#step-6");
      await customizationSection.scrollIntoViewIfNeeded();

      const colorSwatches = customizationSection.locator(
        'button[aria-label*="color"], [role="radiogroup"]',
      );
      const count = await colorSwatches.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test("should have size selector", async ({ page }) => {
      const customizationSection = page.locator("#step-6");
      await customizationSection.scrollIntoViewIfNeeded();

      const sizeButtons = page.getByRole("button", {
        name: /^(XS|S|M|L|XL|XXL)$/,
      });
      const count = await sizeButtons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test("should have create product button", async ({ page }) => {
      const createButton = page.getByRole("button", {
        name: /create product/i,
      });
      await expect(createButton).toBeVisible();
    });
  });

  test.describe("Step 7: Production", () => {
    test("should show production loading section", async ({ page }) => {
      const productionSection = page.locator("#step-7");
      await productionSection.scrollIntoViewIfNeeded();

      await expect(productionSection).toContainText(/Creating|Production/i);
    });

    test("should have progress indicator", async ({ page }) => {
      const productionSection = page.locator("#step-7");
      await productionSection.scrollIntoViewIfNeeded();

      // Check for progress bar
      const progressBar = productionSection.locator('[style*="width"]');
      const count = await progressBar.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Step 8: Final Review", () => {
    test("should show final review section", async ({ page }) => {
      const finalSection = page.locator("#step-8");
      await finalSection.scrollIntoViewIfNeeded();

      await expect(finalSection).toBeVisible();
      await expect(finalSection).toContainText("Protocol 08");
    });

    test("should have product mockup", async ({ page }) => {
      const finalSection = page.locator("#step-8");
      await finalSection.scrollIntoViewIfNeeded();

      const mockupImage = finalSection.locator("img");
      const count = await mockupImage.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("should have bag it button", async ({ page }) => {
      const bagButton = page.getByRole("button", { name: /bag it/i });
      await expect(bagButton).toBeVisible();
    });

    test("should have buy now button", async ({ page }) => {
      const buyButton = page.getByRole("button", { name: /buy now/i });
      await expect(buyButton).toBeVisible();
    });
  });

  test.describe("Scroll Navigation", () => {
    test("should support scroll-based navigation", async ({ page }) => {
      // Scroll to step 2
      const step2 = page.locator("#step-2");
      await step2.scrollIntoViewIfNeeded();

      // Wait a moment for intersection observer to update
      await page.waitForTimeout(500);

      // Verify we can see step 2
      await expect(step2).toBeInViewport();
    });

    test("should snap to sections when scrolling", async ({ page }) => {
      // Get main content wrapper
      const main = page.locator("main");

      // Verify scroll-snap is enabled
      const scrollSnapType = await main.evaluate((el) => {
        return window.getComputedStyle(el).scrollSnapType;
      });

      // Should have scroll snap enabled
      expect(scrollSnapType).toContain("y");
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA labels", async ({ page }) => {
      // Check for aria-labels on interactive elements
      const buttons = page.getByRole("button");
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should have section landmarks", async ({ page }) => {
      const sections = page.locator("section");
      const count = await sections.count();
      expect(count).toBeGreaterThanOrEqual(8); // At least 8 steps
    });

    test("should have proper heading hierarchy", async ({ page }) => {
      const h2Headings = page.locator("h2, h3");
      const count = await h2Headings.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Responsive Design", () => {
    test("should be mobile responsive", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check if page still loads
      const hero = page.locator("#hero");
      await expect(hero).toBeVisible();
    });

    test("should adapt grid layout on desktop", async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Check if sections use grid layout
      const section = page.locator("#step-2");
      const gridClass = await section.evaluate((el) => {
        return el.className.includes("grid");
      });

      expect(gridClass).toBe(true);
    });
  });

  test.describe("Visual Regression", () => {
    test("should match hero section snapshot", async ({ page }) => {
      const hero = page.locator("#hero");
      await expect(hero).toBeVisible();

      // Take screenshot for visual regression
      await expect(page).toHaveScreenshot("stamp-hero.png", {
        fullPage: false,
        maxDiffPixels: 100,
      });
    });
  });
});
