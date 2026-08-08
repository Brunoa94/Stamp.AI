import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";
import { getAuthenticatedHeaders } from "./authHelpers";
import type {
  CreatePayPalOrderPayloadI,
  CreatePayPalOrderResponseI,
  CapturePayPalOrderPayloadI,
  CapturePayPalOrderResponseI,
} from "@/types/payment";

export class PayPalService {
  private static getSupabase() {
    return createClient();
  }

  static async createOrder({
    amount,
    lineItems,
    shippingAddress,
    testMode = false,
  }: CreatePayPalOrderPayloadI): Promise<CreatePayPalOrderResponseI> {
    try {
      const headers = await getAuthenticatedHeaders("PayPal");

      const { data, error } = await this.getSupabase().functions.invoke(
        "create-paypal-order",
        {
          body: {
            amount,
            currency: "eur",
            line_items: lineItems,
            shipping_address: shippingAddress,
            metadata: {
              order_id: `order_${Date.now()}`,
              test_mode: testMode,
            },
          },
          headers,
        }
      );

      if (error) {
        throw ErrorClient.handleError({ error, service: "PayPal", action: "Create Order" });
      }

      if (!data?.orderId || !data?.approvalUrl) {
        throw ErrorClient.handleError({ error: new Error("Failed to create PayPal order"), service: "PayPal", action: "Create Order" });
      }

      return { orderId: data.orderId, approvalUrl: data.approvalUrl };
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "PayPal",
        action: "Create Order",
      });
    }
  }

  static async captureOrder({
    orderId,
    payerId,
  }: CapturePayPalOrderPayloadI): Promise<CapturePayPalOrderResponseI> {
    try {
      const headers = await getAuthenticatedHeaders("PayPal");

      const { data, error } = await this.getSupabase().functions.invoke(
        "capture-paypal-order",
        {
          body: {
            orderId,
            payerId,
          },
          headers,
        }
      );

      if (error) {
        throw ErrorClient.handleError({ error, service: "PayPal", action: "Capture Order" });
      }

      if (!data?.success || !data?.captureId) {
        throw ErrorClient.handleError({ error: new Error("Failed to capture PayPal payment"), service: "PayPal", action: "Capture Order" });
      }

      return {
        success: true,
        captureId: data.captureId,
        payerEmail: data.payerEmail,
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "PayPal",
        action: "Capture Order",
      });
    }
  }
}
