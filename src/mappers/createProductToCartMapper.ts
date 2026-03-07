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
 */
export function mapCreateProductToCartInput({
  productId,
  productTitle,
  variantPrice,
  imageUrl,
  variantId,
}: MapCreateProductToCartInputParamsI): AddToCartInput {
  return {
    product_id: productId,
    product_name: productTitle || "Custom T-Shirt",
    quantity: 1,
    unit_price: variantPrice,
    custom_image_url: imageUrl || null,
    variant_id: variantId ? String(variantId) : null,
  };
}
