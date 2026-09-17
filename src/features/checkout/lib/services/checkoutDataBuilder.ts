import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { CartWithItems } from "@/shared/types/cart";
import type { PrintifyLineItem } from "@/shared/types/printifyOrder";
import type { ShippingAddressT } from "@/shared/schemas/checkout";
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
  static createCartSnapshot(cart: CartWithItems): CartWithItems {
    return structuredClone(cart);
  }

  /**
   * Determine the shipping address to use
   * If user selected separate shipping address, use that
   * Otherwise, use billing address as shipping address
   */
  static determineShippingAddress(
    formData: CheckoutFormData,
  ): ShippingAddressT {
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
    amount?: number,
  ): CheckoutData {
    // Transform cart items to Printify line items
    const lineItems: PrintifyLineItem[] = buildPrintifyLineItems(
      cart.cart_items,
    );

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
      // Freeze the exact rows being purchased. The live cart may change in
      // another tab while the customer is at the payment provider.
      cartSnapshot: this.createCartSnapshot(cart),
      timestamp: Date.now(),
    };

    return checkoutData;
  }
}
