import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Server-side order pricing (SEC-06)
 *
 * The create-payment-intent / create-paypal-order / create-mollie-payment
 * functions must charge the SERVER total: every line item priced from the
 * catalog, discount derived from the promo code, shipping from the server
 * rule. The client amount is only a consistency check.
 */

const supabaseRest = vi.fn();

vi.mock("../../../supabase/functions/_shared/supabase.ts", () => ({
  supabaseRest: (...args: unknown[]) => supabaseRest(...args),
}));

import {
  normalizeLineItemsForPricing,
  priceOrderRequest,
  sanitizeClientMetadata,
  SHIPPING_COST_CENTS,
} from "../../../supabase/functions/_shared/serverPriceService.ts";
import { FunctionError } from "../../../supabase/functions/_shared/errors.ts";

interface CatalogFixture {
  variants?: Array<{ blueprint_id: number; printify_variant_id: number; price_cents: number | null }>;
  promocodes?: Array<Record<string, unknown>>;
}

function stubCatalog({ variants = [], promocodes = [] }: CatalogFixture) {
  supabaseRest.mockImplementation(async (endpoint: string) => {
    if (endpoint.startsWith("catalog_products")) {
      return { data: [{ blueprint_id: 5, display_title: "Tee" }], error: null, status: 200 };
    }
    if (endpoint.startsWith("product_variants")) {
      return { data: variants, error: null, status: 200 };
    }
    if (endpoint.startsWith("promocodes")) {
      const code = decodeURIComponent(endpoint.match(/code=eq\.([^&]+)/)?.[1] ?? "");
      return { data: promocodes.filter((p) => p.code === code), error: null, status: 200 };
    }
    throw new Error(`unexpected endpoint ${endpoint}`);
  });
}

async function expectFunctionError(promise: Promise<unknown>, errorId: string) {
  await expect(promise).rejects.toBeInstanceOf(FunctionError);
  await promise.catch((error: FunctionError) => {
    expect(error.status).toBe(400);
    expect(error.errorId).toBe(errorId);
  });
}

const TEE = { blueprint_id: 5, printify_variant_id: 77, price_cents: 2499 };

beforeEach(() => {
  supabaseRest.mockReset();
});

describe("normalizeLineItemsForPricing", () => {
  it("accepts variant_id (what the checkout sends) as well as printify_variant_id", () => {
    const result = normalizeLineItemsForPricing([
      { blueprint_id: 5, variant_id: 77, quantity: 2 },
      { blueprint_id: 5, printify_variant_id: 78, quantity: 1 },
    ]);
    expect(result.errors).toEqual([]);
    expect(result.items).toEqual([
      { blueprint_id: 5, printify_variant_id: 77, quantity: 2 },
      { blueprint_id: 5, printify_variant_id: 78, quantity: 1 },
    ]);
  });

  it("reports every item that cannot be priced instead of skipping it", () => {
    const result = normalizeLineItemsForPricing([
      { blueprint_id: 5, variant_id: 77 },
      { product_id: "abc", variant_id: 77 },
      { blueprint_id: 5, variant_id: 77, quantity: 0 },
    ]);
    expect(result.items).toHaveLength(1);
    expect(result.errors).toEqual([
      "Line item 1: missing or invalid blueprint_id",
      "Line item 2: invalid quantity",
    ]);
  });

  it("rejects missing or empty line_items", () => {
    expect(normalizeLineItemsForPricing(undefined).errors).toHaveLength(1);
    expect(normalizeLineItemsForPricing([]).errors).toHaveLength(1);
  });
});

describe("priceOrderRequest", () => {
  it("prices an item that only carries variant_id (subtotal + shipping)", async () => {
    stubCatalog({ variants: [TEE] });

    const pricing = await priceOrderRequest({
      line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 2 }],
      clientTotalCents: 4998 + SHIPPING_COST_CENTS,
    });

    expect(pricing).toMatchObject({
      subtotal_cents: 4998,
      shipping_cost_cents: SHIPPING_COST_CENTS,
      discount_cents: 0,
      promo_code: null,
      total_cents: 4998 + SHIPPING_COST_CENTS,
    });
  });

  it("gives free shipping at or above the threshold", async () => {
    stubCatalog({ variants: [TEE] });

    const pricing = await priceOrderRequest({
      line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 3 }],
      clientTotalCents: 7497,
    });

    expect(pricing.shipping_cost_cents).toBe(0);
    expect(pricing.total_cents).toBe(7497);
  });

  it("rejects when any item is unknown in the catalog", async () => {
    stubCatalog({ variants: [TEE] });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [
          { blueprint_id: 5, variant_id: 77, quantity: 1 },
          { blueprint_id: 5, variant_id: 999, quantity: 1 },
        ],
        clientTotalCents: 2499 + SHIPPING_COST_CENTS,
      }),
      "INVALID_LINE_ITEMS",
    );
  });

  it("rejects an item without blueprint_id instead of skipping validation", async () => {
    stubCatalog({ variants: [TEE] });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [{ product_id: "p1", variant_id: 77, quantity: 1 }],
        clientTotalCents: 1,
      }),
      "INVALID_LINE_ITEMS",
    );
    expect(supabaseRest).not.toHaveBeenCalled();
  });

  it("rejects missing line_items", async () => {
    await expectFunctionError(
      priceOrderRequest({ line_items: undefined, clientTotalCents: 100 }),
      "INVALID_LINE_ITEMS",
    );
  });

  it("rejects a client amount that differs from the server total by more than 1 cent", async () => {
    stubCatalog({ variants: [TEE] });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
        clientTotalCents: 1,
      }),
      "PRICE_MISMATCH",
    );
  });

  it("tolerates a 1 cent rounding difference", async () => {
    stubCatalog({ variants: [TEE] });

    const pricing = await priceOrderRequest({
      line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
      clientTotalCents: 2499 + SHIPPING_COST_CENTS - 1,
    });

    // The server total is what gets charged, not the client's figure
    expect(pricing.total_cents).toBe(2499 + SHIPPING_COST_CENTS);
  });

  it("rejects a discount claimed without a promo code", async () => {
    stubCatalog({ variants: [TEE] });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
        discount_cents: 2000,
        clientTotalCents: 2499 + SHIPPING_COST_CENTS - 2000,
      }),
      "INVALID_PRICING_INPUT",
    );
  });

  it("ignores a client shipping figure that does not match the server rule", async () => {
    stubCatalog({ variants: [TEE] });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
        shipping_cost_cents: 0,
        clientTotalCents: 2499,
      }),
      "PRICE_MISMATCH",
    );
  });

  it("rejects negative or non-integer hints", async () => {
    stubCatalog({ variants: [TEE] });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
        shipping_cost_cents: -499,
        clientTotalCents: 2000,
      }),
      "INVALID_PRICING_INPUT",
    );
  });

  it("computes a percentage promo discount server-side", async () => {
    stubCatalog({
      variants: [TEE],
      promocodes: [{ code: "TEN", type: "percentage", value: 10, is_active: true, expires_at: null, max_uses: null, used_count: 0 }],
    });

    const pricing = await priceOrderRequest({
      line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
      promo_code: "ten",
      clientTotalCents: 2499 + SHIPPING_COST_CENTS - 250,
    });

    expect(pricing).toMatchObject({
      promo_code: "TEN",
      discount_cents: 250,
      total_cents: 2499 + SHIPPING_COST_CENTS - 250,
    });
  });

  it("computes a fixed promo discount server-side and caps it at the subtotal", async () => {
    stubCatalog({
      variants: [TEE],
      promocodes: [{ code: "BIG", type: "numeric", value: 100, is_active: true, expires_at: null, max_uses: null, used_count: 0 }],
    });

    const pricing = await priceOrderRequest({
      line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
      promo_code: "BIG",
      discount_cents: 2499,
      clientTotalCents: SHIPPING_COST_CENTS,
    });

    expect(pricing.discount_cents).toBe(2499);
    expect(pricing.total_cents).toBe(SHIPPING_COST_CENTS);
  });

  it("rejects a discount hint that differs from the promo code's discount", async () => {
    stubCatalog({
      variants: [TEE],
      promocodes: [{ code: "TEN", type: "percentage", value: 10, is_active: true, expires_at: null, max_uses: null, used_count: 0 }],
    });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
        promo_code: "TEN",
        discount_cents: 2400,
        clientTotalCents: 2499 + SHIPPING_COST_CENTS - 2400,
      }),
      "INVALID_PRICING_INPUT",
    );
  });

  it.each([
    ["unknown", []],
    ["inactive", [{ code: "X", type: "percentage", value: 10, is_active: false, expires_at: null, max_uses: null, used_count: 0 }]],
    ["expired", [{ code: "X", type: "percentage", value: 10, is_active: true, expires_at: "2000-01-01T00:00:00Z", max_uses: null, used_count: 0 }]],
    ["exhausted", [{ code: "X", type: "percentage", value: 10, is_active: true, expires_at: null, max_uses: 2, used_count: 2 }]],
  ])("rejects an %s promo code", async (_label, promocodes) => {
    stubCatalog({ variants: [TEE], promocodes });

    await expectFunctionError(
      priceOrderRequest({
        line_items: [{ blueprint_id: 5, variant_id: 77, quantity: 1 }],
        promo_code: "X",
        clientTotalCents: 2499 + SHIPPING_COST_CENTS,
      }),
      "INVALID_PROMO_CODE",
    );
  });
});

describe("sanitizeClientMetadata", () => {
  it("strips order_id and other server-owned keys from client metadata", () => {
    expect(
      sanitizeClientMetadata({
        order_id: "order_1234",
        user_id: "attacker",
        test_mode: true,
        cartId: "c1",
      }),
    ).toEqual({ test_mode: true, cartId: "c1" });
  });

  it("returns an empty object for non-object metadata", () => {
    expect(sanitizeClientMetadata(undefined)).toEqual({});
    expect(sanitizeClientMetadata("x")).toEqual({});
    expect(sanitizeClientMetadata([1])).toEqual({});
  });
});
