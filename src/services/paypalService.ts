import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";

export interface CreatePayPalOrderPayloadI {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
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
  captureId: string;
  payerEmail?: string;
}

export class PayPalService {
  private static getSupabase() {
    return createClient();
  }

  private static async validateAuthenticatedSession(): Promise<void> {
    const {
      data: { session },
      error,
    } = await this.getSupabase().auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session) {
      throw new Error("You must be logged in to complete checkout");
    }
  }

  static async createOrder({
    amount,
    lineItems,
    shippingAddress,
    testMode = false,
  }: CreatePayPalOrderPayloadI): Promise<CreatePayPalOrderResponseI> {
    try {
      await this.validateAuthenticatedSession();

      const { data, error } = await this.getSupabase().functions.invoke(
        "create-paypal-order",
        {
          body: {
            amount,
            currency: "usd",
            line_items: lineItems,
            shipping_address: shippingAddress,
            metadata: {
              order_id: `order_${Date.now()}`,
              test_mode: testMode,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.orderId) {
        throw new Error("Failed to create PayPal order");
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
      const { data, error } = await this.getSupabase().functions.invoke(
        "capture-paypal-order",
        {
          body: {
            orderId,
            payerId,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success || !data?.captureId) {
        throw new Error("Failed to capture PayPal payment");
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
