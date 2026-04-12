import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { getAuthenticatedHeaders } from "./authHelpers";

export interface CreatePayPalOrderPayloadI {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  orderId?: string;
  testMode?: boolean;
}

export interface CreatePayPalOrderResponseI {
  orderId: string;
}

export interface CapturePayPalOrderPayloadI {
  orderId: string;
  payerId?: string | null;
}

export interface CapturePayPalOrderResponseI {
  success: boolean;
  captureId?: string;
  status?: string;
  payerEmail?: string;
  error?: string;
  restartable?: boolean;
}

export class PayPalService {
  private static getSupabase() {
    return createClient();
  }

  static async createOrder({
    amount,
    lineItems,
    shippingAddress,
    orderId,
    testMode = false,
  }: CreatePayPalOrderPayloadI): Promise<CreatePayPalOrderResponseI> {
    try {
      const headers = await getAuthenticatedHeaders("PayPal");

      if (!orderId) {
        throw ErrorClient.handleError({
          error: new Error("Order ID is required before creating PayPal order"),
          service: "PayPal",
          action: "Create Order",
        });
      }

      const { data, error } = await this.getSupabase().functions.invoke(
        "create-paypal-order",
        {
          body: {
            amount,
            currency: "usd",
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
        throw ErrorClient.handleError({ error, service: "PayPal", action: "Create Order" });
      }

      if (!data?.orderId) {
        throw ErrorClient.handleError({ error: new Error("Failed to create PayPal order"), service: "PayPal", action: "Create Order" });
      }

      return { orderId: data.orderId };
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

      if (data?.success === false) {
        return {
          success: false,
          captureId: data.captureId,
          status: data.status,
          payerEmail: data.payerEmail,
          error: data.error,
          restartable: data.restartable,
        };
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
