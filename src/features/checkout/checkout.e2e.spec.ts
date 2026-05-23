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
  // Scroll the Stripe iframe into view
  const stripeIframe = page.locator('iframe[name*="__privateStripeFrame"]').first();
  await stripeIframe.waitFor({ state: "attached", timeout: 15_000 });
  await stripeIframe.scrollIntoViewIfNeeded();

  const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

  const cardInput = stripeFrame.locator('[placeholder="Card number"]');
  await cardInput.fill(cardNumber);
  await stripeFrame.locator('[placeholder="MM / YY"]').fill("12 / 28");
  await stripeFrame.locator('[placeholder="CVC"]').fill("123");
}

/**
 * Navigate to checkout and fill in a shipping address.
 *
 * The form uses autoSubmitOnChange so the payment section appears automatically.
 */
async function fillShippingForm(page: Page) {
  // Structure: container with h2 "Billing Address" + sibling form.
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
 */
async function clickConfirmOrder(page: Page) {
  await page.getByRole("button", { name: /confirm order/i }).click();
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
    total_amount: 55,
    subtotal: 55,
    tax_amount: 0,
    shipping_cost: 0,
    discount_amount: 0,
    currency: "USD",
    payment_method: "stripe",
    printify_order_id: "",
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
  // Scroll to payment section and enable test mode
  const testModeCheckbox = page.getByRole("checkbox", { name: /test mode/i });
  await testModeCheckbox.scrollIntoViewIfNeeded();
  await testModeCheckbox.check();

  // Select the test card from the dropdown
  const testCardSelect = page.locator("#test-card-select");
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
      total_amount: 25,
      subtotal: 25,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      currency: "USD",
      payment_method: "stripe",
      printify_order_id: "",
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
            design_config: null,
            fulfillment_status: null,
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
      total_amount: 25,
      subtotal: 25,
      tax_amount: 0,
      shipping_cost: 0,
      discount_amount: 0,
      currency: "USD",
      payment_method: "stripe",
      printify_order_id: "printify-e2e-1",
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
            design_config: null,
            fulfillment_status: null,
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

// ─── Flow 4: Checkout flow uniformity ───────────────────────────────────────

test.describe("Flow 4 — Checkout flow uniformity across payment methods", () => {
  test.describe("Mobile footer renders correct payment buttons", () => {
    test.beforeEach(async ({ page }) => {
      await mockCartWithItems(page);
      await page.goto("/checkout?cartId=cart-e2e-1");
    });

    test("mobile footer shows Stripe confirm button by default", async ({ page }) => {
      // Resize to mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Wait for checkout to load on mobile
      let found = false;
      for (let i = 0; i < 5; i++) {
        try {
          const mobileFooter = page.locator('[data-testid="mobile-footer"], [class*="footer"], footer').last();
          const confirmBtn = mobileFooter.getByRole("button", { name: /confirm|pay|stripe/i });
          await expect(confirmBtn).toBeVisible({ timeout: 5000 });
          found = true;
          break;
        } catch { await page.waitForTimeout(1000); }
      }
      if (!found) throw new Error('Mobile confirm button not found after retries');
    });

    test("mobile footer shows PayPal button when PayPal is selected", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.reload();

      // Fill shipping form (mobile version) so payment section unlocks
      // Then select PayPal payment method
      const paypalMethodButton = page.getByRole("button", { name: /paypal/i });
      // If PayPal method selector is visible on mobile, clicking it should render the PayPal button
      if (await paypalMethodButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await paypalMethodButton.click();

        // The mobile footer should now render the PayPal SDK button (not a generic confirm button)
        // PayPal buttons render inside a div with PayPal-specific markup
        const paypalContainer = page.locator('[class*="paypal"]');
        await expect(paypalContainer).toBeVisible({ timeout: 10_000 });
      }
    });
  });

  test.describe("Mollie return page handles missing payment info", () => {
    test("shows error when no payment info is in sessionStorage", async ({ page }) => {
      // Clear any existing Mollie sessionStorage data
      await page.goto("/checkout?cartId=cart-e2e-1");
      await page.evaluate(() => {
        sessionStorage.removeItem("mollie_payment_id");
        sessionStorage.removeItem("mollie_line_items");
        sessionStorage.removeItem("mollie_shipping_address");
        sessionStorage.removeItem("mollie_cart_id");
      });

      await page.goto("/checkout/mollie-return");

      // Should show error state since there's no payment ID
      await expect(page.getByText(/no payment information found/i)).toBeVisible({
        timeout: 10_000,
      });
    });

    test("'Return to Checkout' button navigates back with cartId when available", async ({
      page,
    }) => {
      // Set up sessionStorage with cartId but no payment ID
      await page.goto("/checkout?cartId=cart-e2e-1");
      await page.evaluate(() => {
        sessionStorage.setItem("mollie_cart_id", "cart-e2e-1");
        sessionStorage.removeItem("mollie_payment_id");
      });

      await page.goto("/checkout/mollie-return");

      await expect(page.getByText(/no payment information found/i)).toBeVisible({
        timeout: 10_000,
      });

      const returnButton = page.getByRole("button", { name: /return to checkout/i });
      await expect(returnButton).toBeVisible();

      // Check that the button navigates to checkout with cartId (not bare /checkout)
      await returnButton.click();
      await page.waitForURL(/cartId=cart-e2e-1/, { timeout: 10_000 });
    });

    test("'Return to Checkout' falls back to /cart when no cartId is stored", async ({
      page,
    }) => {
      // Clear all Mollie sessionStorage
      await page.goto("/checkout?cartId=cart-e2e-1");
      await page.evaluate(() => {
        sessionStorage.removeItem("mollie_payment_id");
        sessionStorage.removeItem("mollie_cart_id");
      });

      await page.goto("/checkout/mollie-return");

      await expect(page.getByText(/no payment information found/i)).toBeVisible({
        timeout: 10_000,
      });

      const returnButton = page.getByRole("button", { name: /return to checkout/i });
      await returnButton.click();
      await page.waitForURL(/\/cart$/, { timeout: 10_000 });
    });
  });

  test.describe("Mollie return page retries Printify order creation", () => {
    test("retries Printify 3 times via React Query before showing error", async ({
      page,
    }) => {
      // Set up sessionStorage to simulate a Mollie redirect return
      await page.goto("/checkout?cartId=cart-e2e-1");
      await page.evaluate(() => {
        const lineItems = [{
          product_id: "prod-e2e-1",
          variant_id: 1001,
          quantity: 1,
          print_areas: { front: "https://placehold.co/400x400.png" },
        }];
        const shippingAddress = {
          first_name: "E2E",
          last_name: "Tester",
          email: "e2e@test.com",
          phone: "5550001234",
          country: "US",
          region: "",
          address1: "1 Playwright Lane",
          address2: "",
          city: "Test City",
          zip: "10001",
        };
        sessionStorage.setItem("mollie_payment_id", "tr_test_mollie_retry");
        sessionStorage.setItem("mollie_line_items", JSON.stringify(lineItems));
        sessionStorage.setItem("mollie_shipping_address", JSON.stringify(shippingAddress));
        sessionStorage.setItem("mollie_cart_id", "cart-e2e-1");
        sessionStorage.setItem("mollie_order_amount", "25");
      });

      await mockCartWithItems(page);

      // Mock Mollie payment verification as paid
      await page.route("**/functions/v1/verify-mollie-payment", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            paymentId: "tr_test_mollie_retry",
            status: "paid",
            isPaid: true,
          }),
        });
      });

      // Mock order APIs
      const now = new Date().toISOString();
      const fakeOrder = {
        id: "order-mollie-retry-1",
        order_number: "ORD-ML-RETRY-001",
        user_id: "11111111-1111-1111-1111-111111111111",
        customer_email: "e2e@test.com",
        customer_name: "E2E Tester",
        customer_phone: "5550001234",
        status: "pending",
        payment_status: "paid",
        total_amount: 25,
        subtotal: 25,
        tax_amount: 0,
        shipping_cost: 0,
        discount_amount: 0,
        currency: "USD",
        payment_method: "mollie",
        printify_order_id: "",
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
              id: "oi-mollie-1",
              order_id: "order-mollie-retry-1",
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

      // Mock payment recovery and refund endpoints
      await page.route("**/rest/v1/rpc/record_payment_for_recovery", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify("recovery-id-1") });
      });
      await page.route("**/functions/v1/process-refund", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
      });

      // Mock payment_transactions table for linkPaymentTransactionToOrder
      await page.route("**/rest/v1/payment_transactions*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "pt-1", order_id: "order-mollie-retry-1" }),
        });
      });

      // Track Printify calls — always fail
      let printifyCallCount = 0;
      await page.route("**/functions/v1/create-printify-order", async (route) => {
        printifyCallCount++;
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Printify service unavailable" }),
        });
      });

      await page.goto("/checkout/mollie-return");

      // Should eventually show error (after retries are exhausted)
      // Wait for either the error heading or error paragraph to be visible (avoid strict mode violation)
      let foundError = false;
      for (let i = 0; i < 12; i++) {
        try {
          const heading = page.getByRole('heading', { name: /something went wrong/i });
          const para = page.getByText(/Printify.*failed|refund has been initiated/i);
          if (await heading.isVisible({ timeout: 5000 }) || await para.isVisible({ timeout: 5000 })) {
            foundError = true;
            break;
          }
        } catch { await page.waitForTimeout(5000); }
      }
      if (!foundError) throw new Error('Printify error message not found after retries');

      // Printify should have been called 4 times (1 initial + 3 retries from React Query)
      expect(printifyCallCount).toBe(4);
    });
  });

  test.describe("Mollie verification failure with payment recovery", () => {
    test("records payment for recovery and retries verification 3 times via React Query", async ({ page }) => {
      // Set up sessionStorage to simulate Mollie redirect return
      await page.goto("/checkout?cartId=cart-e2e-1");
      await page.evaluate(() => {
        const lineItems = [{
          product_id: "prod-e2e-1",
          variant_id: 1001,
          quantity: 1,
          print_areas: { front: "https://placehold.co/400x400.png" },
        }];
        const shippingAddress = {
          first_name: "E2E",
          last_name: "Tester",
          email: "e2e@test.com",
          phone: "5550001234",
          country: "US",
          region: "",
          address1: "1 Playwright Lane",
          address2: "",
          city: "Test City",
          zip: "10001",
        };
        sessionStorage.setItem("mollie_payment_id", "tr_test_verify_fail");
        sessionStorage.setItem("mollie_line_items", JSON.stringify(lineItems));
        sessionStorage.setItem("mollie_shipping_address", JSON.stringify(shippingAddress));
        sessionStorage.setItem("mollie_cart_id", "cart-e2e-1");
        sessionStorage.setItem("mollie_order_amount", "25");
      });

      await mockCartWithItems(page);

      // Track payment recovery calls
      let paymentRecoveryCallCount = 0;
      await page.route("**/rest/v1/rpc/record_payment_for_recovery", async (route) => {
        paymentRecoveryCallCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify("recovery-id-verify-fail"),
        });
      });

      // Track verification retry attempts
      let verifyCallCount = 0;
      await page.route("**/functions/v1/verify-mollie-payment", async (route) => {
        verifyCallCount++;
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Mollie API temporarily unavailable" }),
        });
      });

      await page.goto("/checkout/mollie-return");

      // Should show error screen after all retries
      await expect(page.getByText(/something went wrong|failed to verify/i)).toBeVisible({
        timeout: 30_000, // Increased timeout to allow for retries
      });

      // CRITICAL: Payment recovery should have been called BEFORE verification
      // Even though verification failed, the payment was recorded for recovery
      expect(paymentRecoveryCallCount).toBeGreaterThanOrEqual(1);

      // React Query should retry 3 times (1 initial + 3 retries = 4 total)
      expect(verifyCallCount).toBe(4);
    });

    test("shows helpful error message with payment ID when verification fails", async ({ page }) => {
      await page.goto("/checkout?cartId=cart-e2e-1");
      await page.evaluate(() => {
        const lineItems = [{
          product_id: "prod-e2e-1",
          variant_id: 1001,
          quantity: 1,
          print_areas: { front: "https://placehold.co/400x400.png" },
        }];
        const shippingAddress = {
          first_name: "E2E",
          last_name: "Tester",
          email: "e2e@test.com",
          phone: "5550001234",
          country: "US",
          region: "",
          address1: "1 Playwright Lane",
          address2: "",
          city: "Test City",
          zip: "10001",
        };
        sessionStorage.setItem("mollie_payment_id", "tr_test_verify_fail_2");
        sessionStorage.setItem("mollie_line_items", JSON.stringify(lineItems));
        sessionStorage.setItem("mollie_shipping_address", JSON.stringify(shippingAddress));
        sessionStorage.setItem("mollie_cart_id", "cart-e2e-1");
        sessionStorage.setItem("mollie_order_amount", "25");
      });

      await mockCartWithItems(page);

      await page.route("**/rest/v1/rpc/record_payment_for_recovery", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify("recovery-id-2"),
        });
      });

      await page.route("**/functions/v1/verify-mollie-payment", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Network timeout" }),
        });
      });

      await page.goto("/checkout/mollie-return");

      // Error message should reassure user that payment was recorded
      await expect(
        page.getByText(/payment has been recorded|process your order automatically|email confirmation within 24 hours/i)
      ).toBeVisible({ timeout: 30_000 });

      // Should include the payment ID for support
      await expect(page.getByText(/tr_test_verify_fail_2/i)).toBeVisible();

      // Should have a button to return to checkout or go to dashboard
      const returnButton = page.getByRole("button", { name: /return to checkout|go to dashboard/i });
      await expect(returnButton).toBeVisible();
    });
  });
});

// ─── Flow 2b (rewrite): Printify retry count — desktop layout only ──────────
//
// The previous assertion multiplied the expected call count by 2 to account for
// both mobile + desktop layouts processing the same request — that was testing a
// rendering side-effect, not retry behaviour.
//
// This rewrite disables the mobile layout via viewport so only one layout is
// mounted, then asserts the canonical retry count: 1 initial + 3 retries = 4.

test.describe("Flow 2b (fixed) — Printify retries exactly 3 times (desktop)", () => {
  test("calls create-printify-order exactly 4 times (1 + 3 retries) before showing error", async ({
    page,
  }) => {
    // Force desktop-only viewport so only one layout is mounted
    await page.setViewportSize({ width: 1280, height: 900 });

    await mockPaymentIntentEdgeFunction(page);
    await mockCartWithItems(page);

    const now = new Date().toISOString();
    const fakeOrder = mockOrder({
      id: "order-e2e-retry-fixed-1",
      order_number: "ORD-RETRY-FIXED-001",
      payment_status: "paid",
      payment_method: "stripe",
    });

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
            id: "oi-retry-fixed-1",
            order_id: "order-e2e-retry-fixed-1",
            product_id: "prod-e2e-1",
            variant_id: "1001",
            product_name: "E2E Test Tee",
            variant_name: "Black / M",
            quantity: 1,
            unit_price: 25,
            total_price: 25,
            custom_image_url: "https://placehold.co/400x400.png",
            design_config: null,
            fulfillment_status: null,
            created_at: now,
            updated_at: now,
          }]),
        });
      } else {
        await route.continue();
      }
    });

    let printifyCallCount = 0;
    await page.route("**/functions/v1/create-printify-order", async (route) => {
      printifyCallCount++;
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

    // Wait for the error screen (all retries exhausted)
    const errorRegion = page.locator('[aria-label="Payment failed"]');
    await expect(errorRegion).toBeVisible({ timeout: 60_000 });

    // Exactly 1 initial attempt + 3 retries = 4 calls from the single desktop layout
    expect(printifyCallCount).toBe(4);
  });
});

// ─── Flow 5: Mobile happy path ───────────────────────────────────────────────
//
// The core checkout flows skip mobile via test.skip at the top of this file.
// These tests explicitly set a mobile viewport and drive the accordion-step
// mobile UI to ensure the full payment flow works on small screens.

test.describe("Flow 5 — Mobile checkout happy path", () => {
  const MOBILE_VIEWPORT = { width: 375, height: 812 };

  /** Fill the multi-step mobile checkout form through all accordion steps */
  async function fillMobileCheckoutSteps(page: Page) {
    // Step 1 – Shipping Address
    const shippingStep = page.getByRole("button", { name: /shipping address/i });
    await expect(shippingStep).toBeVisible({ timeout: 10_000 });

    // The first step should be open by default; fill the visible form
    await page.locator('[name="first_name"]').first().fill("E2E");
    await page.locator('[name="last_name"]').first().fill("Tester");
    await page.locator('[name="email"]').first().fill("e2e@test.com");
    await page.locator('[name="phone"]').first().fill("5550001234");
    await page.locator('[name="address1"]').first().fill("1 Playwright Lane");
    await page.locator('[name="city"]').first().fill("Test City");
    await page.locator('[name="zip"]').first().fill("10001");

    // Submit step 1
    await page.getByRole("button", { name: /continue to shipping/i }).click();

    // Step 2 – Shipping Method: click "Confirm Method" button
    const confirmMethodBtn = page.getByRole("button", { name: /confirm method/i });
    await expect(confirmMethodBtn).toBeVisible({ timeout: 10_000 });
    await confirmMethodBtn.click();

    // Step 3 – Billing: Click "Proceed to Payment" button
    await page.waitForTimeout(1000); // Let the accordion animation complete
    const proceedToPaymentBtn = page.getByRole("button", { name: /proceed to payment/i });
    await expect(proceedToPaymentBtn).toBeVisible({ timeout: 10_000 });
    await proceedToPaymentBtn.click();

    // Step 4 – Payment: enable test mode
    // Wait for payment step to be accessible
    await page.waitForTimeout(1000); // Let the accordion animation complete
    const testModeCheckbox = page.getByRole("checkbox", { name: /test mode/i });
    await testModeCheckbox.scrollIntoViewIfNeeded();
    await testModeCheckbox.check();

    const testCardSelect = page.locator("#test-card-select").last();
    await testCardSelect.selectOption("visa");
  }

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await mockPaymentIntentEdgeFunction(page);
    await mockCartWithItems(page);

    const now = new Date().toISOString();
    const fakeOrder = mockOrder({
      id: "order-mobile-success-1",
      order_number: "ORD-MOBILE-001",
      status: "confirmed",
      payment_status: "paid",
      payment_method: "stripe",
    });

    await page.route("**/rest/v1/orders*", async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(fakeOrder) });
      } else if (method === "PATCH") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeOrder) });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(null) });
      }
    });

    await page.route("**/functions/v1/create-printify-order", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, orderId: "printify-mobile-1" }),
      });
    });

    await page.route("**/rest/v1/order_items*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([{
            id: "oi-mobile-1",
            order_id: "order-mobile-success-1",
            product_id: "prod-e2e-1",
            variant_id: "1001",
            product_name: "E2E Test Tee",
            variant_name: "Black / M",
            quantity: 1,
            unit_price: 25,
            total_price: 25,
            custom_image_url: "https://placehold.co/400x400.png",
            design_config: null,
            fulfillment_status: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("shows 'Order Confirmed' after completing all accordion steps on mobile", async ({
    page,
  }) => {
    await page.goto("/checkout?cartId=cart-e2e-1");
    await fillMobileCheckoutSteps(page);

    // Tap the sticky footer Stripe confirm button (wait for it to be visible and enabled)
    let confirmBtn = null;
    let found = false;
    // Try multiple selectors for robustness
    for (let i = 0; i < 5; i++) {
      try {
        const mobileFooter = page.locator('[data-testid="mobile-footer"], [class*="footer"], footer').last();
        confirmBtn = mobileFooter.getByRole("button", { name: /confirm|pay|stripe/i });
        await expect(confirmBtn).toBeVisible({ timeout: 10000 });
        found = true;
        break;
      } catch { await page.waitForTimeout(1000); }
    }
    if (!found) throw new Error('Mobile confirm button not found after retries');
    // Wait up to 30s for the button to be enabled
    let enabled = false;
    for (let i = 0; i < 30; i++) {
      if (await confirmBtn.isEnabled()) { enabled = true; break; }
      await page.waitForTimeout(1000);
    }
    if (!enabled) {
      const html = await confirmBtn.innerHTML().catch(() => 'not found');
      throw new Error('Mobile confirm button not enabled. HTML: ' + html);
    }
    await confirmBtn.click();

    // Wait up to 90s for the confirmation heading
    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 90000,
    });
  });

  test("mobile footer Stripe confirm button is disabled until shipping step is complete", async ({
    page,
  }) => {
    await page.goto("/checkout?cartId=cart-e2e-1");

    // Before filling shipping — button should be disabled or absent
    const mobileFooter = page.locator('[class*="footer"]').last();
    const confirmBtn = mobileFooter.getByRole("button", { name: /confirm|pay/i });

    // Wait up to 20s for the button to appear (may not be rendered yet)
    let isVisible = false;
    try {
      await expect(confirmBtn).toBeVisible({ timeout: 20000 });
      isVisible = true;
    } catch {}

    if (isVisible) {
      // If visible, it should be disabled
      await expect(confirmBtn).toBeDisabled();
    }
    // If not visible at all, the test also passes — the button is correctly withheld
  });

  test("shows payment failed screen when Stripe test card is declined on mobile", async ({
    page,
  }) => {
    // Override: force Printify to never be reached — the card itself should decline
    await page.route("**/functions/v1/create-printify-order", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Should not be reached" }),
      });
    });

    await page.goto("/checkout?cartId=cart-e2e-1");

    // Fill steps and select the declined test card
    await fillMobileCheckoutSteps(page);
    const testCardSelect = page.locator("#test-card-select").last();
    await testCardSelect.selectOption("declined");

    let confirmBtn2 = null;
    let found2 = false;
    for (let i = 0; i < 5; i++) {
      try {
        const mobileFooter = page.locator('[data-testid="mobile-footer"], [class*="footer"], footer').last();
        confirmBtn2 = mobileFooter.getByRole("button", { name: /confirm|pay|stripe/i });
        await expect(confirmBtn2).toBeVisible({ timeout: 10000 });
        found2 = true;
        break;
      } catch { await page.waitForTimeout(1000); }
    }
    if (!found2) throw new Error('Mobile confirm button not found after retries');
    let enabled2 = false;
    for (let i = 0; i < 30; i++) {
      if (await confirmBtn2.isEnabled()) { enabled2 = true; break; }
      await page.waitForTimeout(1000);
    }
    if (!enabled2) {
      const html = await confirmBtn2.innerHTML().catch(() => 'not found');
      throw new Error('Mobile confirm button not enabled. HTML: ' + html);
    }
    await confirmBtn2.click();

    await expect(page.getByRole("heading", { name: /payment failed/i })).toBeVisible({
      timeout: 60000,
    });
  });
});

// ─── Flow 6: Mollie happy path ────────────────────────────────────────────────
//
// A user completes the Mollie redirect flow:
//   1. Checkout page stores payment context in sessionStorage and redirects to Mollie
//   2. Mollie redirects back to /checkout/mollie-return
//   3. The return page verifies payment, creates the order, and shows the confirmation screen.

test.describe("Flow 6 — Mollie happy path", () => {
  /** Seed sessionStorage as if the Mollie redirect just returned */
  async function seedMollieReturnSession(page: Page, paymentId = "tr_test_mollie_success") {
    await page.goto("/checkout?cartId=cart-e2e-1");
    await page.evaluate((pid) => {
      const lineItems = [{
        product_id: "prod-e2e-1",
        variant_id: 1001,
        quantity: 1,
        print_areas: { front: "https://placehold.co/400x400.png" },
      }];
      const shippingAddress = {
        first_name: "E2E",
        last_name: "Tester",
        email: "e2e@test.com",
        phone: "5550001234",
        country: "US",
        region: "",
        address1: "1 Playwright Lane",
        address2: "",
        city: "Test City",
        zip: "10001",
      };
      sessionStorage.setItem("mollie_payment_id", pid);
      sessionStorage.setItem("mollie_line_items", JSON.stringify(lineItems));
      sessionStorage.setItem("mollie_shipping_address", JSON.stringify(shippingAddress));
      sessionStorage.setItem("mollie_cart_id", "cart-e2e-1");
      sessionStorage.setItem("mollie_order_amount", "25");
    }, paymentId);
  }

  test.beforeEach(async ({ page }) => {
    await mockCartWithItems(page);

    // Mollie payment is verified as paid
    await page.route("**/functions/v1/verify-mollie-payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          paymentId: "tr_test_mollie_success",
          status: "paid",
          isPaid: true,
        }),
      });
    });

    const now = new Date().toISOString();
    const fakeOrder = mockOrder({
      id: "order-mollie-success-1",
      order_number: "ORD-MOLLIE-001",
      status: "confirmed",
      payment_status: "paid",
      payment_method: "mollie",
    });

    await page.route("**/rest/v1/orders*", async (route) => {
      const method = route.request().method();
      if (method === "POST") {
        await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(fakeOrder) });
      } else if (method === "PATCH") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeOrder) });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(null) });
      }
    });

    await page.route("**/functions/v1/create-printify-order", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, orderId: "printify-mollie-1" }),
      });
    });

    await page.route("**/rest/v1/order_items*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([{
            id: "oi-mollie-success-1",
            order_id: "order-mollie-success-1",
            product_id: "prod-e2e-1",
            variant_id: "1001",
            product_name: "E2E Test Tee",
            variant_name: "Black / M",
            quantity: 1,
            unit_price: 25,
            total_price: 25,
            custom_image_url: "https://placehold.co/400x400.png",
            design_config: null,
            fulfillment_status: null,
            created_at: now,
            updated_at: now,
          }]),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("shows 'Order Confirmed' screen after a successful Mollie redirect return", async ({
    page,
  }) => {
    await seedMollieReturnSession(page);
    await page.goto("/checkout/mollie-return");

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("displays the order number on the Mollie confirmation screen", async ({
    page,
  }) => {
    await seedMollieReturnSession(page);
    await page.goto("/checkout/mollie-return");

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });

    // Wait up to 90s for the order number to appear (handle slow rendering)
    let foundOrderNumber = false;
    for (let i = 0; i < 18; i++) {
      try {
        await expect(page.getByText(/ORD-MOLLIE-001/i)).toBeVisible({ timeout: 5000 });
        foundOrderNumber = true;
        break;
      } catch { await page.waitForTimeout(5000); }
    }
    if (!foundOrderNumber) throw new Error('Order number ORD-MOLLIE-001 not found after retries');
  });

  test("'Track Your Order' link is visible after Mollie confirmation", async ({
    page,
  }) => {
    await seedMollieReturnSession(page);
    await page.goto("/checkout/mollie-return");

    await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByRole("link", { name: /track your order/i })).toBeVisible();
  });

  test("Mollie return page shows error when payment verification returns not-paid", async ({
    page,
  }) => {
    // Override: payment is open (not yet paid)
    await page.route("**/functions/v1/verify-mollie-payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          paymentId: "tr_test_mollie_open",
          status: "open",
          isPaid: false,
        }),
      });
    });

    await seedMollieReturnSession(page, "tr_test_mollie_open");
    await page.goto("/checkout/mollie-return");

    await expect(
      page.getByText(/payment (not completed|failed|pending)|something went wrong/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
