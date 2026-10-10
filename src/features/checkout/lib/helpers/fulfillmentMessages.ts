import { getUserFacingMessage } from "../errors/UserFacingError";
import type {
  OrderFulfillmentMessagesI,
  PaymentReturnTranslatorT,
} from "../types/paymentReturn";

/** Stripe and PayPal share the same refund copy keys. */
export function buildRefundFulfillmentMessages(
  t: PaymentReturnTranslatorT,
): OrderFulfillmentMessagesI {
  return {
    orderCreationFailed: () => t("orderCreationFailedRefund"),
    orderIdMissing: t("orderCreationFailedRefund"),
    fulfillmentFailed: () => t("orderFulfillmentFailedRefund"),
  };
}

/** Mollie surfaces the underlying user-facing reason before the refund note. */
export function buildMollieFulfillmentMessages(
  t: PaymentReturnTranslatorT,
): OrderFulfillmentMessagesI {
  const withRefund = (cause: unknown, fallbackKey: string) =>
    t("reasonWithRefund", {
      reason: getUserFacingMessage(cause, t(fallbackKey)),
    });

  return {
    orderCreationFailed: (cause) =>
      withRefund(cause, "orderCreationReasonFallback"),
    orderIdMissing: t("errorOrderIdNotReturned"),
    fulfillmentFailed: (cause) =>
      withRefund(cause, "orderFulfillmentReasonFallback"),
  };
}
