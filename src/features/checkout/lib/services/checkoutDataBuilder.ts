import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { ShippingAddressT } from "@/schemas/checkout";
import { buildPrintifyLineItems } from "../mappers/printifyLineItemsMapper";
import type { CheckoutData } from "./checkoutStorageService";

/**
 * CheckoutDataBuilder
 * Service for building and transforming checkout data structures
 *
 * Responsibilities:
 * - Build structured checkout data from form data and cart
 * - Determine which shipping address to use
 * - Transform cart items to Printify line items
 */
export class CheckoutDataBuilder {
  /**
   * Determine the shipping address to use
   * If user selected separate shipping address, use that
   * Otherwise, use billing address as shipping address
   */
  static determineShippingAddress(formData: CheckoutFormData): ShippingAddressT {
    if (formData.useShippingAddress && formData.shipping) {
      return formData.shipping;
    }
    return formData.billing;
  }

  /**
   * Build complete checkout data structure
   * Combines form data, cart data, and transformed line items
   */
  static buildCheckoutData(
    formData: CheckoutFormData,
    cart: CartWithItems,
    cartId: string | null,
    amount?: number
  ): CheckoutData {
    // Transform cart items to Printify line items
    const lineItems: PrintifyLineItem[] = buildPrintifyLineItems(cart.cart_items);

    // Determine shipping address
    const shippingAddress = this.determineShippingAddress(formData);

    // Build complete checkout data structure
    const checkoutData: CheckoutData = {
      billing: formData.billing,
      shipping: formData.useShippingAddress ? formData.shipping : undefined,
      lineItems,
      shippingAddress,
      cartId,
      paymentMethod: formData.paymentMethod,
      promoCode: formData.promoCode,
      amount,
      timestamp: Date.now(),
    };

    return checkoutData;
  }
}
