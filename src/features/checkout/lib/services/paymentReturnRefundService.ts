import { PAYMENT_RETURN_SERVICE_NAME } from "../constants/paymentReturn";
import type { PaymentReturnProviderT } from "../types/paymentReturn";
import { captureError } from "@/lib/observability/errorCapture";
import { RefundService } from "@/shared/services/refundService";

interface RefundPaymentRequestI {
  provider: PaymentReturnProviderT;
  paymentId: string;
  refundReference: string | null;
  /** Created order ID; absent when the order was never created. */
  orderId: string | null;
  amount: number;
  reason: string;
}

function buildProviderReference(
  provider: PaymentReturnProviderT,
  refundReference: string,
) {
  switch (provider) {
    case "stripe":
      return { stripePaymentIntentId: refundReference };
    case "paypal":
      return { paypalCaptureId: refundReference };
    case "mollie":
      return { molliePaymentId: refundReference };
  }
}

/**
 * Refund a captured payment after fulfillment failed. Never throws: when
 * every attempt fails, RefundService raises a refund-failure alert for
 * manual intervention, so the caller can keep surfacing its own error.
 */
export async function refundPaymentSafely({
  provider,
  paymentId,
  refundReference,
  orderId,
  amount,
  reason,
}: RefundPaymentRequestI): Promise<void> {
  const service = PAYMENT_RETURN_SERVICE_NAME[provider];

  if (amount <= 0 || !refundReference) {
    captureError(new Error("Refund skipped: missing amount or reference"), {
      service,
      action: "triggerRefund",
      metadata: { paymentId, amount, reason },
    });
    return;
  }

  try {
    await RefundService.processRefund({
      // The refund endpoint only accepts real order IDs; a temp ID still
      // creates the refund-failure alert so support can refund manually.
      orderId: orderId ?? `temp_${provider}_${paymentId}`,
      paymentProvider: provider,
      amount,
      reason,
      ...buildProviderReference(provider, refundReference),
    });
  } catch (refundError) {
    captureError(refundError, {
      service,
      action: "triggerRefund",
      metadata: { paymentId, orderId, amount, reason },
    });
  }
}
