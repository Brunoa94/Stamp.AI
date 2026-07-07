import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";
import { getAuthenticatedHeaders } from "./authHelpers";

type RefundProviderT = "stripe" | "paypal" | "mollie";

interface ProcessRefundPayloadI {
  orderId: string;
  paymentProvider: RefundProviderT;
  amount: number;
  reason: string;
  stripePaymentIntentId?: string;
  paypalCaptureId?: string;
  molliePaymentId?: string;
}

export class RefundService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Retry a function with exponential backoff
   * CRITICAL: Used for refund processing to handle transient failures
   */
  private static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(`⚠️ Retry attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Create a refund failure alert in the database
   * CRITICAL: This ensures failed refunds are tracked for manual intervention
   */
  private static async createRefundFailureAlert(
    paymentId: string,
    paymentProvider: RefundProviderT,
    orderId: string,
    amount: number,
    errorMessage: string,
    retryCount: number
  ): Promise<void> {
    try {
      const supabase = this.getSupabase();

      // Use the database function to create the alert
      const { error } = await supabase.rpc('create_refund_failure_alert', {
        p_payment_id: paymentId,
        p_payment_provider: paymentProvider,
        p_order_id: orderId,
        p_amount: amount,
        p_error_message: errorMessage,
        p_retry_count: retryCount,
      });

      if (error) {
        console.error('❌ Failed to create refund failure alert:', error);
        // Don't throw - we tried our best to log the failure
      } else {
        console.log('✅ Refund failure alert created successfully');
      }
    } catch (error) {
      console.error('❌ Exception creating refund failure alert:', error);
      // Don't throw - this is a logging operation
    }
  }

  /**
   * Process a refund with automatic retry logic
   * CRITICAL: This is called when payment succeeds but order creation fails
   * If refund fails, creates an alert for manual intervention
   */
  static async processRefund(payload: ProcessRefundPayloadI): Promise<void> {
    const {
      orderId,
      paymentProvider,
      amount,
      reason,
      stripePaymentIntentId,
      paypalCaptureId,
      molliePaymentId,
    } = payload;

    // Determine the payment ID for tracking
    const paymentId =
      paymentProvider === "stripe" ? stripePaymentIntentId :
      paymentProvider === "paypal" ? paypalCaptureId :
      paymentProvider === "mollie" ? molliePaymentId :
      "unknown";

    const refundBody: Record<string, unknown> = {
      order_id: orderId,
      payment_provider: paymentProvider,
      amount,
      reason,
    };

    if (paymentProvider === "stripe") {
      refundBody.stripe_payment_intent_id = stripePaymentIntentId;
    } else if (paymentProvider === "paypal") {
      refundBody.paypal_capture_id = paypalCaptureId;
    } else if (paymentProvider === "mollie") {
      refundBody.mollie_payment_id = molliePaymentId;
    }

    try {
      // Attempt refund with retry logic (3 attempts with exponential backoff)
      await this.retryWithBackoff(async () => {
        console.log(`💰 Attempting refund for ${paymentProvider} payment ${paymentId}...`);
        console.log(`📋 Refund payload:`, JSON.stringify(refundBody, null, 2));

        const supabase = this.getSupabase();
        const headers = await getAuthenticatedHeaders("Refund");

        const { data, error } = await supabase.functions.invoke("process-refund", {
          body: refundBody,
          headers,
        });

        if (error) {
          console.error(`❌ Refund edge function error:`, error);
          throw ErrorClient.handleError({
            error,
            service: "Refund",
            action: "Process Refund",
          });
        }

        console.log(`✅ Refund successful for ${paymentProvider} payment ${paymentId}`);
        console.log(`📊 Refund result:`, JSON.stringify(data, null, 2));
      }, 3, 1000);

    } catch (error) {
      // All retry attempts failed - create refund failure alert
      const errorMessage = error instanceof Error ? error.message : "Unknown refund error";

      console.error(`❌ All refund attempts failed for ${paymentProvider} payment ${paymentId}`);
      console.error(`❌ Error: ${errorMessage}`);
      console.error(`❌ Creating refund failure alert for manual intervention...`);

      // Create alert in refund_failures table
      await this.createRefundFailureAlert(
        paymentId || "unknown",
        paymentProvider,
        orderId,
        amount,
        errorMessage,
        3 // All 3 retries exhausted
      );

      // Re-throw the error so caller knows refund failed
      throw ErrorClient.handleError({
        error,
        service: "Refund",
        action: "Process Refund",
      });
    }
  }
}
