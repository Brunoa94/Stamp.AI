import { PAYMENT_RETURN_SERVICE_NAME } from "../constants/paymentReturn";
import {
  UserFacingError,
  getUserFacingMessage,
} from "../errors/UserFacingError";
import type {
  PaymentReturnContextI,
  PayPalReturnStateI,
} from "../types/paymentReturn";
import { CheckoutStorageService } from "./checkoutStorageService";
import { claimPaymentFinalization } from "./claimPaymentFinalization";
import {
  capturePayPalOrder,
  isRetryablePayPalDecline,
} from "./payPalCaptureService";
import { PaymentFinalizationLockService } from "./paymentFinalizationLockService";
import { fulfillStoredCheckout } from "./storedCheckoutFulfillmentService";
import { captureError } from "@/lib/observability/errorCapture";

interface PayPalReturnParamsI {
  /** PayPal order ID. */
  token: string | null;
  payerId: string | null;
}

/** Capture an approved PayPal order and finalize it into a fulfilled order. */
export async function processPayPalReturn(
  { token, payerId }: PayPalReturnParamsI,
  { user, t, fulfillOrder, update }: PaymentReturnContextI<PayPalReturnStateI>,
): Promise<void> {
  // PayPal omits the approval params when the customer cancels.
  if (!token || !payerId) {
    CheckoutStorageService.clearPayPalCheckoutData();
    update({ status: "cancelled" });
    return;
  }
  update({ paymentId: token });

  const checkoutData = CheckoutStorageService.getPayPalCheckoutData();
  if (!checkoutData) {
    update({ status: "error", errorMessage: t("errorCheckoutDataExpired") });
    return;
  }
  if (!user) {
    update({ status: "error", errorMessage: t("errorMustBeLoggedIn") });
    return;
  }
  if (!claimPaymentFinalization("paypal", token, update)) return;

  update({ status: "processing" });

  try {
    const capture = await capturePayPalOrder(token, payerId);

    if (!capture.ok) {
      PaymentFinalizationLockService.release("paypal", token);
      CheckoutStorageService.clearPayPalCheckoutData();

      if (isRetryablePayPalDecline(capture)) {
        update({
          status: "failed",
          errorMessage: capture.error || t("declinedFallback"),
        });
        return;
      }
      throw new UserFacingError(capture.error || t("captureFailed"));
    }

    update({ captureId: capture.captureId ?? null });

    // The payment is captured from here on: missing data needs support.
    const { cartId, amount } = checkoutData;
    if (!cartId || !amount) {
      PaymentFinalizationLockService.release("paypal", token);
      CheckoutStorageService.clearPayPalCheckoutData();
      const errorKey = cartId ? "errorAmountNotFound" : "errorCartNotFound";
      update({
        status: "error",
        errorMessage: t(errorKey, { paymentId: token }),
      });
      return;
    }

    const { orderNumber } = await fulfillStoredCheckout({
      provider: "paypal",
      paymentId: token,
      refundReference: capture.captureId ?? null,
      checkoutData,
      cartId,
      user,
      t,
      fulfillOrder,
      metadata: { capture_id: capture.captureId },
      recoveryMetadata: { payer_email: capture.payerEmail },
    });

    PaymentFinalizationLockService.markFinalized("paypal", token);
    CheckoutStorageService.clearPayPalCheckoutData();
    update({ status: "success", orderNumber });
  } catch (error) {
    captureError(error, {
      service: PAYMENT_RETURN_SERVICE_NAME.paypal,
      action: "processPayPalReturn",
      metadata: { token },
    });
    PaymentFinalizationLockService.release("paypal", token);
    update({
      status: "error",
      errorMessage: getUserFacingMessage(error, t("errorFallback")),
    });
  }
}
