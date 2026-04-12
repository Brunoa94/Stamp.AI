import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { MolliePaymentStatus } from "@/lib/mollie";
import { getAuthenticatedHeaders } from "./authHelpers";
import type {
  CreateMolliePaymentPayloadI,
  CreateMolliePaymentResponseI,
  VerifyMolliePaymentPayloadI,
  VerifyMolliePaymentResponseI,
} from "@/types/payment";

export class MollieService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Create a Mollie payment and get the checkout URL
   */
  static async createPayment({
    amount,
    currency = "EUR",
    description,
    lineItems,
    shippingAddress,
    orderId,
    testMode = false,
  }: CreateMolliePaymentPayloadI): Promise<CreateMolliePaymentResponseI> {
    try {
      const headers = await getAuthenticatedHeaders("Mollie");

      if (!orderId) {
        throw ErrorClient.handleError({
          error: new Error("Order ID is required before creating Mollie payment"),
          service: "Mollie",
          action: "Create Payment",
        });
      }

      const { data, error } = await this.getSupabase().functions.invoke(
        "create-mollie-payment",
        {
          body: {
            amount,
            currency,
            description,
            line_items: lineItems,
            shipping_address: shippingAddress,
            metadata: {
              order_id: orderId,
              test_mode: testMode,
            },
          },
          headers,
        }
      );

      if (error) {
        throw ErrorClient.handleError({ error, service: "Mollie", action: "Create Payment" });
      }

      if (!data?.paymentId || !data?.checkoutUrl) {
        throw ErrorClient.handleError({ error: new Error("Failed to create Mollie payment"), service: "Mollie", action: "Create Payment" });
      }

      return {
        paymentId: data.paymentId,
        checkoutUrl: data.checkoutUrl,
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Mollie",
        action: "Create Payment",
      });
    }
  }

  /**
   * Verify a Mollie payment status
   * Called after redirect back from Mollie
   */
  static async verifyPayment({
    paymentId,
  }: VerifyMolliePaymentPayloadI): Promise<VerifyMolliePaymentResponseI> {
    try {
      const headers = await getAuthenticatedHeaders("Mollie");

      const { data, error } = await this.getSupabase().functions.invoke(
        "verify-mollie-payment",
        {
          body: {
            paymentId,
          },
          headers,
        }
      );

      if (error) {
        throw ErrorClient.handleError({ error, service: "Mollie", action: "Verify Payment" });
      }

      if (!data?.paymentId) {
        throw ErrorClient.handleError({ error: new Error("Failed to verify Mollie payment"), service: "Mollie", action: "Verify Payment" });
      }

      return {
        paymentId: data.paymentId,
        status: data.status,
        isPaid: data.isPaid,
        metadata: data.metadata,
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Mollie",
        action: "Verify Payment",
      });
    }
  }
}
