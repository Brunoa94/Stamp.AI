/**
 * Server-Side Price Service
 *
 * CRITICAL SECURITY: This service fetches prices from the database,
 * NOT from client-provided data. Use this to validate order totals
 * and prevent price tampering attacks (C4).
 *
 * All prices are stored and returned in CENTS to avoid floating point issues.
 */

import { supabaseRest } from "./supabase.ts";

export interface LineItemForPricingI {
  blueprint_id: number;
  printify_variant_id: number;
  quantity: number;
}

export interface PricedLineItemI extends LineItemForPricingI {
  unit_price_cents: number;
  total_cents: number;
  product_name?: string;
}

export interface ServerPricingResultI {
  success: boolean;
  subtotal_cents: number;
  items: PricedLineItemI[];
  errors: string[];
}

interface ProductVariantRowI {
  blueprint_id: number;
  printify_variant_id: number;
  price_cents: number;
  color: string;
  size: string;
}

interface CatalogProductRowI {
  blueprint_id: number;
  display_title: string;
}

/**
 * Fetch authoritative prices from the database for given line items.
 * Returns pricing calculated server-side, not from client data.
 *
 * @param lineItems - Array of items with blueprint_id, printify_variant_id, quantity
 * @returns Pricing result with server-computed totals
 */
export async function computeServerSidePricing(
  lineItems: LineItemForPricingI[]
): Promise<ServerPricingResultI> {
  const errors: string[] = [];
  const pricedItems: PricedLineItemI[] = [];

  if (!lineItems || lineItems.length === 0) {
    return {
      success: false,
      subtotal_cents: 0,
      items: [],
      errors: ["No line items provided"],
    };
  }

  // Extract unique blueprint IDs and variant IDs
  const blueprintIds = [...new Set(lineItems.map((item) => item.blueprint_id))];
  const variantIds = [...new Set(lineItems.map((item) => item.printify_variant_id))];

  // Fetch product names for display
  const productsResult = await supabaseRest<CatalogProductRowI[]>(
    `catalog_products?blueprint_id=in.(${blueprintIds.join(",")})&select=blueprint_id,display_title`,
    "GET"
  );

  const productMap = new Map<number, string>();
  if (productsResult.data) {
    for (const product of productsResult.data) {
      productMap.set(product.blueprint_id, product.display_title);
    }
  }

  // Fetch variant prices from database - THIS IS THE SOURCE OF TRUTH
  const variantsResult = await supabaseRest<ProductVariantRowI[]>(
    `product_variants?blueprint_id=in.(${blueprintIds.join(",")})&printify_variant_id=in.(${variantIds.join(",")})&select=blueprint_id,printify_variant_id,price_cents,color,size`,
    "GET"
  );

  if (variantsResult.error || !variantsResult.data) {
    return {
      success: false,
      subtotal_cents: 0,
      items: [],
      errors: ["Failed to fetch variant prices from database"],
    };
  }

  // Build lookup map: "blueprint_id:variant_id" -> price_cents
  const priceMap = new Map<string, number>();
  for (const variant of variantsResult.data) {
    const key = `${variant.blueprint_id}:${variant.printify_variant_id}`;
    priceMap.set(key, variant.price_cents);
  }

  // Price each line item using database prices
  let subtotalCents = 0;

  for (const item of lineItems) {
    const key = `${item.blueprint_id}:${item.printify_variant_id}`;
    const unitPriceCents = priceMap.get(key);

    if (unitPriceCents === undefined) {
      errors.push(
        `Price not found for blueprint ${item.blueprint_id}, variant ${item.printify_variant_id}`
      );
      continue;
    }

    if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      errors.push(`Invalid quantity for variant ${item.printify_variant_id}`);
      continue;
    }

    const totalCents = unitPriceCents * item.quantity;
    subtotalCents += totalCents;

    pricedItems.push({
      ...item,
      unit_price_cents: unitPriceCents,
      total_cents: totalCents,
      product_name: productMap.get(item.blueprint_id),
    });
  }

  return {
    success: errors.length === 0,
    subtotal_cents: subtotalCents,
    items: pricedItems,
    errors,
  };
}

export interface ValidatePricingInputI {
  lineItems: LineItemForPricingI[];
  clientSubtotalCents: number;
  shippingCostCents?: number;
  discountCents?: number;
  clientTotalCents: number;
}

export interface ValidatePricingResultI {
  isValid: boolean;
  serverSubtotalCents: number;
  serverTotalCents: number;
  clientTotalCents: number;
  differenceCents: number;
  errorMessage?: string;
}

/**
 * Validate that client-provided total matches server-computed total.
 * This is the main defense against price tampering.
 *
 * @param input - Client totals and line items to validate
 * @returns Validation result
 */
export async function validatePricingAgainstDatabase(
  input: ValidatePricingInputI
): Promise<ValidatePricingResultI> {
  const {
    lineItems,
    clientTotalCents,
    shippingCostCents = 0,
    discountCents = 0,
  } = input;

  // Compute server-side pricing
  const pricing = await computeServerSidePricing(lineItems);

  if (!pricing.success) {
    return {
      isValid: false,
      serverSubtotalCents: 0,
      serverTotalCents: 0,
      clientTotalCents,
      differenceCents: clientTotalCents,
      errorMessage: `Server pricing failed: ${pricing.errors.join(", ")}`,
    };
  }

  const serverTotalCents =
    pricing.subtotal_cents + shippingCostCents - discountCents;

  // Allow 1 cent tolerance for rounding
  const differenceCents = Math.abs(serverTotalCents - clientTotalCents);
  const isValid = differenceCents <= 1;

  if (!isValid) {
    return {
      isValid: false,
      serverSubtotalCents: pricing.subtotal_cents,
      serverTotalCents,
      clientTotalCents,
      differenceCents,
      errorMessage: `Price mismatch: server computed ${serverTotalCents} cents, client sent ${clientTotalCents} cents (difference: ${differenceCents} cents)`,
    };
  }

  return {
    isValid: true,
    serverSubtotalCents: pricing.subtotal_cents,
    serverTotalCents,
    clientTotalCents,
    differenceCents,
  };
}
