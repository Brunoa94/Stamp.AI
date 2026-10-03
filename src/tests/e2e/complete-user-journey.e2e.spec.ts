import { expect, test } from "@playwright/test";
import { mockImageGeneration } from "./helpers/mockImageGeneration";
import { createClient } from "@supabase/supabase-js";

test("creates a design, adds it to the cart, and reaches checkout", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(120_000);
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const productId = `test-journey-${Date.now()}`;
  try {
    await mockImageGeneration(page, "Minimal line drawing of a mountain");
    await page.route("**/functions/v1/upload-printify-image", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          image: {
            id: "test-journey-image",
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
            id: productId,
            title: "E2E Journey Product",
            variants: [
              { id: 1, title: "Black / M", price: 2499, is_enabled: true },
            ],
            images: [
              {
                src: "https://placehold.co/512x512/png",
                position: "front",
                is_default: true,
              },
            ],
          },
        }),
      }),
    );
    await page.route("**/rest/v1/products?*", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 403, body: "test product stays local" })
        : route.continue(),
    );

    await page.goto("/stamp");
    await expect(page.getByRole("button", { name: /logout from your account/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /begin customiz/i }).click();
    await page.getByRole("button", { name: /skip upload/i }).click();
    await page
      .getByRole("textbox", { name: /prompt input/i })
      .fill("Minimal line drawing of a mountain");
    await page.getByRole("button", { name: /stamp it/i }).click();
    await page
      .getByRole("button", { name: /use this image/i })
      .first()
      .click({ timeout: 180_000 });
    await page
      .locator("#step-5")
      .getByRole("button", { name: /select .*tee/i })
      .first()
      .click();
    await page
      .getByRole("button", { name: /continue to customization/i })
      .click();
    await expect(page.locator("#step-6")).toBeVisible();
    if (isMobile) {
      await page.getByRole("button", { name: /continue to preview/i }).click();
    }
    await page.getByRole("button", { name: /create product/i }).click();
    await expect(page.locator("#step-8")).toBeVisible({ timeout: 130_000 });
    await expect(
      page.getByRole("heading", { name: "Ready to Wear" }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /^bag it$/i })).toBeEnabled();
    await page.getByRole("button", { name: /^bag it$/i }).click();
    await expect(page).toHaveURL(/\/cart$/, { timeout: 20_000 });
    await expect(
      page.getByText("Unisex Heavy Cotton Tee").first(),
    ).toBeVisible({ timeout: 20_000 });
    await page
      .getByRole("button", { name: /checkout/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });
  } finally {
    await admin.from("cart_items").delete().eq("product_id", productId);
  }
});
