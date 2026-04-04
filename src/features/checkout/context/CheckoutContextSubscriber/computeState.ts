import { CheckoutSubscriberContextState } from "./types";
import { ProductCustomizationT } from "@/schemas/checkout";
import { CustomProductT } from "@/types/printify";
import { CartItem } from "@/types/cart";
import {
  adaptOrderItemToCustomization,
  adaptExistingProductToLineItem,
  adaptOnTheFlyProductToLineItem,
} from "./adapters";

/**
 * Builds product customization from cart items
 */
export function buildCustomization(
  _unused: null,
  cartItems: CartItem[] | null,
  customProduct: CustomProductT | null,
): ProductCustomizationT | null {
  // Build from cart items + Printify data
  if (cartItems && cartItems.length > 0) {
    return buildCustomizationFromCartItem(cartItems[0], customProduct);
  }

  return null;
}

/**
 * Builds customization from cart item and custom product
 */
function buildCustomizationFromCartItem(
  cartItem: CartItem,
  customProduct: any
): ProductCustomizationT {
  return adaptOrderItemToCustomization(cartItem, customProduct);
}

/**
 * Builds line items for payment from customization
 *
 * Two scenarios:
 * 1. Ordering existing product: use product_id, variant_id, quantity only
 * 2. Creating product on-the-fly: use blueprint_id, print_provider_id, variant_id, quantity, and print_areas
 *
 * For orders with on-the-fly product creation, print_areas uses the advanced format:
 * {
 *   "front": [{ "src": "url", "scale": 1, "x": 0.5, "y": 0.5, "angle": 0 }]
 * }
 */
export function buildLineItems(customization: ProductCustomizationT | null) {
  if(!customization) return null;

  // If variant_id is 0 but we have a product_id, we're still loading the product data
  // Return null for now - this will be recomputed once customProduct is loaded
  if (customization.variant_id === 0) {
    return null;
  }

  // Scenario 1: Ordering existing product
  // We have a valid product_id AND variant_id
  // DON'T include print_areas, print_provider_id, or blueprint_id
  if (
    customization.product_id &&
    customization.product_id.trim() !== ""
  ) {
    return [adaptExistingProductToLineItem(customization)];
  }

  // Scenario 2: Creating product on-the-fly
  return [adaptOnTheFlyProductToLineItem(customization)];
}
