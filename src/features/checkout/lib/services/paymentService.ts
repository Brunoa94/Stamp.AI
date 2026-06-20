import { ErrorClient } from "@/services/errorClient";
import { StripeService } from "@/services/stripeService";
import { PayPalService } from "@/services/paypalService";
import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";
import type { CreatePaymentIntentPayloadI } from "@/types/payment";
import { CheckoutDataBuilder } from "./checkoutDataBuilder";
import { CheckoutStorageService } from "./checkoutStorageService";

/**
 * PaymentService
 * Service for handling payment submission logic
 *
 * Responsibilities:
 * - Validate payment prerequisites
 * - Build payment data structures
 * - Create payment intents
 * - Store checkout data for payment processing
 */
export class PaymentService {
  /**
   * Prepare Stripe payment
   * Builds checkout data and creates a payment intent
   */
  static async prepareStripePayment(
    formData: CheckoutFormData,
    cart: CartWithItems,
    cartId: string | null,
    amount: number
  ) {
    try {
      // Validate cart
      if (!cart || cart.cart_items.length === 0) {
        throw ErrorClient.handleError({
          error: new Error("Cart is empty"),
          service: "Payment",
          action: "Prepare Stripe Payment",
        });
      }

      // Build checkout data using CheckoutDataBuilder service
      const checkoutData = CheckoutDataBuilder.buildCheckoutData(
        formData,
        cart,
        cartId,
        amount
      );

      // Store checkout data for payment processing
      CheckoutStorageService.saveStripeCheckoutData(checkoutData);

      // Build payment intent payload
      const payload: CreatePaymentIntentPayloadI = {
        amount,
        currency: "usd",
        line_items: checkoutData.lineItems,
        shipping_address: checkoutData.shippingAddress,
        metadata: {
          paymentMethod: formData.paymentMethod,
          promoCode: formData.promoCode || undefined,
          cartId: cartId || undefined,
        },
      };

      // Create payment intent through Stripe service
      const paymentIntent = await StripeService.createPaymentIntent(payload);

      return {
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        checkoutData,
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error: error instanceof Error ? error : new Error("Unknown error"),
        service: "Payment",
        action: "Prepare Stripe Payment",
      });
    }
  }

  /**
   * Prepare PayPal payment
   * Builds checkout data, creates PayPal order, and stores data for processing
   */
  static async preparePayPalPayment(
    formData: CheckoutFormData,
    cart: CartWithItems,
    cartId: string | null,
    amount: number
  ) {
    try {
      // Validate cart
      if (!cart || cart.cart_items.length === 0) {
        throw ErrorClient.handleError({
          error: new Error("Cart is empty"),
          service: "Payment",
          action: "Prepare PayPal Payment",
        });
      }

      // Build checkout data using CheckoutDataBuilder service
      const checkoutData = CheckoutDataBuilder.buildCheckoutData(
        formData,
        cart,
        cartId,
        amount
      );

      // Create PayPal order through PayPalService
      const { orderId, approvalUrl } = await PayPalService.createOrder({
        amount,
        lineItems: checkoutData.lineItems,
        shippingAddress: checkoutData.shippingAddress,
      });

      // Store checkout data for return page
      CheckoutStorageService.savePayPalCheckoutData(checkoutData);

      if (!approvalUrl) {
        throw ErrorClient.handleError({
          error: new Error("PayPal approval URL not received"),
          service: "Payment",
          action: "Prepare PayPal Payment",
        });
      }

      return {
        orderId,
        approvalUrl,
        checkoutData,
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error: error instanceof Error ? error : new Error("Unknown error"),
        service: "Payment",
        action: "Prepare PayPal Payment",
      });
    }
  }

  /**
   * Validate payment form data
   */
  static validatePaymentData(formData: CheckoutFormData, cart: CartWithItems | null) {
    if (!cart) {
      return { isValid: false, error: "Cart not found" };
    }

    if (cart.cart_items.length === 0) {
      return { isValid: false, error: "Cart is empty" };
    }

    if (!formData.billing) {
      return { isValid: false, error: "Billing address is required" };
    }

    if (!formData.paymentMethod) {
      return { isValid: false, error: "Payment method is required" };
    }

    return { isValid: true, error: null };
  }
}
