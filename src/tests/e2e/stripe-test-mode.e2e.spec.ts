/**
 * E2E: Stripe test-mode flag
 *
 * Seeds a cart for the test user, opens checkout with the test toggle on,
 * pays with a predefined Stripe test payment method and verifies that:
 *  - the create-payment-intent request carries `test_mode: true`
 *  - the edge function accepted it (the STRIPE_TEST_* credential set works)
 *  - the payment row records `stripe_mode: "test"`
 *  - the Stripe webhook (test endpoint) marked the payment succeeded and the
 *    order paid
 *
 * Run against the TEST Supabase project only (`NODE_ENV=test`).
 */

import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEST_USER_ID = process.env.TEST_USER_ID!;
const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN!;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID!;
let seededVariant: { blueprintId: number; variantId: number } | null = null;

/**
 * Checkout line items reference an existing Printify product by its product
 * id (the cart query does not join `products`), so pick a real product with
 * an enabled variant from the test shop.
 */
async function pickPrintifyProduct(): Promise<{ productId: string; variantId: number; title: string; variantTitle: string; priceCents: number }> {
  const res = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=10`, {
    headers: { Authorization: `Bearer ${PRINTIFY_API_TOKEN}` },
  });
  expect(res.ok, `Printify products list: ${res.status}`).toBe(true);
  const json = (await res.json()) as { data: Array<{ id: string; blueprint_id: number; title: string; variants: Array<{ id: number; title: string; price: number; is_enabled: boolean; is_available: boolean }> }> };
  for (const product of json.data) {
    const { data: catalogProduct } = await admin.from("catalog_products")
      .select("blueprint_id").eq("blueprint_id", product.blueprint_id).maybeSingle();
    if (!catalogProduct) continue;
    for (const variant of product.variants.filter((v) => v.is_enabled && v.is_available)) {
      const { data: price } = await admin.from("product_variants")
        .select("price_cents")
        .eq("blueprint_id", product.blueprint_id)
        .eq("printify_variant_id", variant.id)
        .maybeSingle();
      const priceCents = price?.price_cents ?? variant.price;
      if (!Number.isInteger(priceCents) || priceCents <= 0) continue;
      if (!price) {
        const { error } = await admin.from("product_variants").insert({
          blueprint_id: product.blueprint_id,
          printify_variant_id: variant.id,
          price_cents: priceCents,
          is_available: true,
        });
        expect(error, error?.message).toBeNull();
        seededVariant = { blueprintId: product.blueprint_id, variantId: variant.id };
      }
      return { productId: product.id, variantId: variant.id, title: product.title, variantTitle: variant.title, priceCents };
    }
  }
  throw new Error("No Printify product with an enabled variant in the test shop");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function poll<T>(
  fn: () => Promise<T | null | undefined>,
  predicate: (value: T) => boolean,
  { timeoutMs, intervalMs = 3000 }: { timeoutMs: number; intervalMs?: number },
): Promise<T | undefined> {
  const deadline = Date.now() + timeoutMs;
  let last: T | undefined;
  while (Date.now() < deadline) {
    const value = await fn();
    if (value) {
      last = value;
      if (predicate(value)) return value;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return last;
}

test.describe("Stripe test-mode flag", () => {
  test.skip(({ isMobile }) => isMobile, "Stripe payment integration runs once on desktop");
  let cartId: string | null = null;
  let paymentIntentId: string | null = null;

  test.afterAll(async () => {
    if (seededVariant) {
      await admin.from("product_variants").delete()
        .eq("blueprint_id", seededVariant.blueprintId)
        .eq("printify_variant_id", seededVariant.variantId);
      seededVariant = null;
    }
    if (paymentIntentId) {
      const idempotencyKey = `stripe_${paymentIntentId}`;
      const { data: orders } = await admin
        .from("orders")
        .select("id")
        .eq("idempotency_key", idempotencyKey);
      for (const order of orders ?? []) {
        await admin.from("order_items").delete().eq("order_id", order.id);
        await admin.from("invoices").delete().eq("order_id", order.id);
      }
      await admin.from("payment_transactions").delete().eq("stripe_payment_intent_id", paymentIntentId);
      await admin.from("orders").delete().eq("idempotency_key", idempotencyKey);
    }
    if (cartId) {
      await admin.from("cart_items").delete().eq("cart_id", cartId);
      await admin.from("carts").delete().eq("id", cartId);
    }
  });

  test("checkout with the test toggle uses Stripe test credentials end to end", async ({ page }) => {
    test.setTimeout(240_000);
    expect(TEST_USER_ID, "TEST_USER_ID must be set").toBeTruthy();
    expect(SUPABASE_URL, "must run against the test project").toContain("tgccxydchvujhrqyzqao");

    // ── Seed a cart with one selected item ───────────────────────────────
    const { data: cart, error: cartError } = await admin
      .from("carts")
      .insert({ user_id: TEST_USER_ID, status: "active" })
      .select()
      .single();
    expect(cartError, cartError?.message).toBeNull();
    cartId = cart!.id;

    const printify = await pickPrintifyProduct();
    const { error: itemError } = await admin.from("cart_items").insert({
      cart_id: cartId,
      product_id: printify.productId,
      product_name: `E2E Stripe test-mode: ${printify.title.slice(0, 40)}`,
      variant_id: String(printify.variantId),
      variant_name: printify.variantTitle,
      quantity: 1,
      unit_price: printify.priceCents,
      is_selected: true,
    });
    expect(itemError, itemError?.message).toBeNull();

    // ── Checkout page ────────────────────────────────────────────────────
    await page.goto(`/checkout?cartId=${cartId}`);

    const testToggle = page.locator("#testMode");
    await expect(testToggle).toBeVisible({ timeout: 20_000 });
    await testToggle.click();
    await expect(testToggle).toHaveAttribute("data-state", "checked");

    // The billing form is pre-filled from the profile; only fill what is empty.
    const fields: Array<[RegExp, string]> = [
      [/^first name/i, "E2E"],
      [/^last name/i, "StripeTest"],
      [/^email/i, "e2e-stripe@test.com"],
      [/^phone/i, "+31 20 123 4567"],
      [/^address line 1/i, "Kalverstraat 92"],
      [/^city/i, "Amsterdam"],
      [/^zip/i, "1012 PH"],
    ];
    for (const [label, value] of fields) {
      const input = page.getByRole("textbox", { name: label }).first();
      if (!(await input.inputValue())) await input.fill(value);
    }
    const country = page.getByRole("combobox", { name: /country/i });
    if (/select country/i.test((await country.textContent()) ?? "")) {
      await country.click();
      await page.getByRole("option", { name: /netherlands/i }).click();
    }

    const stripeRadio = page.getByRole("radio", { name: /credit card/i });
    if ((await stripeRadio.getAttribute("aria-checked")) !== "true") await stripeRadio.click();

    // ── Pay and capture the create-payment-intent round trip ─────────────
    const intentRequest = page.waitForRequest(
      (r) => r.method() === "POST" && r.url().includes("/functions/v1/create-payment-intent"),
      { timeout: 30_000 },
    );
    const intentResponse = page.waitForResponse(
      (r) => r.url().includes("/functions/v1/create-payment-intent"),
      { timeout: 60_000 },
    );

    const payButton = page.getByRole("button", { name: /^pay\s*€/i });
    await expect(payButton).toBeEnabled({ timeout: 15_000 });
    await payButton.click();

    const request = await intentRequest;
    const body = request.postDataJSON();
    expect(body.test_mode, "client must send the test flag").toBe(true);
    expect(body.payment_method, "test toggle uses a predefined method").toMatch(/^pm_card_/);

    const response = await intentResponse;
    const responseBody = await response.json().catch(() => ({}));
    expect(response.status(), JSON.stringify(responseBody)).toBe(200);
    paymentIntentId = responseBody.paymentIntentId;
    expect(paymentIntentId).toMatch(/^pi_/);

    await expect(page).toHaveURL(/\/checkout\/stripe-return/, { timeout: 30_000 });

    // ── Server-side state written by the edge functions + webhook ────────
    const payment = await poll(
      async () =>
        (await admin
          .from("payment_transactions")
          .select("status, metadata, order_id")
          .eq("stripe_payment_intent_id", paymentIntentId!)
          .maybeSingle()).data,
      (p) => p.status === "succeeded",
      { timeoutMs: 90_000 },
    );
    expect(payment, "payment_transactions row for the intent").toBeTruthy();
    expect((payment!.metadata as Record<string, unknown>)?.stripe_mode).toBe("test");
    expect(payment!.status, "webhook must have marked the payment succeeded").toBe("succeeded");

    const order = await poll(
      async () =>
        (await admin
          .from("orders")
          .select("id, payment_status, payment_method, order_number")
          .eq("idempotency_key", `stripe_${paymentIntentId}`)
          .maybeSingle()).data,
      (o) => o.payment_status === "paid",
      { timeoutMs: 90_000 },
    );
    expect(order, "order created on the return page").toBeTruthy();
    // The webhook stamps payment_method when it marks the order paid.
    expect(order!.payment_method).toBe("stripe");
    expect(order!.payment_status, "webhook must have marked the order paid").toBe("paid");
  });
});
