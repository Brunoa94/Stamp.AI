import { ProductCustomizationT } from "@/schemas/checkout";

interface LineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
  print_areas: Record<string, any[]> | {};
  print_provider_id: number;
}

/**
 * Adapts customization data to line item for existing product orders
 */
export function adaptExistingProductToLineItem(
  customization: ProductCustomizationT
): LineItem {
  return {
    product_id: customization.product_id,
    variant_id: customization.variant_id,
    quantity: customization.quantity,
    print_areas: {},
    print_provider_id: 0, // Not used for existing products, but required by type
  };
}

/**
 * Adapts customization data to line item for on-the-fly product creation
 */
export function adaptOnTheFlyProductToLineItem(
  customization: ProductCustomizationT
): LineItem {
  // Build print_areas in Printify's order format
  const printAreas: Record<string, any[]> = {};

  Object.entries(customization.print_areas).forEach(([position, imageId]) => {
    if (imageId) {
      printAreas[position] = [
        {
          src: imageId,
          scale: 1,
          x: 0.5,
          y: 0.5,
          angle: 0,
        },
      ];
    }
  });

  return {
    product_id: "", // Not used for on-the-fly products
    variant_id: customization.variant_id,
    quantity: customization.quantity,
    print_areas: printAreas,
    print_provider_id: customization.print_provider_id || 99,
  };
}
