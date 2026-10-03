import { expect, test } from "@playwright/test";

/** Acceptance coverage for the current eight-step stamp wizard. */
test.describe("Stamp Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/stamp");
    await expect(page.getByRole("button", { name: /logout from your account/i })).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("button", { name: /begin customiz/i }),
    ).toBeVisible();
  });

  test("shows the entry point and all eight steps", async ({
    page,
    isMobile,
  }) => {
    await expect(page.locator("#hero")).toBeVisible();
    for (let step = 1; step <= 8; step += 1) {
      await expect(page.locator(`#step-${step}`)).toBeAttached();
    }
    if (isMobile) {
      await expect(
        page.getByRole("button", { name: /open menu/i }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("navigation", { name: "Step navigation" }),
      ).toBeVisible();
    }
  });

  test("moves from entry through optional upload to the prompt", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /begin customiz/i }).click();
    await expect(page.locator("#step-1")).toBeInViewport();
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await page.getByRole("button", { name: /skip upload/i }).click();
    await expect(page.locator("#step-2")).toBeInViewport();
  });

  test("accepts an uploaded image and carries it to the prompt step", async ({
    page,
    isMobile,
  }) => {
    await page.getByRole("button", { name: /begin customiz/i }).click();
    await page.locator('#step-1 input[type="file"]').setInputFiles({
      name: "acceptance-image.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    await expect(page.locator("#step-1")).toContainText("acceptance-image.png");
    const next = page.getByRole("button", { name: /next step/i });
    await next.click();
    await expect(page.locator("#step-2")).toBeInViewport();
    if (isMobile)
      await expect(
        page.getByRole("button", { name: /stamp it/i }),
      ).toBeVisible();
  });

  test("requires a prompt before generation", async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole("button", { name: /begin customiz/i }).click();
      await page.getByRole("button", { name: /skip upload/i }).click();
    }
    const prompt = page.getByRole("textbox", { name: /prompt input/i });
    const generate = page.getByRole("button", { name: /stamp it/i });
    await expect(generate).toBeDisabled();
    await prompt.fill("A line drawing of mountains");
    await expect(generate).toBeEnabled();
  });

  test("offers image style suggestions and preservation control", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /apply suggestion: vibrant/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("slider", { name: /preservation level/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: /toggle background removal/i }),
    ).toBeVisible();
  });

  test("shows generation and result stages", async ({ page, isMobile }) => {
    test.skip(
      isMobile,
      "Later stages are checked after navigation in the mobile journey",
    );
    await expect(page.locator("#step-3")).toContainText(
      "Generating Your Design",
    );
    await expect(page.locator("#step-4")).toContainText("Your Creation");
    await expect(
      page.locator("#step-4").getByRole("button", { name: /use this image/i }),
    ).toBeDisabled();
  });

  test("loads available products and keeps continuation disabled until selection", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "Product selection requires advancing through the mobile wizard",
    );
    const products = page.locator("#step-5");
    await expect(
      products.getByRole("button", { name: /select unisex heavy cotton tee/i }),
    ).toBeVisible();
    await expect(
      products.getByRole("button", { name: /continue to customization/i }),
    ).toBeDisabled();
  });

  test("shows customization controls and requires a design", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "Customization requires advancing through the mobile wizard",
    );
    const customization = page.locator("#step-6");
    await expect(
      customization.getByRole("combobox", { name: /size selection/i }),
    ).toBeVisible();
    await expect(
      customization.getByRole("button", { name: /create product/i }),
    ).toBeDisabled();
    await expect(customization).toContainText("No design yet");
  });

  test("shows production and final review stages", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      "Later stages are checked after navigation in the mobile journey",
    );
    await expect(page.locator("#step-7")).toContainText(
      "Creating Your Product Mockup",
    );
    const review = page.locator("#step-8");
    await expect(review).toContainText("Ready to Wear");
    await expect(
      review.getByRole("button", { name: /^bag it$/i }),
    ).toBeVisible();
  });

  test("keeps the wizard available at a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("#hero")).toBeVisible();
    await page.getByRole("button", { name: /begin customiz/i }).click();
    await expect(page.locator("#step-1")).toBeInViewport();
  });
});
