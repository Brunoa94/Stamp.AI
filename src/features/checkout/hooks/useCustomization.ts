import { useMemo } from "react";
import { ProductCustomizationT } from "@/schemas/checkout";

interface UseCustomizationProps {
  order: any;
  orderItems: any[];
  customProduct: any;
  isLoading: boolean;
}

const MOCK_CUSTOMIZATION: ProductCustomizationT = {
  product_id: "12345",
  variant_id: 67890,
  quantity: 1,
  print_areas: {
    front: "image_id_123",
  },
  product_title: "Premium Cotton T-Shirt",
  variant_title: "Gildan 5000 - Heavy Cotton",
  price: 25.0,
  preview_url: "/placeholder-tshirt.png",
  blueprint_id: 6,
  print_provider_id: 99,
  tshirt_type: {
    id: "premium",
    name: "Premium Cotton",
    price: 5.0,
    blueprint_id: 6,
    print_provider_id: 99,
  },
};

/**
 * Custom hook to build product customization from order data
 * Prioritizes: orderItems + customProduct > order + customProduct > mock data
 */
export function useCustomization({
  order,
  orderItems,
  customProduct,
  isLoading,
}: UseCustomizationProps): ProductCustomizationT {
  return useMemo(() => {
    if (isLoading) {
      return MOCK_CUSTOMIZATION;
    }

    // Priority 1: Build from order items + Printify data
    if (orderItems && orderItems.length > 0) {
      const orderItem = orderItems[0];
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

    // Priority 2: Build from order + customProduct only
    if (order && customProduct) {
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

    // Priority 3: Fallback to mock data
    return MOCK_CUSTOMIZATION;
  }, [isLoading, orderItems, order, customProduct]);
}
