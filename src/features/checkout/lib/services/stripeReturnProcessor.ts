import { PAYMENT_RETURN_SERVICE_NAME } from "../constants/paymentReturn";
import { getUserFacingMessage } from "../errors/UserFacingError";
import type {
  PaymentReturnContextI,
  PaymentReturnStateI,
} from "../types/paymentReturn";
import { CheckoutStorageService } from "./checkoutStorageService";
import { claimPaymentFinalization } from "./claimPaymentFinalization";
import { PaymentFinalizationLockService } from "./paymentFinalizationLockService";
import { fulfillStoredCheckout } from "./storedCheckoutFulfillmentService";
import { captureError } from "@/lib/observability/errorCapture";

/** Finalize a Stripe payment the customer was redirected back from. */
export async function processStripeReturn(
  paymentIntentId: string | null,
  { user, t, fulfillOrder, update }: PaymentReturnContextI<PaymentReturnStateI>,
): Promise<void> {
  if (!paymentIntentId) {
    update({ status: "error", errorMessage: t("errorNoPaymentInfo") });
    return;
  }
  update({ paymentId: paymentIntentId });

  const checkoutData = CheckoutStorageService.getStripeCheckoutData();
  if (!checkoutData) {
    update({ status: "error", errorMessage: t("errorCheckoutDataExpired") });
    return;
  }
  if (!user) {
    update({ status: "error", errorMessage: t("errorMustBeLoggedIn") });
    return;
  }
  if (!checkoutData.cartId) {
    CheckoutStorageService.clearStripeCheckoutData();
    update({
      status: "error",
      errorMessage: t("errorCartNotFound", { paymentId: paymentIntentId }),
    });
    return;
  }
  if (!claimPaymentFinalization("stripe", paymentIntentId, update)) return;

  update({ status: "processing" });

  try {
    const { orderNumber } = await fulfillStoredCheckout({
      provider: "stripe",
      paymentId: paymentIntentId,
      refundReference: paymentIntentId,
      checkoutData,
      cartId: checkoutData.cartId,
      user,
      t,
      fulfillOrder,
    });

    PaymentFinalizationLockService.markFinalized("stripe", paymentIntentId);
    CheckoutStorageService.clearStripeCheckoutData();
    update({ status: "success", orderNumber });
  } catch (error) {
    captureError(error, {
      service: PAYMENT_RETURN_SERVICE_NAME.stripe,
      action: "processStripeReturn",
      metadata: { paymentIntentId },
    });
    PaymentFinalizationLockService.release("stripe", paymentIntentId);
    update({
      status: "error",
      errorMessage: getUserFacingMessage(error, t("errorFallback")),
    });
  }
}
