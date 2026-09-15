import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  createPayPalOrder: vi.fn(),
  upsert: vi.fn(),
  tables: {} as Record<string, { data: unknown; error: unknown }>,
}));

/**
 * Minimal thenable query builder: `.select().in().eq()` chain that resolves to
 * the configured table result, plus `.maybeSingle()` for single-row lookups.
 */
function fakeQuery(table: string) {
  const result = () => mocks.tables[table] ?? { data: [], error: null };
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "in", "eq"]) {
    builder[method] = () => builder;
  }
  builder.maybeSingle = async () => {
    const { data, error } = result();
    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
  };
  builder.upsert = mocks.upsert;
  builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve);
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: (table: string) => fakeQuery(table),
  }),
}));

vi.mock("@/lib/paypal-server", () => ({
  createPayPalOrder: mocks.createPayPalOrder,
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: vi.fn(),
}));

import { POST } from "./route";

const lineItems = [{ blueprint_id: 145, variant_id: 4012, quantity: 1, print_areas: {} }];
const shippingAddress = {
  first_name: "Jane",
  last_name: "Doe",
  address1: "Main 1",
  city: "Amsterdam",
  region: "NH",
  zip: "1011AB",
  country: "NL",
};

function request(body: Record<string, unknown> = {}) {
  return new NextRequest("https://stamp.ai/api/paypal/create-order", {
    method: "POST",
    body: JSON.stringify({
      amount: 29.99, // 25.00 catalog + 4.99 shipping
      lineItems,
      shippingAddress,
      returnUrl: "https://stamp.ai/return",
      cancelUrl: "https://stamp.ai/cancel",
      ...body,
    }),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/paypal/create-order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "jane@example.com" } } });
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.createPayPalOrder.mockResolvedValue({
      id: "PAYPAL-1",
      links: [{ rel: "approve", href: "https://paypal.test/approve" }],
    });
    mocks.tables.product_variants = {
      data: [{ blueprint_id: 145, printify_variant_id: 4012, price_cents: 2500 }],
      error: null,
    };
    mocks.tables.catalog_products = { data: [{ blueprint_id: 145, display_title: "Tee" }], error: null };
    mocks.tables.promocodes = { data: [], error: null };
  });

  it("rejects unauthenticated callers", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(mocks.createPayPalOrder).not.toHaveBeenCalled();
  });

  it("rejects line items that cannot be priced from the catalog", async () => {
    const response = await POST(request({ lineItems: [{ product_id: "abc", variant_id: 1, quantity: 1 }] }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_LINE_ITEMS" });
    expect(mocks.createPayPalOrder).not.toHaveBeenCalled();
  });

  it("rejects a client amount that does not match the catalog total", async () => {
    const response = await POST(request({ amount: 1 }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "PRICE_MISMATCH" });
    expect(mocks.createPayPalOrder).not.toHaveBeenCalled();
  });

  it("creates the PayPal order with the server-computed total", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      orderId: "PAYPAL-1",
      approvalUrl: "https://paypal.test/approve",
    });
    expect(mocks.createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 29.99, currency: "EUR" }),
    );
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 29.99,
        metadata: expect.objectContaining({ total_cents: 2999, shipping_cents: 499, promo_code: null }),
      }),
      { onConflict: "paypal_order_id" },
    );
  });

  it("derives the promo discount from the promocodes table", async () => {
    mocks.tables.promocodes = { data: [{ code: "SAVE10", type: "percentage", value: 10 }], error: null };
    // 25.00 - 2.50 + 4.99 shipping = 27.49
    const response = await POST(request({ amount: 27.49, promoCode: "save10" }));
    expect(response.status).toBe(200);
    expect(mocks.createPayPalOrder).toHaveBeenCalledWith(expect.objectContaining({ amount: 27.49 }));
    const customId = JSON.parse(mocks.createPayPalOrder.mock.calls[0][0].customId);
    expect(customId.promo_code).toBe("SAVE10");
  });

  it("rejects an unknown promo code", async () => {
    const response = await POST(request({ amount: 27.49, promoCode: "NOPE" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_PROMO_CODE" });
  });
});
