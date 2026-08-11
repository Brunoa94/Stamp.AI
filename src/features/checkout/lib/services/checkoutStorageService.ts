import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PaymentMethodT } from "@/types/payment";

export interface CheckoutData {
  billing: ShippingAddressT;
  shipping?: ShippingAddressT;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  cartId: string | null;
  paymentMethod: PaymentMethodT;
  promoCode?: string;
  amount?: number; // Total amount for the order
  timestamp: number;
}

/**
 * CheckoutStorageService
 * Centralized service for managing checkout data in localStorage
 *
 * Responsibilities:
 * - Store/retrieve Stripe checkout data
 * - Store/retrieve PayPal checkout data
 * - Store Mollie (iDEAL) checkout data for the mollie-return page
 * - Validate data expiration (1 hour)
 * - Clean up expired data
 */
export class CheckoutStorageService {
  private static readonly STORAGE_KEYS = {
    STRIPE: "stripe_checkout_data",
    PAYPAL: "paypal_checkout_data",
  } as const;

  // sessionStorage keys read by MollieReturnClient after the redirect back from Mollie
  private static readonly MOLLIE_SESSION_KEYS = {
    PAYMENT_ID: "mollie_payment_id",
    LINE_ITEMS: "mollie_line_items",
    SHIPPING_ADDRESS: "mollie_shipping_address",
    CART_ID: "mollie_cart_id",
    ORDER_AMOUNT: "mollie_order_amount",
  } as const;

  private static readonly EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Check if checkout data is still valid based on timestamp
   */
  static isCheckoutDataValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.EXPIRATION_TIME;
  }

  /**
   * Save Stripe checkout data to localStorage
   */
  static saveStripeCheckoutData(data: CheckoutData): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.STRIPE, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save Stripe checkout data:", error);
    }
  }

  /**
   * Retrieve Stripe checkout data from localStorage
   * Returns null if data doesn't exist or is expired
   */
  static getStripeCheckoutData(): CheckoutData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.STRIPE);
      if (!stored) return null;

      const data = JSON.parse(stored) as CheckoutData;

      // Validate expiration
      if (!this.isCheckoutDataValid(data.timestamp)) {
        // Data expired, clear it
        this.clearStripeCheckoutData();
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to retrieve Stripe checkout data:", error);
      return null;
    }
  }

  /**
   * Clear Stripe checkout data from localStorage
   */
  static clearStripeCheckoutData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.STRIPE);
    } catch (error) {
      console.error("Failed to clear Stripe checkout data:", error);
    }
  }

  /**
   * Save PayPal checkout data to localStorage
   */
  static savePayPalCheckoutData(data: CheckoutData): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PAYPAL, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save PayPal checkout data:", error);
    }
  }

  /**
   * Retrieve PayPal checkout data from localStorage
   * Returns null if data doesn't exist or is expired
   */
  static getPayPalCheckoutData(): CheckoutData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PAYPAL);
      if (!stored) return null;

      const data = JSON.parse(stored) as CheckoutData;

      // Validate expiration
      if (!this.isCheckoutDataValid(data.timestamp)) {
        // Data expired, clear it
        this.clearPayPalCheckoutData();
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to retrieve PayPal checkout data:", error);
      return null;
    }
  }

  /**
   * Clear PayPal checkout data from localStorage
   */
  static clearPayPalCheckoutData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.PAYPAL);
    } catch (error) {
      console.error("Failed to clear PayPal checkout data:", error);
    }
  }

  /**
   * Save Mollie (iDEAL) checkout data to sessionStorage.
   * MollieReturnClient reads these keys after the redirect back from Mollie
   * to verify the payment and create the order.
   */
  static saveMollieCheckoutData(data: CheckoutData, paymentId: string): void {
    try {
      sessionStorage.setItem(this.MOLLIE_SESSION_KEYS.PAYMENT_ID, paymentId);
      sessionStorage.setItem(
        this.MOLLIE_SESSION_KEYS.LINE_ITEMS,
        JSON.stringify(data.lineItems)
      );
      sessionStorage.setItem(
        this.MOLLIE_SESSION_KEYS.SHIPPING_ADDRESS,
        JSON.stringify(data.shippingAddress)
      );
      if (data.cartId) {
        sessionStorage.setItem(this.MOLLIE_SESSION_KEYS.CART_ID, data.cartId);
      }
      if (data.amount !== undefined) {
        sessionStorage.setItem(
          this.MOLLIE_SESSION_KEYS.ORDER_AMOUNT,
          String(data.amount)
        );
      }
    } catch (error) {
      console.error("Failed to save Mollie checkout data:", error);
    }
  }

  /**
   * Clear Mollie checkout data from sessionStorage
   */
  static clearMollieCheckoutData(): void {
    try {
      Object.values(this.MOLLIE_SESSION_KEYS).forEach((key) =>
        sessionStorage.removeItem(key)
      );
    } catch (error) {
      console.error("Failed to clear Mollie checkout data:", error);
    }
  }

  /**
   * Clear all checkout data from storage
   */
  static clearAllCheckoutData(): void {
    this.clearStripeCheckoutData();
    this.clearPayPalCheckoutData();
    this.clearMollieCheckoutData();
  }
}
