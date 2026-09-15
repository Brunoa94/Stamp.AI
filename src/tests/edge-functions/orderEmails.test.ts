import { describe, expect, it } from "vitest";
import {
  buildOrderConfirmationEmail,
  type OrderEmailItemI,
  type OrderEmailOrderI,
} from "../../../supabase/functions/_shared/orderConfirmationEmail";
import {
  buildShippingNotificationEmail,
  isFirstTrackingAppearance,
} from "../../../supabase/functions/_shared/shippingNotificationEmail";
import {
  escapeHtml,
  formatAddressLines,
  formatMoney,
} from "../../../supabase/functions/_shared/emailFormatting";

/**
 * Pure template builders used by _shared/orderEmails.ts (Deno glue). Amounts
 * are stored in cents, as everywhere else in the orders/invoices tables.
 */

function makeOrder(overrides: Partial<OrderEmailOrderI> = {}): OrderEmailOrderI {
  return {
    id: "order-1",
    order_number: "ORD-1700000000-ABC123",
    customer_name: "Bruno Afonso",
    customer_email: "bruno@example.com",
    currency: "eur",
    subtotal: 4998,
    shipping_cost: 499,
    discount_amount: 500,
    tax_amount: 0,
    total_amount: 4997,
    shipping_address: {
      first_name: "Bruno",
      last_name: "Afonso",
      address1: "Main Street 1",
      city: "Copenhagen",
      zip: "2100",
      country: "DK",
    },
    created_at: "2026-09-15T10:00:00.000Z",
    ...overrides,
  };
}

const items: OrderEmailItemI[] = [
  { product_name: "Classic Tee", variant_name: "Black / M", quantity: 2, unit_price: 1999, total_price: 3998 },
  { product_name: "Mug", variant_name: null, quantity: 1, unit_price: 1000, total_price: 1000 },
];

describe("emailFormatting", () => {
  it("formats cents with the currency symbol", () => {
    expect(formatMoney(4997, "eur")).toBe("€49.97");
    expect(formatMoney(100, "usd")).toBe("$1.00");
    expect(formatMoney(250, "chf")).toBe("2.50 CHF");
    expect(formatMoney(null, "eur")).toBe("€0.00");
  });

  it("escapes HTML", () => {
    expect(escapeHtml(`<b>"a" & 'b'</b>`)).toBe("&lt;b&gt;&quot;a&quot; &amp; &#x27;b&#x27;&lt;/b&gt;");
  });

  it("flattens snake_case and camelCase addresses and drops empty lines", () => {
    expect(
      formatAddressLines({ firstName: "A", lastName: "B", address1: "Street 1", zipCode: "1000", city: "X", country: "PT" }),
    ).toEqual(["A B", "Street 1", "1000 X", "PT"]);
    expect(formatAddressLines(null)).toEqual([]);
  });
});

describe("buildOrderConfirmationEmail", () => {
  const email = buildOrderConfirmationEmail({
    order: makeOrder(),
    items,
    orderUrl: "https://stamp.ai/orders/order-1",
    seller: { name: "Stamp.AI", supportEmail: "support@stamp.ai" },
  });

  it("puts the order number in the subject", () => {
    expect(email.subject).toBe("Stamp.AI — Order ORD-1700000000-ABC123 confirmed");
  });

  it("lists every item with quantity and line total", () => {
    expect(email.html).toContain("Classic Tee");
    expect(email.html).toContain("Black / M");
    expect(email.html).toContain("× 2");
    expect(email.html).toContain("€39.98");
    expect(email.html).toContain("Mug");
    expect(email.text).toContain("Classic Tee (Black / M) × 2 — €39.98");
  });

  it("shows subtotal, shipping, discount and total", () => {
    expect(email.html).toContain("€49.98");
    expect(email.html).toContain("€4.99");
    expect(email.html).toContain("-€5.00");
    expect(email.html).toContain("€49.97");
    expect(email.text).toContain("Total: €49.97");
  });

  it("includes the shipping address and the order link", () => {
    expect(email.html).toContain("Main Street 1");
    expect(email.html).toContain("2100 Copenhagen");
    expect(email.html).toContain('href="https://stamp.ai/orders/order-1"');
    expect(email.text).toContain("https://stamp.ai/orders/order-1");
  });

  it("greets by first name and mentions support", () => {
    expect(email.html).toContain("Hi Bruno,");
    expect(email.html).toContain("support@stamp.ai");
  });

  it("escapes customer-controlled values", () => {
    const hostile = buildOrderConfirmationEmail({
      order: makeOrder({ customer_name: "<script>alert(1)</script>" }),
      items: [{ ...items[0], product_name: '<img src=x onerror="x">' }],
      orderUrl: "https://stamp.ai/orders/order-1",
      seller: { name: "Stamp.AI", supportEmail: "support@stamp.ai" },
    });

    expect(hostile.html).not.toContain("<script>");
    expect(hostile.html).not.toContain("<img");
    expect(hostile.html).toContain("&lt;script&gt;");
  });

  it("omits the discount row and the link when absent", () => {
    const plain = buildOrderConfirmationEmail({
      order: makeOrder({ discount_amount: 0, customer_name: null }),
      items,
      seller: { name: "Stamp.AI", supportEmail: "support@stamp.ai" },
    });

    expect(plain.html).not.toContain("Discount");
    expect(plain.html).not.toContain("View my orders");
    expect(plain.html).not.toContain('href="https://');
    expect(plain.html).toContain("Hi,");
  });
});

describe("buildShippingNotificationEmail", () => {
  it("includes tracking number, carrier and a tracking link", () => {
    const email = buildShippingNotificationEmail({
      order: makeOrder(),
      trackingNumber: "1Z999",
      trackingUrl: "https://track.example/1Z999",
      carrier: "UPS",
      orderUrl: "https://stamp.ai/orders/order-1",
      seller: { name: "Stamp.AI", supportEmail: "support@stamp.ai" },
    });

    expect(email.subject).toBe("Stamp.AI — Your order ORD-1700000000-ABC123 has shipped");
    expect(email.html).toContain("1Z999");
    expect(email.html).toContain("UPS");
    expect(email.html).toContain('href="https://track.example/1Z999"');
    expect(email.text).toContain("Tracking number: 1Z999");
    expect(email.text).toContain("https://track.example/1Z999");
  });

  it("works without a tracking url or carrier and escapes the tracking number", () => {
    const email = buildShippingNotificationEmail({
      order: makeOrder(),
      trackingNumber: '<a href="x">1</a>',
      trackingUrl: null,
      seller: { name: "Stamp.AI", supportEmail: "support@stamp.ai" },
    });

    expect(email.html).not.toContain('<a href="x">');
    expect(email.html).not.toContain("Track your package");
    expect(email.text).not.toContain("http");
  });
});

describe("isFirstTrackingAppearance", () => {
  it("is true only when the update adds a tracking number to an order that had none", () => {
    expect(isFirstTrackingAppearance(null, { tracking_number: "1Z" })).toBe(true);
    expect(isFirstTrackingAppearance("", { tracking_number: "1Z" })).toBe(true);
    expect(isFirstTrackingAppearance("OLD", { tracking_number: "NEW" })).toBe(false);
    expect(isFirstTrackingAppearance(null, { status: "shipped" })).toBe(false);
    expect(isFirstTrackingAppearance(null, null)).toBe(false);
  });
});
