import { describe, expect, it } from "vitest";
import { isProductionEnv, resolveBrevoConfig } from "../../../supabase/functions/_shared/emailConfig";
import {
  renderOrderConfirmationEmail,
  renderShippingNotificationEmail,
  type EmailOrderI,
} from "../../../supabase/functions/_shared/orderEmailContent";

const order: EmailOrderI = {
  order_number: "ORD-1",
  customer_name: "Ann <b>Lee</b>",
  currency: "EUR",
  subtotal: 5997,
  discount_amount: 500,
  shipping_cost: 499,
  tax_amount: 1040,
  total_amount: 5996,
  shipping_address: { first_name: "Ann", last_name: "Lee", address1: "Main 1", city: "Utrecht", zip: "3511", country: "NL" },
  tracking_number: "TRACK-1",
  tracking_url: "https://track.example/1",
};

describe("resolveBrevoConfig", () => {
  it("is ready with a key and sender", () => {
    expect(resolveBrevoConfig({ BREVO_API_KEY: "k", BREVO_FROM_EMAIL: "shop@stamp.ai" })).toEqual({
      status: "ready", apiKey: "k", fromEmail: "shop@stamp.ai", fromName: "Stamp.AI",
    });
  });

  it("is disabled without a key outside production", () => {
    expect(resolveBrevoConfig({ APP_ENV: "test" })).toEqual({ status: "disabled" });
  });

  it("is a misconfiguration in production or without a sender", () => {
    expect(resolveBrevoConfig({})).toEqual({ status: "misconfigured", missing: ["BREVO_API_KEY", "BREVO_FROM_EMAIL"] });
    expect(resolveBrevoConfig({ APP_ENV: "test", BREVO_API_KEY: "k" })).toEqual({ status: "misconfigured", missing: ["BREVO_FROM_EMAIL"] });
  });

  it("treats an unset APP_ENV as production", () => {
    expect(isProductionEnv({})).toBe(true);
    expect(isProductionEnv({ APP_ENV: "test" })).toBe(false);
  });
});

describe("order emails", () => {
  it("confirms the order with items, totals and address, escaping user data", () => {
    const email = renderOrderConfirmationEmail(order, [
      { product_name: "Kids Tee", variant_name: "Black / S", quantity: 2, total_price: 3998 },
      { product_name: "<script>x</script>", variant_name: null, quantity: 1, total_price: 1999 },
    ]);
    expect(email.subject).toContain("ORD-1");
    expect(email.html).toContain("2 × Kids Tee (Black / S)");
    expect(email.html).toContain("€59.96");
    expect(email.html).toContain("-€5.00");
    expect(email.html).toContain("VAT included");
    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<b>Lee</b>");
    expect(email.text).toContain("Total: €59.96");
    expect(email.text).toContain("Utrecht");
  });

  it("announces shipping with tracking and only links to web URLs", () => {
    const email = renderShippingNotificationEmail(order);
    expect(email.subject).toContain("has shipped");
    expect(email.html).toContain('href="https://track.example/1"');
    expect(email.text).toContain("Tracking number: TRACK-1");

    const unsafe = renderShippingNotificationEmail({ ...order, tracking_url: "javascript:alert(1)" });
    expect(unsafe.html).not.toContain("javascript:");
  });
});
