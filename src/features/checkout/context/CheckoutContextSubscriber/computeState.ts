import { CheckoutSubscriberContextState } from "./types";
import { ProductCustomizationT } from "@/schemas/checkout";

/**
 * Computes derived state for checkout
 * Builds customization from fetched data and calculates order amounts
 */
export function computeCheckoutState(
  currentState: CheckoutSubscriberContextState,
  isLoading: boolean,
  error: Error | null
): Partial<CheckoutSubscriberContextState> {
  const { order, orderItems, customProduct } = currentState;
  let customization = currentState.customization;

  // Only rebuild customization if we have real data
  if (!isLoading && (order || orderItems.length > 0 || customProduct)) {
    customization = buildCustomization(
      order,
      orderItems,
      customProduct,
      currentState.customization
    );
  }

  // Calculate order amounts with fallbacks
  const subtotal =
    order?.subtotal || customization.price * customization.quantity;
  const shippingCost = order?.shipping_cost || 5.99;
  const discount = order?.discount_amount || 0;
  const orderAmount = subtotal + shippingCost - discount;

  // Build line items for payment
  const lineItems = buildLineItems(customization);

  return {
    customization,
    isLoading,
    error,
    subtotal,
    shippingCost,
    discount,
    orderAmount,
    lineItems,
  };
}

/**
 * Builds product customization from order data
 * Priority: orderItems + customProduct > order + customProduct > existing customization
 */
function buildCustomization(
  order: any,
  orderItems: any[],
  customProduct: any,
  fallbackCustomization: ProductCustomizationT
): ProductCustomizationT {
  // Priority 1: Build from order items + Printify data
  if (orderItems && orderItems.length > 0) {
    return buildCustomizationFromOrderItem(orderItems[0], customProduct);
  }

  // Priority 2: Build from order + customProduct only
  if (order && customProduct) {
    return buildCustomizationFromOrder(order, customProduct);
  }

  // Priority 3: Return existing customization (unchanged)
  return fallbackCustomization;
}

/**
 * Builds customization from order item and custom product
 */
function buildCustomizationFromOrderItem(
  orderItem: any,
  customProduct: any
): ProductCustomizationT {
  const designConfig = orderItem.design_config as any;

  const variantId = orderItem.variant_id
    ? parseInt(orderItem.variant_id)
    : 0;

  const matchingVariant = customProduct?.variants.find(
    (v: any) => v.id === variantId
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
    product_title: customProduct?.title || orderItem.product_name,
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
 * Builds customization from order and custom product
 */
function buildCustomizationFromOrder(
  order: any,
  customProduct: any
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

/**
 * Builds line items for payment from customization
 */
function buildLineItems(customization: ProductCustomizationT) {
  const printAreasArray = Object.entries(customization.print_areas)
    .filter(([, imageId]) => imageId)
    .map(([position, imageId]) => ({
      position,
      image_id: imageId,
    }));

  return [
    {
      product_id: customization.product_id || "",
      variant_id: customization.variant_id,
      quantity: customization.quantity,
      print_areas: printAreasArray,
      print_provider_id: customization.print_provider_id || 99,
    },
  ];
}
