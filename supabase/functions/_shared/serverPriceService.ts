/**
 * Server-Side Price Service
 *
 * CRITICAL SECURITY: prices come from the database, never from the client.
 * Every line item is repriced from `product_variants.price_cents`, the promo
 * discount is derived from the `promocodes` table and shipping/VAT come from
 * server configuration (`orderTotals.ts`). Client-supplied amounts are only
 * ever COMPARED against the result, never used.
 *
 * All amounts are integer cents.
 */

import { FunctionError } from "./errors.ts";
import { supabaseRest } from "./supabase.ts";
import {
  priceLineItems,
  type CatalogProductNameI,
  type CatalogVariantPriceI,
  type LineItemForPricingI,
  type ServerPricingResultI,
} from "./lineItemsForPricing.ts";
import {
  calculateOrderTotals,
  reconcileClientTotalCents,
  type OrderTotalsConfigI,
  type OrderTotalsI,
} from "./orderTotals.ts";
import { calculatePromoDiscountCents } from "./promoDiscount.ts";
import { fetchPromoCodeRule, type PromoCodeRowI } from "./promoCodes.ts";


/**
 * Fetch authoritative prices from the database for the given line items.
 */
export async function computeServerSidePricing(
  lineItems: LineItemForPricingI[],
): Promise<ServerPricingResultI> {
  if (!lineItems || lineItems.length === 0) {
    return { success: false, subtotal_cents: 0, items: [], errors: ["No line items provided"] };
  }

  const blueprintIds = [...new Set(lineItems.map((item) => item.blueprint_id))];
  const variantIds = [...new Set(lineItems.map((item) => item.printify_variant_id))];

  const [productsResult, variantsResult] = await Promise.all([
    supabaseRest<CatalogProductNameI[]>(
      `catalog_products?blueprint_id=in.(${blueprintIds.join(",")})&select=blueprint_id,display_title`,
      "GET",
    ),
    supabaseRest<CatalogVariantPriceI[]>(
      `product_variants?blueprint_id=in.(${blueprintIds.join(",")})&printify_variant_id=in.(${variantIds.join(",")})&select=blueprint_id,printify_variant_id,price_cents`,
      "GET",
    ),
  ]);

  if (variantsResult.error || !variantsResult.data) {
    return {
      success: false,
      subtotal_cents: 0,
      items: [],
      errors: ["Failed to fetch variant prices from database"],
    };
  }

  return priceLineItems(lineItems, variantsResult.data, productsResult.data ?? []);
}

export interface ServerOrderPricingI {
  pricing: ServerPricingResultI;
  promo: PromoCodeRowI | null;
  totals: OrderTotalsI;
}

export interface PriceOrderInputI {
  lineItems: LineItemForPricingI[];
  /** Normalised promo code (see `normalizePromoCode`) or null. */
  promoCode: string | null;
  config: OrderTotalsConfigI;
}

/**
 * Price a whole order server-side: catalog unit prices, promo discount,
 * shipping and VAT. Throws when any item cannot be priced or the promo code
 * does not exist.
 */
export async function priceOrderFromCatalog({
  lineItems,
  promoCode,
  config,
}: PriceOrderInputI): Promise<ServerOrderPricingI> {
  const pricing = await computeServerSidePricing(lineItems);
  if (!pricing.success) {
    throw new FunctionError(400, "PRICING_FAILED", `Server pricing failed: ${pricing.errors.join(", ")}`);
  }

  const promo = promoCode ? await fetchPromoCodeRule(promoCode) : null;
  if (promoCode && !promo) {
    throw new FunctionError(400, "INVALID_PROMO_CODE", "Promo code not found");
  }

  const totals = calculateOrderTotals({
    subtotalCents: pricing.subtotal_cents,
    discountCents: calculatePromoDiscountCents(promo, pricing.subtotal_cents),
    config,
  });

  return { pricing, promo, totals };
}

export interface ValidatePricingInputI extends PriceOrderInputI {
  clientTotalCents: number;
}

/**
 * Price the order server-side and require the client's claimed total to match
 * exactly. This is the main defense against price tampering before a payment
 * intent is created with the provider.
 */
export async function validatePricingAgainstDatabase(
  input: ValidatePricingInputI,
): Promise<ServerOrderPricingI> {
  const priced = await priceOrderFromCatalog(input);
  const reconciliation = reconcileClientTotalCents(priced.totals, input.clientTotalCents);

  if (!reconciliation.ok) {
    throw new FunctionError(
      400,
      "PRICE_MISMATCH",
      `Price mismatch: server computed ${priced.totals.total_cents} cents, client sent ${input.clientTotalCents} cents (difference: ${reconciliation.differenceCents} cents)`,
    );
  }

  return priced;
}
