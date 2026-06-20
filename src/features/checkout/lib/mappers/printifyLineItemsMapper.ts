import type { PrintifyLineItem } from "@/types/printifyOrder";

/**
 * Convert cart items to Printify line items format
 *
 * Two scenarios:
 * 1. Existing Printify product: Use product_id + variant_id (NO print_provider_id)
 * 2. Custom on-the-fly product: Use blueprint_id + print_provider_id + variant_id + print_areas
 */
export function buildPrintifyLineItems(cartItems: any[]): PrintifyLineItem[] {
  console.log("🔨 Building Printify line items from cart items...");

  const lineItems = cartItems.map((item, index) => {
    console.log(`\n--- Processing cart item ${index} ---`);
    console.log("Full cart item:", JSON.stringify(item, null, 2));

    // Get product data from the cart item
    const product = item.product;

    if (!product && item.product_id) {
      // Product ID exists but wasn't loaded - it might be a Printify product not in our database
      console.warn(
        `⚠️ Cart item ${index}: Has product_id "${item.product_id}" but product data wasn't loaded`
      );
      console.log(
        "This is likely a Printify product that hasn't been saved to the database yet"
      );
      console.log("Cart item:", item);

      // Use the Printify product_id directly for existing Printify products
      console.log(`✅ Item ${index}: Using Printify product ID directly`);

      const variantId = parseInt(item.variant_id);
      if (!variantId || variantId === 0) {
        console.error(`❌ Cart item ${index}: Invalid variant_id "${item.variant_id}"`);
        console.error('Variant ID is required for Printify orders');
        console.error(`To fix: Ensure size/color is selected when adding product to cart`);
        return null;
      }

      return {
        product_id: item.product_id,
        variant_id: variantId,
        quantity: item.quantity || 1,
      };
    }

    if (!product) {
      console.warn(
        `⚠️ Cart item ${index} has no product reference - custom product without database record`
      );
      console.log("Cart item data:", {
        product_id: item.product_id,
        product_name: item.product_name,
        variant_id: item.variant_id,
        custom_image_url: item.custom_image_url,
      });

      // Cannot create Printify order without blueprint_id, print_provider_id, print_areas
      console.error(
        `❌ Cart item ${index}: Cannot create Printify order - missing Printify product data`
      );
      console.error(
        `To fix: Save Printify products to the database when they're created`
      );
      return null;
    }

    console.log(`Product data for item ${index}:`, {
      id: product.id,
      name: product.name,
      blueprint_id: product.blueprint_id,
      print_provider_id: product.print_provider_id,
      has_print_areas: !!product.print_areas,
    });

    const variantId = parseInt(item.variant_id);
    if (!variantId || variantId === 0) {
      console.error(`❌ Cart item ${index}: Invalid variant_id "${item.variant_id}"`);
      console.error('Variant ID is required for Printify orders');
      console.error(`To fix: Ensure size/color is selected when adding product to cart`);
      return null;
    }

    const lineItem: PrintifyLineItem = {
      variant_id: variantId,
      quantity: item.quantity || 1,
    };

    // Check if this is a custom product (has blueprint_id AND print_provider_id)
    // For custom products, we need BOTH blueprint_id and print_provider_id
    if (product.blueprint_id && product.print_provider_id) {
      console.log(`✅ Item ${index}: Custom product with blueprint`);
      lineItem.blueprint_id = product.blueprint_id;
      lineItem.print_provider_id = product.print_provider_id;

      // Add print areas if available
      if (product.print_areas) {
        lineItem.print_areas = product.print_areas as Record<string, any[]>;
        console.log(`✅ Item ${index}: Added print areas`);
      }
    }
    // Check if this is just a blueprint without print_provider_id
    else if (product.blueprint_id && !product.print_provider_id) {
      console.warn(
        `⚠️ Item ${index}: Has blueprint_id but missing print_provider_id, adding default`
      );
      lineItem.blueprint_id = product.blueprint_id;
      lineItem.print_provider_id = 99; // Default to Printify Choice

      if (product.print_areas) {
        lineItem.print_areas = product.print_areas as Record<string, any[]>;
      }
    }
    // Check if print_provider_id exists without blueprint_id (INVALID)
    else if (product.print_provider_id && !product.blueprint_id) {
      console.error(
        `❌ Item ${index}: Has print_provider_id but missing blueprint_id - SKIPPING`
      );
      return null;
    }
    // Otherwise, it's an existing Printify product (use product_id only)
    else if (product.id) {
      console.log(`✅ Item ${index}: Existing Printify product`);
      lineItem.product_id = product.id;
      // IMPORTANT: Do NOT include print_provider_id for existing products
    } else {
      console.error(
        `❌ Item ${index}: Invalid product - no product_id or blueprint_id`
      );
      return null;
    }

    // Final validation
    if (lineItem.print_provider_id && !lineItem.blueprint_id) {
      console.error(
        `❌ Item ${index}: VALIDATION FAILED - print_provider_id without blueprint_id`,
        lineItem
      );
      return null;
    }

    if (
      lineItem.product_id &&
      (lineItem.blueprint_id || lineItem.print_provider_id)
    ) {
      console.warn(
        `⚠️ Item ${index}: Conflicting fields detected, cleaning...`
      );
      // Remove the conflicting fields - prefer product_id for existing products
      delete lineItem.blueprint_id;
      delete lineItem.print_provider_id;
      delete lineItem.print_areas;
    }

    console.log(`✅ Item ${index}: Built line item:`, lineItem);
    return lineItem;
  });

  const validLineItems = lineItems.filter(Boolean) as PrintifyLineItem[];
  console.log(
    `\n📦 Final result: ${validLineItems.length}/${cartItems.length} line items built successfully`
  );

  // Throw error if no valid line items (all were filtered out)
  if (validLineItems.length === 0 && cartItems.length > 0) {
    console.error('❌ No valid line items could be built from cart items');
    console.error('All cart items failed validation - check logs above for details');
    throw new Error('Unable to process cart items. Please ensure all products have valid size/color selections.');
  }

  return validLineItems;
}
