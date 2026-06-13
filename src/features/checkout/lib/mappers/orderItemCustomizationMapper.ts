import { ProductCustomizationT } from "@/schemas/checkout";
import { CustomProductDataType, OrderItemDataType } from "./types";

/**
 * Maps order item and custom product data to ProductCustomizationT
 *
 * This mapper handles the primary case where we have detailed order item data
 * and optionally custom product data from Printify.
 *
 * @param orderItem - The order item data containing product, variant, and design info
 * @param customProduct - Optional custom product data from Printify with variants and images
 * @returns Mapped ProductCustomizationT object
 */
export function mapOrderItemToCustomization(
  orderItem: OrderItemDataType,
  customProduct?: CustomProductDataType,
): ProductCustomizationT {
  const designConfig = orderItem.design_config as any;

  const variantId = orderItem.variant_id ? parseInt(orderItem.variant_id) : 0;

  const matchingVariant = customProduct?.variants?.find(
    (v) => v.id === variantId,
  );

  const variantPriceInDollars = matchingVariant
    ? matchingVariant.price / 100
    : orderItem.unit_price;

  const previewUrl = customProduct?.images?.[0]?.src ||
    orderItem.custom_image_url;

  return {
    product_id: orderItem.product_id || "",
    variant_id: variantId,
    quantity: orderItem.quantity,
    print_areas: {
      front: designConfig?.generated_image_url || "",
    },
    product_title: customProduct?.title || orderItem.product_name ||
      "Custom Product",
    variant_title: matchingVariant?.title || orderItem.variant_name ||
      "Custom Design",
    price: variantPriceInDollars,
    preview_url: previewUrl,
    blueprint_id: customProduct?.blueprint_id || designConfig?.blueprint_id ||
      6,
    print_provider_id: customProduct?.print_provider_id ||
      designConfig?.print_provider_id ||
      99,
    tshirt_type: {
      id: designConfig?.tshirt_type || "custom",
      name: orderItem.variant_name || "Custom",
      price: variantPriceInDollars,
      blueprint_id: customProduct?.blueprint_id || designConfig?.blueprint_id ||
        6,
      print_provider_id: customProduct?.print_provider_id ||
        designConfig?.print_provider_id ||
        99,
    },
  };
}
