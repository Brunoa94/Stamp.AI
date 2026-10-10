import { PAYMENT_RETURN_SERVICE_NAME } from "../constants/paymentReturn";
import { getUserFacingMessage } from "../errors/UserFacingError";
import { buildMollieFulfillmentMessages } from "../helpers/fulfillmentMessages";
import type {
  MollieReturnStateI,
  PaymentReturnContextI,
} from "../types/paymentReturn";
import { CheckoutStorageService } from "./checkoutStorageService";
import { claimPaymentFinalization } from "./claimPaymentFinalization";
import {
  buildMollieOrderContext,
  resolveMollieCheckoutSession,
} from "./mollieReturnContextService";
import { PaymentFinalizationLockService } from "./paymentFinalizationLockService";
import { recordPaymentRecoverySafely } from "./paymentReturnRecoveryService";
import {
  isMolliePaymentFailed,
  isMolliePaymentPaid,
  isMolliePaymentPending,
  type MolliePaymentStatus,
} from "@/lib/mollie";
import { captureError } from "@/lib/observability/errorCapture";

export type VerifyMolliePaymentT = (input: {
  paymentId: string;
}) => Promise<{ status: MolliePaymentStatus }>;

const MOLLIE_CURRENCY = "EUR";

/** Verify a Mollie payment and, once paid, finalize it into a fulfilled order. */
export async function processMollieReturn(
  paymentIdFromUrl: string | null,
  verifyPayment: VerifyMolliePaymentT,
  { user, t, fulfillOrder, update }: PaymentReturnContextI<MollieReturnStateI>,
): Promise<void> {
  const session = await resolveMollieCheckoutSession(paymentIdFromUrl);
  const { paymentId, cartId } = session;

  if (!paymentId) {
    update({ status: "error", errorMessage: t("errorNoPaymentInfo") });
    return;
  }
  update({ cartId });

  if (!user) {
    update({
      status: "error",
      errorMessage: t("errorMustBeLoggedIn", { paymentId }),
    });
    return;
  }
  if (!cartId) {
    update({
      status: "error",
      errorMessage: t("errorCartNotFound", { paymentId }),
    });
    return;
  }

  update({ paymentId });
  if (!claimPaymentFinalization("mollie", paymentId, update)) return;

  try {
    const context = await buildMollieOrderContext(session, cartId, t);
    const recoveryRecord = {
      paymentProvider: "mollie" as const,
      paymentIntentId: paymentId,
      amount: context.amount,
      currency: MOLLIE_CURRENCY,
      cartSnapshot: context.cartSnapshot,
      shippingAddress: context.shippingAddress,
      lineItems: context.lineItems,
      metadata: { idempotency_key: `mollie_${paymentId}` },
    };

    // Record BEFORE verification so a failed verification stays recoverable.
    // The webhook moves the record forward once Mollie confirms the payment.
    await recordPaymentRecoverySafely({
      ...recoveryRecord,
      paymentStatus: "pending",
    });

    const { status: providerStatus } = await verifyPayment({ paymentId });
    update({ providerStatus });

    if (isMolliePaymentPaid(providerStatus)) {
      const { orderNumber } = await fulfillOrder({
        provider: "mollie",
        paymentId,
        refundReference: paymentId,
        user,
        ...context,
        currency: MOLLIE_CURRENCY,
        generateInvoice: true,
        messages: buildMollieFulfillmentMessages(t),
      });

      PaymentFinalizationLockService.markFinalized("mollie", paymentId);
      CheckoutStorageService.clearMollieCheckoutData();
      update({ status: "success", orderNumber });
      return;
    }

    PaymentFinalizationLockService.release("mollie", paymentId);

    if (isMolliePaymentFailed(providerStatus)) {
      CheckoutStorageService.clearMollieCheckoutData();
      update({ status: "failed" });
    } else if (isMolliePaymentPending(providerStatus)) {
      update({ status: "pending" });
    } else {
      // Without this branch an unknown status would leave the page verifying forever.
      update({
        status: "error",
        errorMessage: t("errorUnknownStatus", { paymentId }),
      });
    }
  } catch (error) {
    captureError(error, {
      service: PAYMENT_RETURN_SERVICE_NAME.mollie,
      action: "verifyPayment",
      metadata: { paymentId },
    });
    PaymentFinalizationLockService.release("mollie", paymentId);

    // The payment was recorded for recovery, so reassure the customer.
    // Raw service errors fall back to translated copy.
    update({
      status: "error",
      errorMessage: t("errorRecorded", {
        message: getUserFacingMessage(error, t("errorVerifyFallback")),
        paymentId,
      }),
    });
  }
}
