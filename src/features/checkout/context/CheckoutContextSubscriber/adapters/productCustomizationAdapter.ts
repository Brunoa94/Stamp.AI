import { ProductCustomizationT } from "@/schemas/checkout";
import { CustomProductT } from "@/types/printify";

/**
 * Adapts order item data to ProductCustomizationT format
 */
export function adaptOrderItemToCustomization(
  orderItem: any,
  customProduct: any
): ProductCustomizationT {
  const designConfig = orderItem.design_config as any;

  // Get product_id from design_config.printify_product_id if orderItem.product_id is null
  const productId = orderItem.product_id || designConfig?.printify_product_id || "";

  // Get variant_id - if null, try to get the first enabled variant from customProduct
  let variantId = orderItem.variant_id ? parseInt(orderItem.variant_id) : 0;

  // If variantId is still 0, try to get it from customProduct
  if (variantId === 0 && customProduct?.variants?.length > 0) {
    const firstEnabledVariant = customProduct.variants.find((v: any) => v.is_enabled);
    variantId = firstEnabledVariant?.id || customProduct.variants[0]?.id || 0;

    if (variantId > 0) {
      console.log("✅ Auto-selected variant_id from customProduct:", {
        variant_id: variantId,
        is_enabled: !!firstEnabledVariant,
      });
    }
  }

  const matchingVariant = customProduct?.variants.find(
    (v: any) => v.id === variantId
  );

  const variantPriceInDollars = matchingVariant
    ? matchingVariant.price / 100
    : orderItem.unit_price || 25.0;

  const previewUrl =
    customProduct?.images?.[0]?.src ||
    designConfig?.product_image_url ||
    orderItem.custom_image_url;

  return {
    product_id: productId,
    variant_id: variantId,
    quantity: orderItem.quantity || 1,
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
 * Adapts order and custom product data to ProductCustomizationT format
 */
export function adaptOrderToCustomization(
  order: any,
  customProduct: CustomProductT
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
