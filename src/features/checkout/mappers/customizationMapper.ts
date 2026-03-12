import { ProductCustomizationT } from "@/schemas/checkout";

interface OrderItemData {
  product_id?: string;
  variant_id?: string;
  quantity: number;
  design_config?: any;
  product_name?: string;
  variant_name?: string;
  unit_price: number;
  custom_image_url?: string;
}

interface CustomProductData {
  id?: string;
  title?: string;
  blueprint_id?: number;
  print_provider_id?: number;
  variants?: Array<{
    id: number;
    title?: string;
    price: number;
  }>;
  images?: Array<{
    src?: string;
  }>;
}

interface OrderData {
  product_id?: string;
}

/**
 * Maps order item and custom product data to ProductCustomizationT
 * @param orderItem - The order item data
 * @param customProduct - The custom product data from Printify
 * @returns Mapped ProductCustomizationT object
 */
export function mapOrderItemToCustomization(
  orderItem: OrderItemData,
  customProduct?: CustomProductData
): ProductCustomizationT {
  const designConfig = orderItem.design_config as any;

  const variantId = orderItem.variant_id
    ? parseInt(orderItem.variant_id)
    : 0;

  const matchingVariant = customProduct?.variants?.find(
    (v) => v.id === variantId
  );

  const variantPriceInDollars = matchingVariant
    ? matchingVariant.price / 100
    : orderItem.unit_price;

  const previewUrl =
    customProduct?.images?.[0]?.src || orderItem.custom_image_url;

  return {
    product_id: orderItem.product_id || "",
    variant_id: variantId,
    quantity: orderItem.quantity,
    print_areas: {
      front: designConfig?.generated_image_url || "",
    },
    product_title: customProduct?.title || orderItem.product_name || "Custom Product",
    variant_title:
      matchingVariant?.title || orderItem.variant_name || "Custom Design",
    price: variantPriceInDollars,
    preview_url: previewUrl,
    blueprint_id:
      customProduct?.blueprint_id || designConfig?.blueprint_id || 6,
    print_provider_id:
      customProduct?.print_provider_id ||
      designConfig?.print_provider_id ||
      99,
    tshirt_type: {
      id: designConfig?.tshirt_type || "custom",
      name: orderItem.variant_name || "Custom",
      price: variantPriceInDollars,
      blueprint_id:
        customProduct?.blueprint_id || designConfig?.blueprint_id || 6,
      print_provider_id:
        customProduct?.print_provider_id ||
        designConfig?.print_provider_id ||
        99,
    },
  };
}

/**
 * Maps order and custom product data to ProductCustomizationT (fallback)
 * @param order - The order data
 * @param customProduct - The custom product data from Printify
 * @returns Mapped ProductCustomizationT object
 */
export function mapOrderToCustomization(
  order: OrderData,
  customProduct: CustomProductData
): ProductCustomizationT {
  const firstVariant = customProduct.variants?.[0];
  const variantPriceInDollars = firstVariant
    ? firstVariant.price / 100
    : 25.0;
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
