import { PAYMENT_RETURN_SERVICE_NAME } from "../constants/paymentReturn";
import { captureError } from "@/lib/observability/errorCapture";
import {
  PaymentRecoveryService,
  type RecordPaymentPayloadI,
} from "@/shared/services/paymentRecoveryService";

/**
 * Record a payment for crash recovery without ever failing the caller.
 * Recovery is a safety net: losing the record must not block fulfillment.
 */
export async function recordPaymentRecoverySafely(
  payload: RecordPaymentPayloadI,
): Promise<void> {
  try {
    await PaymentRecoveryService.recordPaymentForRecovery(payload);
  } catch (recoveryError) {
    captureError(recoveryError, {
      service: PAYMENT_RETURN_SERVICE_NAME[payload.paymentProvider],
      action: "recordPaymentForRecovery",
      metadata: {
        paymentId: payload.paymentIntentId,
        paymentStatus: payload.paymentStatus,
      },
    });
  }
}
