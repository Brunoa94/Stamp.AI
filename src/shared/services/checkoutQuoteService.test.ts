import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("./authHelpers", () => ({ getAuthenticatedHeaders: vi.fn() }));
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedHeaders } from "./authHelpers";
import { applyQuoteToCart, CheckoutQuoteService, quoteLineItems, type CheckoutQuote } from "./checkoutQuoteService";
import { CartServiceMapper } from "@/shared/mappers/services/cartServiceMapper";
import type { CartWithItems } from "@/shared/types/cart";

const cart = { id: "cart", cart_items: [
  { id: "a", product_id: "abc123", variant_id: "101", quantity: 2, unit_price: 3000, is_selected: true },
  { id: "b", product_id: "abc123", variant_id: "101", quantity: 1, unit_price: 3000, is_selected: false },
] } as CartWithItems;
const quote: CheckoutQuote = { items: [
  { productId: "abc123", blueprintId: 6, variantId: 101, quantity: 2, unitPriceCents: 2000, regularPriceCents: 3000 },
  { productId: "abc123", blueprintId: 6, variantId: 101, quantity: 1, unitPriceCents: 2000, regularPriceCents: 3000 },
], subtotalCents: 6000, discountCents: 0, shippingCents: 0, totalCents: 6000, promoCode: null };

describe("cart quote reconciliation", () => {
  it("reprices duplicate variants without changing selection or persisted snapshots", () => {
    const priced = applyQuoteToCart(cart, quote);
    expect(priced.cart_items.map((item) => item.unit_price)).toEqual([2000, 2000]);
    expect(cart.cart_items[0].unit_price).toBe(3000);
    const selected = CartServiceMapper.mapCartToCheckoutCart(priced);
    expect(selected.cart_items.map((item) => item.id)).toEqual(["a"]);
    expect(CartServiceMapper.calculateCartTotals(selected.cart_items)).toMatchObject({ subtotal: 4000, shipping: 499 });
    expect(quoteLineItems(cart)[0]).toEqual({ product_id: "abc123", variant_id: 101, quantity: 2 });
  });
  it("rejects mismatched quote identities or quantities", () => {
    expect(() => applyQuoteToCart(cart, { ...quote, items: [] })).toThrow();
    expect(() => applyQuoteToCart(cart, { ...quote, items: [{ ...quote.items[0], quantity: 1 }, quote.items[1]] })).toThrow();
    expect(() => applyQuoteToCart(cart, { ...quote, items: [{ ...quote.items[0], productId: "other" }, quote.items[1]] })).toThrow();
  });
});

it("authenticates quote calls and rejects inconsistent server responses", async () => {
  vi.mocked(getAuthenticatedHeaders).mockResolvedValue({ Authorization: "Bearer session" });
  const invoke = vi.fn().mockResolvedValue({ data: quote, error: null });
  vi.mocked(createClient).mockReturnValue({ functions: { invoke } } as unknown as ReturnType<typeof createClient>);
  await expect(CheckoutQuoteService.quote(quoteLineItems(cart))).resolves.toEqual(quote);
  expect(invoke).toHaveBeenCalledWith("checkout-quote", expect.objectContaining({ headers: { Authorization: "Bearer session" } }));
  invoke.mockResolvedValueOnce({ data: { ...quote, totalCents: 1 }, error: null });
  await expect(CheckoutQuoteService.quote(quoteLineItems(cart))).rejects.toThrow(/Inconsistent/);
  invoke.mockResolvedValueOnce({ data: { ...quote, items: [{ ...quote.items[0], unitPriceCents: -1 }] }, error: null });
  await expect(CheckoutQuoteService.quote(quoteLineItems(cart))).rejects.toThrow();
});
it("preserves a quote function error code for callers", async () => {
  const invoke = vi.fn().mockResolvedValue({ data: null,
    error: { context: new Response(JSON.stringify({ error: "PRODUCT_NOT_PRICED" }), { status: 400 }) } });
  vi.mocked(createClient).mockReturnValue({ functions: { invoke } } as unknown as ReturnType<typeof createClient>);
  await expect(CheckoutQuoteService.quote(quoteLineItems(cart))).rejects.toMatchObject({ code: "PRODUCT_NOT_PRICED" });
});
