/**
 * Line Items For Pricing
 *
 * Pure helpers that turn client-provided line items into catalog lookups and
 * price them from catalog rows. Nothing here trusts a client price: only
 * `blueprint_id`, the Printify variant id and the quantity are read from the
 * request; the unit price always comes from `product_variants.price_cents`.
 *
 * Dependency-free so it can be shared by Deno edge functions, Next.js API
 * routes and vitest.
 */

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

export interface ParsedLineItemsI {
  items: LineItemForPricingI[];
  errors: string[];
}

export interface CatalogVariantPriceI {
  blueprint_id: number;
  printify_variant_id: number;
  price_cents: number | null;
}

export interface CatalogProductNameI {
  blueprint_id: number;
  display_title: string | null;
}

const MAX_QUANTITY = 99;

function toPositiveInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Validate and normalise raw line items. Every item MUST resolve to a catalog
 * variant; an unpriceable item is an error, never a skip.
 */
export function parseLineItemsForPricing(raw: unknown): ParsedLineItemsI {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { items: [], errors: ["line_items must be a non-empty array"] };
  }

  const items: LineItemForPricingI[] = [];
  const errors: string[] = [];

  raw.forEach((entry, index) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const blueprintId = toPositiveInteger(item.blueprint_id);
    const variantId = toPositiveInteger(item.printify_variant_id ?? item.variant_id);
    const quantity = item.quantity === undefined ? 1 : toPositiveInteger(item.quantity);

    if (blueprintId === null) {
      errors.push(`Line item ${index}: blueprint_id is required for catalog pricing`);
      return;
    }
    if (variantId === null) {
      errors.push(`Line item ${index}: printify_variant_id (or variant_id) is required for catalog pricing`);
      return;
    }
    if (quantity === null || quantity > MAX_QUANTITY) {
      errors.push(`Line item ${index}: quantity must be an integer between 1 and ${MAX_QUANTITY}`);
      return;
    }

    items.push({ blueprint_id: blueprintId, printify_variant_id: variantId, quantity });
  });

  return { items, errors };
}

function variantKey(blueprintId: number, variantId: number): string {
  return `${blueprintId}:${variantId}`;
}

/**
 * Price line items from catalog rows. `variants` is the source of truth for
 * unit prices; `products` only supplies display names.
 */
export function priceLineItems(
  items: LineItemForPricingI[],
  variants: CatalogVariantPriceI[],
  products: CatalogProductNameI[] = [],
): ServerPricingResultI {
  if (items.length === 0) {
    return { success: false, subtotal_cents: 0, items: [], errors: ["No line items provided"] };
  }

  const priceMap = new Map<string, number>();
  for (const variant of variants) {
    if (typeof variant.price_cents === "number" && Number.isInteger(variant.price_cents) && variant.price_cents > 0) {
      priceMap.set(variantKey(variant.blueprint_id, variant.printify_variant_id), variant.price_cents);
    }
  }

  const nameMap = new Map<number, string>();
  for (const product of products) {
    if (product.display_title) nameMap.set(product.blueprint_id, product.display_title);
  }

  const errors: string[] = [];
  const pricedItems: PricedLineItemI[] = [];
  let subtotalCents = 0;

  for (const item of items) {
    const unitPriceCents = priceMap.get(variantKey(item.blueprint_id, item.printify_variant_id));
    if (unitPriceCents === undefined) {
      errors.push(`Price not found for blueprint ${item.blueprint_id}, variant ${item.printify_variant_id}`);
      continue;
    }

    const totalCents = unitPriceCents * item.quantity;
    subtotalCents += totalCents;
    pricedItems.push({
      ...item,
      unit_price_cents: unitPriceCents,
      total_cents: totalCents,
      product_name: nameMap.get(item.blueprint_id),
    });
  }

  return { success: errors.length === 0, subtotal_cents: subtotalCents, items: pricedItems, errors };
}
