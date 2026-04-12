/**
 * Mollie Payment Recovery E2E Tests
 *
 * Tests the Mollie payment recovery flow when sessionStorage is unavailable
 * or when the user returns from Mollie in a different browser context.
 *
 * CRITICAL FIX: These tests verify that payment recovery works even when:
 * - User opens Mollie checkout in new tab (sessionStorage not shared)
 * - Browser crashes during Mollie payment (sessionStorage lost)
 * - User clears browser data (sessionStorage lost)
 * - Privacy-focused browser blocks sessionStorage
 */
import { test, expect, Page } from "@playwright/test";

test.describe("Mollie Payment Recovery", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to checkout
    await page.goto("/checkout");
  });

  test("should recover Mollie payment when sessionStorage is cleared", async ({ page }) => {
    // Intercept the create-mollie-payment endpoint
    let molliePaymentId = "";

    await page.route("**/functions/v1/create-mollie-payment", async (route) => {
      molliePaymentId = `tr_${Date.now()}`;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          paymentId: molliePaymentId,
          checkoutUrl: `https://www.mollie.com/checkout/${molliePaymentId}`,
        }),
      });
    });

    // Intercept the verify-mollie-payment endpoint
    await page.route("**/functions/v1/verify-mollie-payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "paid",
          amount: {
            value: "99.99",
            currency: "EUR",
          },
        }),
      });
    });

    // Intercept payment_recovery table query
    await page.route("**/rest/v1/rpc/get_pending_payment_recoveries*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "recovery-1",
            payment_provider: "mollie",
            payment_intent_id: molliePaymentId,
            amount: 99.99,
            currency: "EUR",
            cart_snapshot: {
              id: "cart-123",
              items: [],
            },
            shipping_address: {
              first_name: "Test",
              last_name: "User",
              email: "test@example.com",
              phone: "1234567890",
              country: "NL",
              region: "Noord-Holland",
              address1: "Test Street 1",
              address2: "",
              city: "Amsterdam",
              zip: "1012AB",
            },
            line_items: [
              {
                print_provider_id: 99,
                blueprint_id: 123,
                variant_id: 456,
                print_areas: { front: "https://example.com/front.png" },
                quantity: 1,
              },
            ],
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    // Fill shipping form
    await page.getByLabel(/first name/i).fill("Test");
    await page.getByLabel(/last name/i).fill("User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/phone/i).fill("1234567890");
    await page.getByLabel(/address/i).first().fill("Test Street 1");
    await page.getByLabel(/city/i).fill("Amsterdam");
    await page.getByLabel(/zip/i).fill("1012AB");

    const continueBtn = page.getByRole("button", { name: /continue|next|proceed/i });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Click Mollie payment button
    const mollieButton = page.getByRole("button", { name: /pay with mollie/i });
    await mollieButton.click();

    // Wait for redirect attempt
    await page.waitForTimeout(1000);

    // Simulate sessionStorage being cleared (e.g., browser crash, new tab)
    await page.evaluate(() => {
      sessionStorage.clear();
    });

    // Navigate to return URL manually (simulating return from Mollie)
    await page.goto(`/checkout/mollie-return?payment_id=${molliePaymentId}`);

    // Should show verifying payment state
    await expect(page.getByText(/verifying payment/i)).toBeVisible({ timeout: 5_000 });

    // Should eventually show success (payment recovered from database)
    await expect(page.getByRole("heading", { name: /order confirmed|payment successful/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("should show helpful error when payment recovery fails", async ({ page }) => {
    // Simulate a scenario where sessionStorage is empty AND database recovery fails

    // Intercept payment_recovery table query to return empty
    await page.route("**/rest/v1/rpc/get_pending_payment_recoveries*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Navigate directly to return page without any payment data
    await page.goto("/checkout/mollie-return");

    // Should show error with helpful message
    await expect(page.getByText(/no payment information found/i)).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText(/contact support/i)).toBeVisible();
  });

  test("should prioritize URL payment_id over sessionStorage", async ({ page }) => {
    const urlPaymentId = "tr_url_payment_123";
    const sessionPaymentId = "tr_session_payment_456";

    // Set sessionStorage with different payment ID
    await page.evaluate((sessionId) => {
      sessionStorage.setItem("mollie_payment_id", sessionId);
    }, sessionPaymentId);

    // Intercept verify-mollie-payment to check which ID is used
    let verifiedPaymentId = "";
    await page.route("**/functions/v1/verify-mollie-payment", async (route) => {
      const requestBody = await route.request().postDataJSON();
      verifiedPaymentId = requestBody.paymentId;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "paid",
          amount: { value: "99.99", currency: "EUR" },
        }),
      });
    });

    // Navigate with payment_id in URL
    await page.goto(`/checkout/mollie-return?payment_id=${urlPaymentId}`);

    // Wait for verification
    await page.waitForTimeout(2000);

    // Verify that URL payment_id was used (not sessionStorage)
    expect(verifiedPaymentId).toBe(urlPaymentId);
  });

  test("should handle Mollie payment in new tab scenario", async ({ page, context }) => {
    // This test simulates opening Mollie checkout in a new tab
    // SessionStorage is NOT shared between tabs

    let molliePaymentId = "";

    // Intercept create payment
    await page.route("**/functions/v1/create-mollie-payment", async (route) => {
      molliePaymentId = `tr_newtab_${Date.now()}`;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          paymentId: molliePaymentId,
          checkoutUrl: `https://www.mollie.com/checkout/${molliePaymentId}`,
        }),
      });
    });

    // Fill checkout form
    await page.getByLabel(/first name/i).fill("New");
    await page.getByLabel(/last name/i).fill("Tab");
    await page.getByLabel(/email/i).fill("newtab@example.com");
    await page.getByLabel(/phone/i).fill("9876543210");
    await page.getByLabel(/address/i).first().fill("New Tab Street 1");
    await page.getByLabel(/city/i).fill("Rotterdam");
    await page.getByLabel(/zip/i).fill("3011AB");

    const continueBtn = page.getByRole("button", { name: /continue|next|proceed/i });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Click Mollie button
    const mollieButton = page.getByRole("button", { name: /pay with mollie/i });
    await mollieButton.click();
    await page.waitForTimeout(1000);

    // Open a new tab (sessionStorage is NOT shared)
    const newPage = await context.newPage();

    // Intercept payment recovery in new tab
    await newPage.route("**/rest/v1/rpc/get_pending_payment_recoveries*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "recovery-2",
            payment_provider: "mollie",
            payment_intent_id: molliePaymentId,
            amount: 99.99,
            currency: "EUR",
            cart_snapshot: { id: "cart-456" },
            shipping_address: {
              first_name: "New",
              last_name: "Tab",
              email: "newtab@example.com",
              phone: "9876543210",
              country: "NL",
              address1: "New Tab Street 1",
              city: "Rotterdam",
              zip: "3011AB",
            },
            line_items: [],
          },
        ]),
      });
    });

    await newPage.route("**/functions/v1/verify-mollie-payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "paid",
          amount: { value: "99.99", currency: "EUR" },
        }),
      });
    });

    // Navigate to return URL in new tab with payment_id
    await newPage.goto(`/checkout/mollie-return?payment_id=${molliePaymentId}`);

    // Should recover payment from database (not sessionStorage)
    await expect(newPage.getByRole("heading", { name: /order confirmed|payment successful/i })).toBeVisible({
      timeout: 15_000,
    });

    await newPage.close();
  });
});
