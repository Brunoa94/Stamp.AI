import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

test.describe("Checkout payment choices", () => {
  test.describe.configure({ mode: "serial" });

  let cartId: string;

  test.beforeEach(async () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toContain(
      "tgccxydchvujhrqyzqao",
    );
    const { data: cart, error } = await admin
      .from("carts")
      .insert({ user_id: process.env.TEST_USER_ID!, status: "abandoned" })
      .select("id")
      .single();
    expect(error, error?.message).toBeNull();
    cartId = cart!.id;
    const { error: itemError } = await admin.from("cart_items").insert({
      cart_id: cartId,
      product_id: `test-payment-choice-${cartId}`,
      product_name: "E2E Payment Choice Tee",
      variant_id: "1",
      variant_name: "Black / M",
      quantity: 1,
      unit_price: 2499,
      is_selected: true,
    });
    expect(itemError, itemError?.message).toBeNull();
  });

  test.afterEach(async () => {
    if (!cartId) return;
    await admin.from("cart_items").delete().eq("cart_id", cartId);
    await admin.from("carts").delete().eq("id", cartId);
  });

  async function openReadyCheckout(page: import("@playwright/test").Page) {
    await page.goto(`/checkout?cartId=${cartId}`);
    await expect(page.getByText("E2E Payment Choice Tee")).toBeVisible({ timeout: 20_000 });
    const fields: Array<[RegExp, string]> = [
      [/^first name/i, "E2E"],
      [/^last name/i, "PaymentTest"],
      [/^email/i, "e2e-payment@test.com"],
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
  }

  for (const choice of [
    { name: "PayPal", method: "paypal", path: "create-paypal-order" },
    { name: "iDEAL", method: "ideal", path: "create-mollie-payment" },
  ] as const) {
    test(`${choice.name} selection sends the priced checkout payload`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await page.route(`**/functions/v1/${choice.path}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            choice.method === "paypal"
              ? { orderId: "test-paypal-order", approvalUrl: "about:blank" }
              : {
                  paymentId: "test-mollie-payment",
                  checkoutUrl: "about:blank",
                },
          ),
        }),
      );
      await openReadyCheckout(page);
      await page
        .getByRole("radio", { name: new RegExp(`^${choice.name}`, "i") })
        .click();
      const confirm = page.getByRole("button", {
        name: new RegExp(`confirm order.*${choice.name}`, "i"),
      });
      await expect(confirm).toBeEnabled();
      const requestPromise = page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url().includes(`/functions/v1/${choice.path}`),
      );
      await confirm.click();
      const body = (await requestPromise).postDataJSON();
      expect(body.amount).toBeGreaterThan(0);
      expect(body.shipping_cost_cents).toBeGreaterThanOrEqual(0);
      expect(body.discount_cents).toBe(0);
      expect(body.line_items).toHaveLength(1);
      expect(Math.round(body.amount * 100)).toBe(
        2499 + body.shipping_cost_cents - body.discount_cents,
      );
      if (choice.method === "ideal") expect(body.method).toBe("ideal");
    });
  }
});
