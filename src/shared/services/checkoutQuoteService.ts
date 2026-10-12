import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedHeaders } from "./authHelpers";
import { readFunctionErrorCode } from "@/lib/functionErrorCode";
import type { CartWithItems } from "@/shared/types/cart";
import type { PrintifyLineItem } from "@/shared/types/printifyOrder";

export interface CheckoutQuote {
  items: Array<{ blueprintId: number; variantId: number; quantity: number;
    productId?: string; unitPriceCents: number; regularPriceCents?: number }>;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  promoCode: string | null;
}

const cents = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const quoteSchema = z.object({
  items: z.array(z.object({
    blueprintId: z.number().int().positive(), variantId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99), productId: z.string().optional(),
    unitPriceCents: cents.positive(), regularPriceCents: cents.positive().optional(),
  })).min(1),
  subtotalCents: cents, discountCents: cents, shippingCents: cents, totalCents: cents,
  promoCode: z.string().nullable(),
}).refine((quote) =>
  quote.subtotalCents === quote.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0) &&
  quote.discountCents <= quote.subtotalCents &&
  quote.totalCents === quote.subtotalCents - quote.discountCents + quote.shippingCents,
  { message: "Inconsistent checkout quote" });

/** One line per cart row, preserving identity and order (including duplicate variants). */
export function quoteLineItems(cart: CartWithItems): PrintifyLineItem[] {
  return cart.cart_items.map((item) => ({
    ...(item.product?.blueprint_id ? { blueprint_id: item.product.blueprint_id }
      : { product_id: item.product_id ?? undefined }),
    variant_id: Number(item.variant_id), quantity: item.quantity ?? 1,
  }));
}

export function applyQuoteToCart(cart: CartWithItems, quote: CheckoutQuote): CartWithItems {
  if (quote.items.length !== cart.cart_items.length) throw new Error("Quote does not match cart");
  const lines = quoteLineItems(cart);
  return { ...cart, cart_items: cart.cart_items.map((item, index) => {
    const priced = quote.items[index];
    const line = lines[index];
    if (priced.variantId !== line.variant_id || priced.quantity !== line.quantity ||
      (line.product_id ? priced.productId !== line.product_id : priced.blueprintId !== line.blueprint_id)) {
      throw new Error("Quote does not match cart");
    }
    return { ...item, unit_price: priced.unitPriceCents, regular_price_cents: priced.regularPriceCents };
  }) };
}

export class CheckoutQuoteService {
  static async quote(lineItems: PrintifyLineItem[], promoCode?: string): Promise<CheckoutQuote> {
    const headers = await getAuthenticatedHeaders("Checkout quote");
    const { data, error } = await createClient().functions.invoke("checkout-quote", {
      headers, body: { line_items: lineItems, promo_code: promoCode },
    });
    if (error) throw Object.assign(new Error("Unable to update checkout prices"), {
      code: await readFunctionErrorCode(error),
    });
    return quoteSchema.parse(data);
  }
}
