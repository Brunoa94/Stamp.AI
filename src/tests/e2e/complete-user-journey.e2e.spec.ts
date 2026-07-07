/**
 * Complete User Journey E2E Tests
 *
 * Tests the entire application flow from image upload to order completion:
 * 1. Upload image
 * 2. Generate AI design (or use uploaded image)
 * 3. Select product and create custom product
 * 4. Add to cart
 * 5. Proceed to checkout
 * 6. Complete order with different payment methods (Stripe, PayPal, Mollie)
 *
 * These tests write to the REAL database and verify data integrity at each step.
 *
 * Prerequisites:
 * - Database must be running (Supabase local or remote)
 * - Development server must be running (`npm run dev`)
 * - Test user credentials in .env (TEST_USER_EMAIL, TEST_USER_PASSWORD)
 * - Payment provider test credentials configured
 */

import { test, expect, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import path from "path";
import fs from "fs";

// Desktop-only: focusing on desktop layout for comprehensive testing
test.skip(({ isMobile }) => isMobile, "Complete journey tests target desktop layout");

// ─── Test Data Setup ─────────────────────────────────────────────────────────

const TEST_IMAGE_PATH = path.join(__dirname, "../fixtures/test-image.png");

// Create test fixtures directory if it doesn't exist
if (!fs.existsSync(path.dirname(TEST_IMAGE_PATH))) {
  fs.mkdirSync(path.dirname(TEST_IMAGE_PATH), { recursive: true });
}

// Create a minimal valid PNG file for testing if it doesn't exist
if (!fs.existsSync(TEST_IMAGE_PATH)) {
  // Minimal 1x1 red PNG (base64 decoded)
  const minimalPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(TEST_IMAGE_PATH, minimalPNG);
}

// ─── Database Helpers ────────────────────────────────────────────────────────

/**
 * Initialize Supabase client for direct database verification
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

/**
 * Clean up test data created during E2E tests
 */
async function cleanupTestData(testId: string) {
  const supabase = getSupabaseClient();

  // Delete in correct order due to foreign key constraints
  await supabase.from("order_items").delete().like("product_name", `%${testId}%`);
  await supabase.from("orders").delete().like("order_number", `%${testId}%`);
  await supabase.from("cart_items").delete().like("product_name", `%${testId}%`);
  await supabase.from("products").delete().like("name", `%${testId}%`);
  await supabase.from("ai_generations").delete().like("prompt", `%${testId}%`);
}

// ─── Page Helper Functions ───────────────────────────────────────────────────

/**
 * Upload an image through the stamp wizard
 */
async function uploadImage(page: Page, imagePath: string) {
  // Navigate to stamp page
  await page.goto("/stamp");

  // Wait for the upload section to be visible
  const uploadSection = page.getByRole("region", { name: /upload.*image/i });
  await expect(uploadSection).toBeVisible({ timeout: 10_000 });

  // Find and interact with file input
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(imagePath);

  // Wait for upload to complete (look for preview or next button enabled)
  await page.waitForTimeout(2000); // Give it time to upload
}

/**
 * Generate AI design from a prompt
 */
async function generateAIDesign(page: Page, prompt: string) {
  // Look for AI generation section
  const aiSection = page.getByRole("region", { name: /ai.*generation/i });
  await expect(aiSection).toBeVisible({ timeout: 10_000 });

  // Enter prompt
  const promptInput = page.getByPlaceholder(/enter.*prompt/i);
  await promptInput.fill(prompt);

  // Click generate button
  const generateBtn = page.getByRole("button", { name: /generate/i });
  await generateBtn.click();

  // Wait for generation to complete (look for generated image)
  await page.waitForTimeout(15_000); // AI generation takes time
}

/**
 * Select product type and create custom product
 */
async function selectAndCreateProduct(page: Page, productName: string) {
  // Select product type (e.g., T-Shirt)
  const productSelector = page.getByRole("button", { name: /t-shirt|shirt/i });
  await productSelector.click();

  // Enter product name if there's an input
  const nameInput = page.getByLabel(/product name/i).or(page.getByPlaceholder(/name/i));
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill(productName);
  }

  // Click create/save button
  const createBtn = page
    .getByRole("button", { name: /create product|save product|publish/i })
    .first();
  await createBtn.click();

  // Wait for product creation
  await page.waitForTimeout(3000);
}

/**
 * Add product to cart
 */
async function addToCart(page: Page) {
  const addToCartBtn = page
    .getByRole("button", { name: /add to cart/i })
    .first();
  await addToCartBtn.click();

  // Wait for cart update
  await page.waitForTimeout(2000);

  // Verify cart count increased (optional)
  const cartBadge = page.locator('[data-testid="cart-count"]').or(page.getByText(/\d+/).first());
  await expect(cartBadge).toBeVisible({ timeout: 5000 });
}

/**
 * Navigate to cart and proceed to checkout
 */
async function proceedToCheckout(page: Page) {
  // Click cart icon/button
  const cartBtn = page.getByRole("link", { name: /cart/i }).or(
    page.getByRole("button", { name: /cart/i })
  );
  await cartBtn.click();

  // Wait for cart page to load
  await expect(page).toHaveURL(/\/cart/, { timeout: 10_000 });

  // Click checkout button
  const checkoutBtn = page.getByRole("button", { name: /checkout|proceed/i });
  await checkoutBtn.click();

  // Wait for checkout page
  await expect(page).toHaveURL(/\/checkout/, { timeout: 10_000 });
}

/**
 * Fill shipping address form
 */
async function fillShippingAddress(page: Page) {
  const billingSection = page.getByRole("heading", { name: /billing address/i }).locator("../..");
  const form = billingSection.locator("form");

  await form.locator('[name="first_name"]').fill("E2E");
  await form.locator('[name="last_name"]').fill("Test");
  await form.locator('[name="email"]').fill("e2e@test.com");
  await form.locator('[name="phone"]').fill("5550001234");
  await form.locator('[name="address1"]').fill("123 Test Street");
  await form.locator('[name="city"]').fill("Test City");
  await form.locator('[name="zip"]').fill("12345");

  // Select country
  const countrySelect = form.locator('[name="country"]');
  await countrySelect.selectOption("US");

  // Select state (appears after country selection)
  await page.waitForTimeout(500);
  const stateSelect = form.locator('[name="state"]');
  if (await stateSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    await stateSelect.selectOption("CA");
  }

  // Wait for auto-submit or payment section to appear
  await page.waitForTimeout(1000);
}

/**
 * Complete Stripe payment
 */
async function completeStripePayment(page: Page) {
  // Select Stripe payment method
  const stripeOption = page.getByLabel(/credit card|stripe/i);
  await stripeOption.click();

  // Wait for Stripe iframe to load
  const stripeIframe = page.locator('iframe[name*="__privateStripeFrame"]').first();
  await stripeIframe.waitFor({ state: "attached", timeout: 15_000 });
  await stripeIframe.scrollIntoViewIfNeeded();

  const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

  // Fill card details (Stripe test card)
  const cardInput = stripeFrame.locator('[placeholder="Card number"]');
  await cardInput.fill("4242424242424242");
  await stripeFrame.locator('[placeholder="MM / YY"]').fill("12/28");
  await stripeFrame.locator('[placeholder="CVC"]').fill("123");

  // Submit payment
  const payBtn = page.getByRole("button", { name: /pay now|complete order/i });
  await payBtn.click();

  // Wait for order confirmation
  await expect(page).toHaveURL(/\/order\/success|\/thank-you/, { timeout: 30_000 });
}

/**
 * Complete PayPal payment (redirects to PayPal sandbox)
 */
async function completePayPalPayment(page: Page) {
  // Select PayPal payment method
  const paypalOption = page.getByLabel(/paypal/i);
  await paypalOption.click();

  // Click PayPal button
  const paypalBtn = page.getByRole("button", { name: /pay.*paypal|paypal/i });
  await paypalBtn.click();

  // Wait for redirect to PayPal sandbox
  await page.waitForURL(/sandbox\.paypal\.com/, { timeout: 15_000 });

  // Log in to PayPal sandbox (if not already logged in)
  const emailInput = page.locator('#email');
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(process.env.PAYPAL_TEST_EMAIL || "sb-test@personal.example.com");
    await page.getByRole("button", { name: /next/i }).click();

    const passwordInput = page.locator('#password');
    await passwordInput.fill(process.env.PAYPAL_TEST_PASSWORD || "testpassword");
    await page.getByRole("button", { name: /log in/i }).click();
  }

  // Complete payment
  await page.waitForTimeout(2000);
  const completeBtn = page.getByRole("button", { name: /complete purchase|pay now/i });
  await completeBtn.click();

  // Wait for redirect back to site
  await page.waitForURL(/localhost:3000\/order\/success/, { timeout: 30_000 });
}

/**
 * Complete Mollie payment (redirects to Mollie test environment)
 */
async function completeMolliePayment(page: Page) {
  // Select Mollie payment method
  const mollieOption = page.getByLabel(/mollie|ideal|bank/i);
  await mollieOption.click();

  // Click Mollie button
  const mollieBtn = page.getByRole("button", { name: /pay.*mollie|complete/i });
  await mollieBtn.click();

  // Wait for redirect to Mollie
  await page.waitForURL(/mollie\.com/, { timeout: 15_000 });

  // In Mollie test mode, click "Paid" button
  const paidBtn = page.getByRole("button", { name: /paid|success/i });
  await paidBtn.click();

  // Wait for redirect back
  await page.waitForURL(/localhost:3000\/order\/success/, { timeout: 30_000 });
}

// ─── Test Suites ─────────────────────────────────────────────────────────────

test.describe("Complete User Journey - Stripe Payment", () => {
  const testId = `e2e-${Date.now()}-stripe`;

  test.afterAll(async () => {
    await cleanupTestData(testId);
  });

  test("should complete full journey: upload → generate → create → cart → checkout with Stripe", async ({
    page,
  }) => {
    // Step 1: Upload image
    await uploadImage(page, TEST_IMAGE_PATH);

    // Step 2: Generate AI design (or skip if using uploaded image directly)
    // await generateAIDesign(page, `E2E test design ${testId}`);

    // Step 3: Select product and create
    await selectAndCreateProduct(page, `E2E Test Product ${testId}`);

    // Step 4: Add to cart
    await addToCart(page);

    // Verify cart in database
    const supabase = getSupabaseClient();
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("*")
      .like("product_name", `%${testId}%`);

    expect(cartItems).toBeTruthy();
    expect(cartItems?.length).toBeGreaterThan(0);
    expect(cartItems?.[0].unit_price).toBeGreaterThan(0); // Verify price is set

    // Step 5: Proceed to checkout
    await proceedToCheckout(page);

    // Step 6: Fill shipping address
    await fillShippingAddress(page);

    // Step 7: Complete payment with Stripe
    await completeStripePayment(page);

    // Verify order in database
    const { data: orders } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .like("order_number", `%${testId}%`)
      .single();

    expect(orders).toBeTruthy();
    expect(orders?.status).toBe("completed");
    expect(orders?.payment_status).toBe("paid");
    expect(orders?.payment_provider).toBe("stripe");
    expect(orders?.order_items).toBeTruthy();
    expect(orders?.order_items?.length).toBeGreaterThan(0);
  });
});

test.describe("Complete User Journey - PayPal Payment", () => {
  const testId = `e2e-${Date.now()}-paypal`;

  test.afterAll(async () => {
    await cleanupTestData(testId);
  });

  test("should complete full journey with PayPal payment", async ({ page }) => {
    await uploadImage(page, TEST_IMAGE_PATH);
    await selectAndCreateProduct(page, `E2E Test Product ${testId}`);
    await addToCart(page);
    await proceedToCheckout(page);
    await fillShippingAddress(page);
    await completePayPalPayment(page);

    // Verify order
    const supabase = getSupabaseClient();
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .like("order_number", `%${testId}%`)
      .single();

    expect(orders).toBeTruthy();
    expect(orders?.payment_provider).toBe("paypal");
    expect(orders?.payment_status).toBe("paid");
  });
});

test.describe("Complete User Journey - Mollie Payment", () => {
  const testId = `e2e-${Date.now()}-mollie`;

  test.afterAll(async () => {
    await cleanupTestData(testId);
  });

  test("should complete full journey with Mollie payment", async ({ page }) => {
    await uploadImage(page, TEST_IMAGE_PATH);
    await selectAndCreateProduct(page, `E2E Test Product ${testId}`);
    await addToCart(page);
    await proceedToCheckout(page);
    await fillShippingAddress(page);
    await completeMolliePayment(page);

    // Verify order
    const supabase = getSupabaseClient();
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .like("order_number", `%${testId}%`)
      .single();

    expect(orders).toBeTruthy();
    expect(orders?.payment_provider).toBe("mollie");
    expect(orders?.payment_status).toBe("paid");
  });
});

test.describe("Data Integrity Verification", () => {
  const testId = `e2e-${Date.now()}-integrity`;

  test.afterAll(async () => {
    await cleanupTestData(testId);
  });

  test("should maintain data integrity throughout the journey", async ({ page }) => {
    const supabase = getSupabaseClient();

    // Complete journey
    await uploadImage(page, TEST_IMAGE_PATH);
    await selectAndCreateProduct(page, `E2E Test Product ${testId}`);
    await addToCart(page);

    // Verify product created
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .like("name", `%${testId}%`);

    expect(products).toBeTruthy();
    expect(products?.length).toBeGreaterThan(0);
    const productId = products?.[0]?.id;

    // Verify cart item references correct product
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("*")
      .like("product_name", `%${testId}%`);

    expect(cartItems).toBeTruthy();
    expect(cartItems?.[0]?.product_id).toBeTruthy();
    expect(cartItems?.[0]?.variant_id).toBeTruthy();
    expect(cartItems?.[0]?.unit_price).toBeGreaterThan(0);
    expect(cartItems?.[0]?.quantity).toBeGreaterThan(0);

    // Complete checkout
    await proceedToCheckout(page);
    await fillShippingAddress(page);
    await completeStripePayment(page);

    // Verify order created with all relationships
    const { data: orders } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *
        )
      `)
      .like("order_number", `%${testId}%`)
      .single();

    expect(orders).toBeTruthy();
    expect(orders?.order_items).toBeTruthy();
    expect(orders?.order_items?.length).toBeGreaterThan(0);

    // Verify order item matches cart item
    const orderItem = orders?.order_items?.[0];
    expect(orderItem?.product_id).toBe(cartItems?.[0]?.product_id);
    expect(orderItem?.variant_id).toBe(cartItems?.[0]?.variant_id);
    expect(orderItem?.unit_price).toBe(cartItems?.[0]?.unit_price);
    expect(orderItem?.quantity).toBe(cartItems?.[0]?.quantity);

    // Verify total price calculation
    const expectedTotal = orderItem?.unit_price! * orderItem?.quantity!;
    expect(orderItem?.total_price).toBe(expectedTotal);
  });
});
