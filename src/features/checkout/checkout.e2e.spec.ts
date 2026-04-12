/**
 * Checkout E2E Tests
 *
 * Tests the three main checkout flows end-to-end using a real browser
 * against the running development server.
 *
 * Prerequisite: run `npm run dev` or let playwright start the dev server.
 * Authentication state is reused from playwright/.auth/user.json (setup project).
 *
 * Stripe test cards used:
 *   4242 4242 4242 4242 → success
 *   4000 0000 0000 0002 → always declined
 */
import { test, expect, Page } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fill the Stripe card iframe hosted in the payment section */
async function fillStripeCard(page: Page, cardNumber: string) {
  // Stripe Elements renders inside an iframe; locate the card number field
  const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
  await stripeFrame.locator('[placeholder="Card number"]').fill(cardNumber);
  await stripeFrame.locator('[placeholder="MM / YY"]').fill("12 / 28");
  await stripeFrame.locator('[placeholder="CVC"]').fill("123");
}

/** Navigate to checkout and fill in a shipping address */
async function fillShippingForm(page: Page) {
  await page.getByLabel(/first name/i).fill("E2E");
  await page.getByLabel(/last name/i).fill("Tester");
  await page.getByLabel(/email/i).fill("e2e@test.com");
  await page.getByLabel(/phone/i).fill("5550001234");
  await page.getByLabel(/address/i).first().fill("1 Playwright Lane");
  await page.getByLabel(/city/i).fill("Test City");
  await page.getByLabel(/zip/i).fill("10001");

  // Submit shipping form
  const continueBtn = page.getByRole("button", { name: /continue|next|proceed/i });
  if (await continueBtn.isVisible()) {
    await continueBtn.click();
  }
}

// ─── Flow 1: Payment Fails ────────────────────────────────────────────────────

test.describe("Flow 1 — Payment Fails", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/checkout");
    await fillShippingForm(page);
  });

  test("shows 'Payment Failed' error screen when card is declined", async ({ page }) => {
    // Select Stripe payment method
    await page.getByRole("button", { name: /credit card|stripe/i }).click();

    // Fill with a card that will always be declined
    await fillStripeCard(page, "4000000000000002");

    // Submit payment
    await page.getByRole("button", { name: /complete order|pay|place order/i }).click();

    // Assert the error UI appears
    await expect(page.getByRole("heading", { name: /payment failed/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("error screen includes a 'Retry Payment' button", async ({ page }) => {
    await page.getByRole("button", { name: /credit card|stripe/i }).click();
    await fillStripeCard(page, "4000000000000002");
    await page.getByRole("button", { name: /complete order|pay|place order/i }).click();

    await expect(page.getByRole("button", { name: /retry payment/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("'Retry Payment' button resets checkout back to idle so user can re-attempt", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /credit card|stripe/i }).click();
    await fillStripeCard(page, "4000000000000002");
    await page.getByRole("button", { name: /complete order|pay|place order/i }).click();

    // Wait for error screen
    await expect(page.getByRole("heading", { name: /payment failed/i })).toBeVisible({
      timeout: 15_000,
    });

    // Click retry
    await page.getByRole("button", { name: /retry payment/i }).click();

    // Should return to checkout form
    await expect(
      page.getByRole("heading", { name: /payment failed/i })
    ).not.toBeVisible({ timeout: 5_000 });
  });
});

// ─── Flow 1 (Orders list): Retry payment button ───────────────────────────────

test.describe("Flow 1 — Orders list shows Retry Payment for failed orders", () => {
  test("displays 'Retry Payment' action for an order with payment_status='failed'", async ({
    page,
  }) => {
    // Navigate to orders page; this test relies on having a seeded order with
    // payment_status='failed' in the test DB, OR uses a mock API route.
    await page.goto("/orders");

    // Intercept the orders API to inject a failed-payment order
    await page.route("**/rest/v1/orders*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "order-failed-1",
            order_number: "ORD-FAIL-001",
            user_id: "user-1",
            status: "pending",
            payment_status: "failed",
            total_amount: 55,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            order_items: [],
          },
        ]),
      });
    });

    await page.reload();

    // The "Retry Payment" link should be visible on the row
    await expect(page.getByRole("link", { name: /retry payment/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("'Retry Payment' link points to the checkout page with the order id", async ({
    page,
  }) => {
    await page.goto("/orders");

    await page.route("**/rest/v1/orders*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "order-failed-42",
            order_number: "ORD-FAIL-042",
            user_id: "user-1",
            status: "pending",
            payment_status: "failed",
            total_amount: 30,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            order_items: [],
          },
        ]),
      });
    });

    await page.reload();

    const retryLink = page.getByRole("link", { name: /retry payment/i });
    await expect(retryLink).toBeVisible({ timeout: 10_000 });

    const href = await retryLink.getAttribute("href");
    expect(href).toContain("retry_order_id=order-failed-42");
  });
});

// ─── Flow 2: Payment Succeeds, Order Creation Fails ──────────────────────────

test.describe("Flow 2 — Payment Succeeds but Order Creation Fails", () => {
  test("shows error message mentioning a refund when order creation fails after 3 attempts", async ({
    page,
  }) => {
    // Intercept the order creation endpoint and force it to fail every time
    await page.route("**/rest/v1/orders", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ status: 500, body: '{"error":"DB error"}' });
      } else {
        await route.continue();
      }
    });

    await page.goto("/checkout");
    await fillShippingForm(page);

    // Use test mode with the success card
    await page.getByRole("button", { name: /credit card|stripe/i }).click();
    await fillStripeCard(page, "4242424242424242");
    await page.getByRole("button", { name: /complete order|pay|place order/i }).click();

    // Should eventually show an error that includes "refund"
    const errorMessage = page.locator('[aria-label="Payment failed"]');
    await expect(errorMessage).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/refund/i)).toBeVisible();
  });
});

// ─── Flow 3: Everything Succeeds ─────────────────────────────────────────────

test.describe("Flow 3 — Everything Succeeds", () => {
  test("shows 'Order Confirmed' heading after successful Stripe payment", async ({ page }) => {
    await page.goto("/checkout");
    await fillShippingForm(page);

    await page.getByRole("button", { name: /credit card|stripe/i }).click();
    await fillStripeCard(page, "4242424242424242");
    await page.getByRole("button", { name: /complete order|pay|place order/i }).click();

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("displays a confirmation email message on the success screen", async ({ page }) => {
    await page.goto("/checkout");
    await fillShippingForm(page);

    await page.getByRole("button", { name: /credit card|stripe/i }).click();
    await fillStripeCard(page, "4242424242424242");
    await page.getByRole("button", { name: /complete order|pay|place order/i }).click();

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });

    // Confirmation email note should appear (conditional on email being set)
    await expect(
      page.getByText(/confirmation email|e2e@test\.com/i)
    ).toBeVisible();
  });

  test("'Track Your Order' button is visible after successful checkout", async ({ page }) => {
    await page.goto("/checkout");
    await fillShippingForm(page);

    await page.getByRole("button", { name: /credit card|stripe/i }).click();
    await fillStripeCard(page, "4242424242424242");
    await page.getByRole("button", { name: /complete order|pay|place order/i }).click();

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByRole("link", { name: /track your order/i })).toBeVisible();
  });
});
