/**
 * Pricing Utilities
 *
 * Shared price resolution logic used across catalog, homepage, and SEO mappers.
 * Ensures consistent price handling throughout the application.
 */

/**
 * Fallback price charged for products whose variants have no synced
 * price data (min_price_cents = 0 and no admin selling-price override).
 * Used by the stamp flow's product selection and the /catalog page so
 * both surfaces show the price actually charged.
 */
export const FALLBACK_PRODUCT_PRICE_CENTS = 2500;

interface ProductPriceSource {
  promotional_price?: number | null;
  selling_price_cents?: number | null;
  totalPriceCents?: number;
}

/**
 * Resolve the display price from a product's price sources.
 *
 * Priority: promotional_price → selling_price_cents (admin override) → totalPriceCents (computed) → fallback
 *
 * @param product - Object containing price fields
 * @param options - Configuration options
 * @param options.useFallback - Whether to use FALLBACK_PRODUCT_PRICE_CENTS when no price is found (default: true)
 * @returns Price in cents, or 0 if no price and fallback disabled
 */
export function resolveDisplayPriceCents(
  product: ProductPriceSource,
  options: { useFallback?: boolean } = {}
): number {
  const { useFallback = true } = options;

  const priceCents = product.promotional_price ?? (product.selling_price_cents || product.totalPriceCents);

  if (priceCents && priceCents > 0) {
    return priceCents;
  }

  return useFallback ? FALLBACK_PRODUCT_PRICE_CENTS : 0;
}

/**
 * Resolve the display price and convert to dollars/euros.
 *
 * @param product - Object containing price fields
 * @param options - Configuration options
 * @returns Price as a decimal number (e.g., 25.00)
 */
export function resolveDisplayPrice(
  product: ProductPriceSource,
  options: { useFallback?: boolean } = {}
): number {
  return resolveDisplayPriceCents(product, options) / 100;
}

/** Sale presentation uses the real regular selling price for new promotions. */
export function resolveSaleDisplay(product: ProductPriceSource & {
  original_price_cents?: number | null;
  is_on_sale?: boolean;
  discount_percent?: number | null;
}) {
  const isPromotional = product.promotional_price != null && product.promotional_price > 0;
  const regular = product.selling_price_cents;
  return {
    isPromotional,
    isOnSale: isPromotional || product.is_on_sale || false,
    originalPrice: isPromotional && regular ? regular / 100
      : product.original_price_cents ? product.original_price_cents / 100 : undefined,
    discountPercent: isPromotional && regular
      ? Math.round((1 - product.promotional_price! / regular) * 100)
      : product.discount_percent ?? undefined,
  };
}
