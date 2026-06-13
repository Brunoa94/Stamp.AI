import { ProductCustomizationT } from "@/schemas/checkout";
import type { CustomProductDataType, OrderDataType } from "./types";

/**
 * Maps order and custom product data to ProductCustomizationT (fallback)
 *
 * This mapper is used as a fallback when we don't have detailed order item data.
 * It uses the first variant from the custom product and default values.
 *
 * @param order - The order data containing basic product information
 * @param customProduct - The custom product data from Printify with variants and images
 * @returns Mapped ProductCustomizationT object with fallback values
 */
export function mapOrderToCustomization(
  order: OrderDataType,
  customProduct: CustomProductDataType,
): ProductCustomizationT {
  const firstVariant = customProduct.variants?.[0];
  const variantPriceInDollars = firstVariant ? firstVariant.price / 100 : 25.0;
  const previewUrl = customProduct.images?.[0]?.src;

  return {
    product_id: order.product_id || customProduct.id || "",
    variant_id: firstVariant?.id || 0,
    quantity: 1,
    print_areas: {
      front: "",
    },
    product_title: customProduct.title || "Custom Product",
    variant_title: firstVariant?.title || "Default Variant",
    price: variantPriceInDollars,
    preview_url: previewUrl,
    blueprint_id: customProduct.blueprint_id || 6,
    print_provider_id: customProduct.print_provider_id || 99,
    tshirt_type: {
      id: "default",
      name: firstVariant?.title || "Default",
      price: variantPriceInDollars,
      blueprint_id: customProduct.blueprint_id || 6,
      print_provider_id: customProduct.print_provider_id || 99,
    },
  };
}
