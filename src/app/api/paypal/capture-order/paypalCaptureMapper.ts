import type { PayPalCaptureResponse } from "@/lib/paypal-server";
import type { Database } from "@/types/database.types";

type PaymentTransactionUpdate = Database['public']['Tables']['payment_transactions']['Update'];

/**
 * PayPal Capture Order Mapper
 * Maps PayPal API responses to database update payloads
 */
export class PayPalCaptureMapper {
  /**
   * Parse custom_id from PayPal capture response to extract metadata
   */
  static parseCustomId(customId?: string): {
    metadata: Record<string, unknown>;
    userId?: string;
  } {
    try {
      const customData = JSON.parse(customId || "{}");
      return {
        metadata: customData,
        userId: customData.user_id,
      };
    } catch (e) {
      console.warn("Could not parse custom_id:", e);
      return {
        metadata: {},
        userId: undefined,
      };
    }
  }

  /**
   * Map PayPal capture response to atomic payment capture parameters
   */
  static mapToAtomicCaptureParams(
    captureResult: PayPalCaptureResponse,
    orderId: string
  ): {
    p_paypal_order_id: string;
    p_paypal_capture_id: string;
    p_amount: number;
    p_currency: string;
    p_captured_at: string;
  } {
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      p_paypal_order_id: orderId,
      p_paypal_capture_id: capture?.id || orderId,
      p_amount: parseFloat(capture?.amount?.value || "0"),
      p_currency: capture?.amount?.currency_code || "USD",
      p_captured_at: new Date().toISOString(),
    };
  }

  /**
   * Map PayPal payer info to payment transaction update payload
   */
  static mapPayerInfoToUpdate(
    captureResult: PayPalCaptureResponse,
    payerId?: string
  ): PaymentTransactionUpdate {
    const payer = captureResult.payer;

    return {
      paypal_payer_id: payer?.payer_id || payerId || null,
      paypal_payer_email: payer?.email_address || null,
      payment_method_type: "paypal",
    };
  }

  /**
   * Map PayPal capture response to success response
   */
  static mapToSuccessResponse(captureResult: PayPalCaptureResponse) {
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureResult.payer;

    return {
      success: true,
      captureId: capture?.id || captureResult.id,
      status: captureResult.status,
      payerEmail: payer?.email_address,
    };
  }

  /**
   * Extract capture details from PayPal response
   */
  static extractCaptureDetails(captureResult: PayPalCaptureResponse) {
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureResult.payer;
    const customId = captureResult.purchase_units?.[0]?.custom_id;

    return {
      capture,
      payer,
      customId,
    };
  }
}
