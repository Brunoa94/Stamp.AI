import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rest: vi.fn(), printify: vi.fn() }));
vi.mock("../../../supabase/functions/_shared/supabase.ts", () => ({ supabaseRest: mocks.rest }));
vi.mock("../../../supabase/functions/_shared/fetchWithTimeout.ts", () => ({ fetchPrintify: mocks.printify }));
vi.mock("../../../supabase/functions/_shared/validators.ts", () => ({ validateEnvVars: {
  printifyShopId: () => "shop", printifyToken: () => "token",
} }));
vi.mock("../../../supabase/functions/_shared/errorReporting.ts", () => ({ reportError: vi.fn() }));
import { priceCheckout, pricingMetadata, requireClientTotal } from "../../../supabase/functions/_shared/checkoutPricing";
import { parseStoredPricing, chargeMatchesPricing } from "../../../supabase/functions/_shared/orderFinalizationRules";

let promotionalPrice: number | null;
beforeEach(() => {
  promotionalPrice = 2000;
  mocks.rest.mockReset();
  mocks.rest.mockImplementation(async (url: string) => ({ error: null, data:
    url.startsWith("catalog_products?") ? [
      { blueprint_id: 6, selling_price_cents: 3000, promotional_price: promotionalPrice, is_active: true },
      { blueprint_id: 7, selling_price_cents: 2500, promotional_price: null, is_active: true },
    ] : url.startsWith("product_variants?") ? [
      { blueprint_id: 6, printify_variant_id: 101, is_available: true },
      { blueprint_id: 7, printify_variant_id: 102, is_available: true },
    ] : url.startsWith("promocodes?") ? [{ code: "SAVE10", type: "percentage", value: 10,
      is_active: true, expires_at: null, max_uses: null, used_count: 0 }] : [{ user_id: "user" }],
  }));
  mocks.printify.mockResolvedValue(new Response(JSON.stringify({ blueprint_id: 6, variants: [{ id: 101, is_enabled: true }] })));
});
const lines = [
  { blueprint_id: 6, variant_id: 101, quantity: 2 },
  { blueprint_id: 7, variant_id: 102, quantity: 1 },
];

describe("server promotions shared by Stripe, PayPal and Mollie", () => {
  it("prices mixed items and stacks a coupon before checking shipping", async () => {
    const priced = await priceCheckout({ lineItems: lines, promoCode: " save10 ", userId: "user" });
    expect(priced).toMatchObject({ subtotalCents: 6500, discountCents: 650, shippingCents: 499, totalCents: 6349 });
    expect(priced.items[0]).toMatchObject({ unitPriceCents: 2000, regularPriceCents: 3000, quantity: 2 });
    expect(() => requireClientTotal(priced, 6349)).not.toThrow();
    expect(() => requireClientTotal(priced, 8349)).toThrow(/does not match/);
    expect(() => requireClientTotal(priced, 1)).toThrow(/does not match/);
  });
  it("refreshes existing carts when offers activate and end", async () => {
    promotionalPrice = null;
    const regular = await priceCheckout({ lineItems: lines, userId: "user" });
    expect(regular.subtotalCents).toBe(8500);
    promotionalPrice = 2000;
    expect((await priceCheckout({ lineItems: lines, userId: "user" })).subtotalCents).toBe(6500);
    promotionalPrice = null;
    expect((await priceCheckout({ lineItems: lines, userId: "user" })).subtotalCents).toBe(8500);
  });
  it("resolves existing customized products through their blueprint", async () => {
    const priced = await priceCheckout({ lineItems: [{ product_id: "abc123", variant_id: 101, quantity: 3 }], userId: "user" });
    expect(priced.items[0]).toMatchObject({ productId: "abc123", blueprintId: 6, unitPriceCents: 2000 });
    expect(priced.shippingCents).toBe(0);
  });
  it("retains paid promotional prices after the catalog changes", async () => {
    const paid = await priceCheckout({ lineItems: lines, userId: "user" });
    const metadata = pricingMetadata(paid);
    promotionalPrice = null;
    const current = await priceCheckout({ lineItems: lines, userId: "user" });
    const stored = parseStoredPricing(metadata)!;
    expect(stored.items[0].unitPriceCents).toBe(2000);
    expect(chargeMatchesPricing(paid.totalCents / 100, "EUR", stored)).toBe(true);
    expect(chargeMatchesPricing(current.totalCents / 100, "EUR", stored)).toBe(false);
  });
});
