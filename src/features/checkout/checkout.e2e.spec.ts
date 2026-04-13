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

// Desktop-only: checkout has separate mobile UX (accordion steps) not covered here
test.skip(({ isMobile }) => isMobile, "Checkout e2e tests target the desktop layout only");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fill the Stripe CardElement iframe hosted in the payment section */
async function fillStripeCard(page: Page, cardNumber: string) {
  // The page renders both mobile + desktop layouts with separate Stripe iframes.
  // Scope to the desktop layout container (hidden md:block).
  const desktopLayout = page.locator('.hidden.md\\:block');

  // Scroll the Stripe iframe into view inside the desktop layout
  const stripeIframe = desktopLayout.locator('iframe[name*="__privateStripeFrame"]').first();
  await stripeIframe.waitFor({ state: "attached", timeout: 15_000 });
  await stripeIframe.scrollIntoViewIfNeeded();

  const stripeFrame = desktopLayout.frameLocator('iframe[name*="__privateStripeFrame"]').first();

  const cardInput = stripeFrame.locator('[placeholder="Card number"]');
  await cardInput.fill(cardNumber);
  await stripeFrame.locator('[placeholder="MM / YY"]').fill("12 / 28");
  await stripeFrame.locator('[placeholder="CVC"]').fill("123");
}

/**
 * Navigate to checkout and fill in a shipping address.
 *
 * The checkout page renders both mobile and desktop layouts simultaneously,
 * producing duplicate form field IDs. We scope to the desktop "Billing Address"
 * section so locators always resolve to the visible form.
 *
 * The form uses autoSubmitOnChange so the payment section appears automatically.
 */
async function fillShippingForm(page: Page) {
  // Scope to the visible desktop billing form.
  // Structure: div.glass-card > header > h2 "Billing Address"  +  form (sibling of header)
  // Go up two levels from h2 to reach the container that holds both heading and form.
  const billingSection = page.getByRole("heading", { name: /billing address/i }).locator("../..");
  const form = billingSection.locator("form");

  await form.locator('[name="first_name"]').fill("E2E");
  await form.locator('[name="last_name"]').fill("Tester");
  await form.locator('[name="email"]').fill("e2e@test.com");
  await form.locator('[name="phone"]').fill("5550001234");
  await form.locator('[name="address1"]').fill("1 Playwright Lane");
  await form.locator('[name="city"]').fill("Test City");
  await form.locator('[name="zip"]').fill("10001");

  // Wait for the payment section to appear (auto-submit triggers it)
  await expect(page.getByRole("heading", { name: /payment details/i })).toBeVisible({
    timeout: 10_000,
  });
}

/**
 * Click the "Confirm Order" button in the order summary sidebar.
 * The button text varies by payment method, e.g. "Confirm Order · Pay with Card".
 * Scoped to the desktop layout to avoid hitting the hidden mobile button.
 */
async function clickConfirmOrder(page: Page) {
  const desktopLayout = page.locator('.hidden.md\\:block');
  await desktopLayout.getByRole("button", { name: /confirm order/i }).click();
}

// ─── Flow 0: No cartId redirects to not-found ────────────────────────────────

test.describe("Flow 0 — No cartId in URL redirects to not-found", () => {
  test("redirects to the not-found page when no cartId or retry_order_id is present", async ({
    page,
  }) => {
    await page.goto("/checkout");

    // The not-found page should render with the 404 indicator
    await expect(page.getByText("404").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});

// ─── Flow 1: Payment Fails ────────────────────────────────────────────────────

test.describe("Flow 1 — Payment Fails", () => {
  test.beforeEach(async ({ page }) => {
    await mockCartWithItems(page);
    await page.goto("/checkout?cartId=cart-e2e-1");
    await fillShippingForm(page);
  });

  test("shows 'Payment Failed' error screen when card is declined", async ({ page }) => {
    // Stripe is the default payment method — no need to select it.
    // Fill with a card that will always be declined.
    await fillStripeCard(page, "4000000000000002");

    await clickConfirmOrder(page);

    // Assert the error UI appears
    await expect(page.getByRole("heading", { name: /payment failed/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("error screen includes a 'Retry Payment' button", async ({ page }) => {
    await fillStripeCard(page, "4000000000000002");
    await clickConfirmOrder(page);

    await expect(page.getByRole("button", { name: /retry payment/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("'Retry Payment' button resets checkout back to idle so user can re-attempt", async ({
    page,
  }) => {
    await fillStripeCard(page, "4000000000000002");
    await clickConfirmOrder(page);

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

// ─── Helpers: mock order factory ─────────────────────────────────────────────

/** Build a complete mock order that passes the Zod OrderWithItemsSchema validation */
function mockOrder(overrides: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  return {
    id: "order-failed-1",
    order_number: "ORD-FAIL-001",
    user_id: "user-1",
    customer_email: "e2e@test.com",
    customer_name: "E2E Tester",
    customer_phone: "5550001234",
    status: "pending",
    payment_status: "failed",
    fulfillment_status: "unfulfilled",
    total_amount: 55,
    subtotal: 55,
    tax_amount: 0,
    shipping_cost: 0,
    discount_amount: 0,
    currency: "USD",
    payment_method: "stripe",
    printify_order_id: "",
    stripe_payment_intent_id: "",
    stripe_customer_id: "",
    shipping_address: null,
    billing_address: null,
    shipping_method: "standard",
    tracking_number: "",
    tracking_url: "",
    customer_notes: "",
    internal_notes: "",
    product_id: "",
    created_at: now,
    updated_at: now,
    shipped_at: "",
    delivered_at: "",
    order_items: [],
    ...overrides,
  };
}

// ─── Flow 1 (Orders list): Retry payment button ───────────────────────────────

test.describe("Flow 1 — Orders list shows Retry Payment for failed orders", () => {
  test("displays 'Retry Payment' action for an order with payment_status='failed'", async ({
    page,
  }) => {
    await page.goto("/orders");

    await page.route("**/rest/v1/orders*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockOrder()]),
      });
    });

    await page.reload();

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
          mockOrder({ id: "order-failed-42", order_number: "ORD-FAIL-042", total_amount: 30 }),
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

// ─── Helpers: Test-mode payment ─────────────────────────────────────────────

/** Mock the Stripe create-payment-intent Edge Function with a unique ID per invocation */
async function mockPaymentIntentEdgeFunction(page: Page) {
  const uniqueId = `pi_e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await page.route("**/functions/v1/create-payment-intent", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        clientSecret: `${uniqueId}_secret`,
        paymentIntentId: uniqueId,
      }),
    });
  });
}

/** Mock the cart API to return a cart with one item */
async function mockCartWithItems(page: Page) {
  const now = new Date().toISOString();

  await page.route("**/rest/v1/carts*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "cart-e2e-1",
        user_id: "11111111-1111-1111-1111-111111111111",
        session_id: null,
        user_email: "e2e@test.com",
        created_at: now,
        updated_at: now,
        cart_items: [
          {
            id: "ci-e2e-1",
            cart_id: "cart-e2e-1",
            product_id: "prod-e2e-1",
            product_name: "E2E Test Tee",
            variant_id: "1001",
            variant_name: "Black / M",
            quantity: 1,
            unit_price: 25,
            custom_image_url: "https://placehold.co/400x400.png",
            design_id: null,
            created_at: now,
            updated_at: now,
          },
        ],
      }),
    });
  });
}

/** Enable Test Mode and select a test card */
async function enableTestMode(page: Page, card: "visa" | "declined" = "visa") {
  const desktopLayout = page.locator('.hidden.md\\:block');

  // Scroll to payment section and enable test mode
  const testModeCheckbox = desktopLayout.getByRole("checkbox", { name: /test mode/i });
  await testModeCheckbox.scrollIntoViewIfNeeded();
  await testModeCheckbox.check();

  // Select the test card from the dropdown
  const testCardSelect = desktopLayout.locator("#test-card-select");
  await testCardSelect.selectOption(card);
}

// ─── Flow 2: Payment Succeeds, Order Creation Fails ──────────────────────────

test.describe("Flow 2 — Payment Succeeds but Order Fulfillment Fails", () => {
  test("shows error screen when Printify order creation fails after payment", async ({
    page,
  }) => {
    // Mock payment and cart
    await mockPaymentIntentEdgeFunction(page);
    await mockCartWithItems(page);

    // Force the Printify order Edge Function to fail
    await page.route("**/functions/v1/create-printify-order", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Printify service unavailable" }),
      });
    });

    await page.goto("/checkout?cartId=cart-e2e-1");
    await fillShippingForm(page);

    await enableTestMode(page, "visa");
    await clickConfirmOrder(page);

    // Should show the error/processing issue screen
    const errorRegion = page.locator('[aria-label="Payment failed"]');
    await expect(errorRegion).toBeVisible({ timeout: 30_000 });
  });
});

// ─── Flow 2b: Printify retries 3 times before failing ──────────────────────

test.describe("Flow 2b — Printify edge function retries 3 times", () => {
  test("retries the Printify order creation 3 times before showing error", async ({
    page,
  }) => {
    await mockPaymentIntentEdgeFunction(page);
    await mockCartWithItems(page);

    // Track how many times the Printify edge function is called
    let printifyCallCount = 0;
    await page.route("**/functions/v1/create-printify-order", async (route) => {
      printifyCallCount++;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Printify service unavailable" }),
      });
    });

    // Mock order APIs so the checkout flow can proceed past payment
    const now = new Date().toISOString();
    const fakeOrder = {
      id: "order-e2e-retry-1",
      order_number: "ORD-RETRY-001",
      user_id: "11111111-1111-1111-1111-111111111111",
      customer_email: "e2e@test.com",
      customer_name: "E2E Tester",
      customer_phone: "5550001234",
      status: "pending",
      payment_status: "paid",
      fulfillment_status: "unfulfilled",
      total_amount: 25,
      subtotal: 25,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      currency: "USD",
      payment_method: "stripe",
      printify_order_id: "",
      stripe_payment_intent_id: "",
      stripe_customer_id: "",
      shipping_address: null,
      billing_address: null,
      shipping_method: "standard",
      tracking_number: "",
      tracking_url: "",
      customer_notes: "",
      internal_notes: "",
      product_id: "",
      created_at: now,
      updated_at: now,
      shipped_at: "",
      delivered_at: "",
    };

    await page.route("**/rest/v1/orders*", async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(fakeOrder),
        });
      } else if (method === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(fakeOrder),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(null),
        });
      }
    });

    await page.route("**/rest/v1/order_items*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([{
            id: "oi-retry-1",
            order_id: "order-e2e-retry-1",
            product_id: "prod-e2e-1",
            variant_id: "1001",
            product_name: "E2E Test Tee",
            variant_name: "Black / M",
            quantity: 1,
            unit_price: 25,
            total_price: 25,
            custom_image_url: "https://placehold.co/400x400.png",
            design_id: null,
            design_config: null,
            fulfillment_status: null,
            external_order_id: null,
            created_at: now,
            updated_at: now,
          }]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/checkout?cartId=cart-e2e-1");
    await fillShippingForm(page);

    await enableTestMode(page, "visa");
    await clickConfirmOrder(page);

    // Wait for the error screen (after all retries are exhausted)
    const errorRegion = page.locator('[aria-label="Payment failed"]');
    await expect(errorRegion).toBeVisible({ timeout: 60_000 });

    // The Printify edge function should have been called 4 times per layout
    // (1 initial attempt + 3 retries). The page renders both mobile + desktop
    // layouts simultaneously, so total calls = 4 × 2 = 8.
    expect(printifyCallCount).toBeGreaterThanOrEqual(4);
    expect(printifyCallCount % 4).toBe(0);
  });
});

// ─── Flow 3: Everything Succeeds ─────────────────────────────────────────────

test.describe("Flow 3 — Everything Succeeds", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the payment intent, cart, and order creation so tests are self-contained
    await mockPaymentIntentEdgeFunction(page);
    await mockCartWithItems(page);

    // Mock all orders API interactions (POST for create, PATCH for update, GET for idempotency check)
    const now = new Date().toISOString();
    const fakeOrder = {
      id: "order-e2e-success-1",
      order_number: "ORD-E2E-001",
      user_id: "11111111-1111-1111-1111-111111111111",
      customer_email: "e2e@test.com",
      customer_name: "E2E Tester",
      customer_phone: "5550001234",
      status: "confirmed",
      payment_status: "paid",
      fulfillment_status: "unfulfilled",
      total_amount: 25,
      subtotal: 25,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      currency: "USD",
      payment_method: "stripe",
      printify_order_id: "printify-e2e-1",
      stripe_payment_intent_id: "",
      stripe_customer_id: "",
      shipping_address: null,
      billing_address: null,
      shipping_method: "standard",
      tracking_number: "",
      tracking_url: "",
      customer_notes: "",
      internal_notes: "",
      product_id: "",
      created_at: now,
      updated_at: now,
      shipped_at: "",
      delivered_at: "",
    };

    await page.route("**/rest/v1/orders*", async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(fakeOrder),
        });
      } else if (method === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(fakeOrder),
        });
      } else {
        // GET for idempotency check — return empty so it creates a new order
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(null),
        });
      }
    });

    // Mock Printify order creation edge function
    await page.route("**/functions/v1/create-printify-order", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          orderId: "printify-e2e-1",
        }),
      });
    });

    // Mock order items creation
    await page.route("**/rest/v1/order_items*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([{
            id: "oi-e2e-1",
            order_id: "order-e2e-success-1",
            product_id: "prod-e2e-1",
            variant_id: "1001",
            product_name: "E2E Test Tee",
            variant_name: "Black / M",
            quantity: 1,
            unit_price: 25,
            total_price: 25,
            custom_image_url: "https://placehold.co/400x400.png",
            design_id: null,
            design_config: null,
            fulfillment_status: null,
            external_order_id: null,
            created_at: now,
            updated_at: now,
          }]),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("shows 'Order Confirmed' heading after successful Stripe payment", async ({ page }) => {
    await page.goto("/checkout?cartId=cart-e2e-1");
    await fillShippingForm(page);

    await enableTestMode(page, "visa");
    await clickConfirmOrder(page);

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("displays a confirmation email message on the success screen", async ({ page }) => {
    await page.goto("/checkout?cartId=cart-e2e-1");
    await fillShippingForm(page);

    await enableTestMode(page, "visa");
    await clickConfirmOrder(page);

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });

    // Confirmation email note should appear (conditional on email being set)
    await expect(
      page.getByText(/confirmation email|e2e@test\.com/i)
    ).toBeVisible();
  });

  test("'Track Your Order' button is visible after successful checkout", async ({ page }) => {
    await page.goto("/checkout?cartId=cart-e2e-1");
    await fillShippingForm(page);

    await enableTestMode(page, "visa");
    await clickConfirmOrder(page);

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByRole("link", { name: /track your order/i })).toBeVisible();
  });
});
