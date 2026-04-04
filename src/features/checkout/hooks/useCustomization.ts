import { useMemo } from "react";
import { ProductCustomizationT } from "@/schemas/checkout";
import {
  mapOrderItemToCustomization,
  mapOrderToCustomization,
} from "../mappers/customizationMapper";

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
      return mapOrderItemToCustomization(orderItem, customProduct);
    }

    // Priority 2: Build from order + customProduct only
    if (order && customProduct) {
      return mapOrderToCustomization(order, customProduct);
    }

    // Priority 3: Fallback to mock data
    return MOCK_CUSTOMIZATION;
  }, [isLoading, orderItems, order, customProduct]);
}
