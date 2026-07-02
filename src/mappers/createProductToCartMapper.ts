import type { AddToCartInput } from "@/types/cart";

interface MapCreateProductToCartInputParamsI {
  productId: string;
  productTitle?: string | null;
  variantPrice: number;
  imageUrl?: string | null;
  variantId?: string | number | null;
}

/**
 * Map created product data to AddToCartInput payload.
 *
 * IMPORTANT: variantPrice should be in dollars (e.g., 25.99).
 * This function converts it to cents (2599) for database storage.
 */
export function mapCreateProductToCartInput({
  productId,
  productTitle,
  variantPrice,
  imageUrl,
  variantId,
}: MapCreateProductToCartInputParamsI): AddToCartInput {
  // Convert price from dollars to cents (integer)
  // Round to handle floating point precision issues
  const priceInCents = Math.round(variantPrice * 100);

  return {
    product_id: productId,
    product_name: productTitle || "Custom T-Shirt",
    quantity: 1,
    unit_price: priceInCents,
    custom_image_url: imageUrl || null,
    variant_id: variantId ? String(variantId) : null,
  };
}
