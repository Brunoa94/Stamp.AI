import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { ShippingAddressT } from "@/schemas/checkout";

export interface CheckoutData {
  billing: ShippingAddressT;
  shipping?: ShippingAddressT;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  cartId: string | null;
  paymentMethod: "stripe" | "paypal";
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
 * - Validate data expiration (1 hour)
 * - Clean up expired data
 */
export class CheckoutStorageService {
  private static readonly STORAGE_KEYS = {
    STRIPE: "stripe_checkout_data",
    PAYPAL: "paypal_checkout_data",
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
   * Clear all checkout data from localStorage
   */
  static clearAllCheckoutData(): void {
    this.clearStripeCheckoutData();
    this.clearPayPalCheckoutData();
  }
}
