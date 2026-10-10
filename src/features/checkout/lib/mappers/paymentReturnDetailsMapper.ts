import {
  FALLBACK_ORDER_NUMBER_PREFIX,
  PAYMENT_RETURN_ALTERNATIVE_METHODS,
  PAYMENT_RETURN_METHOD,
} from "../constants/paymentReturn";
import type { PaymentReturnProviderT } from "../types/paymentReturn";
import type {
  PaymentErrorDetailsI,
  PaymentSuccessDetailsI,
} from "@/shared/types/payment";

const EMPTY_VALUE = "—";

/** Short provider-prefixed reference shown until the real order number loads. */
export function buildFallbackOrderNumber(
  provider: PaymentReturnProviderT,
  paymentId: string | null,
): string {
  if (!paymentId) return EMPTY_VALUE;
  const suffix = paymentId.slice(-6).toUpperCase();
  return `#${FALLBACK_ORDER_NUMBER_PREFIX[provider]}-${suffix}`;
}

interface SuccessDetailsInputI {
  provider: PaymentReturnProviderT;
  id: string | null;
  paymentId: string | null;
  orderNumber: string | null;
  status: string;
  totalPaid: string;
  estimatedDelivery: string;
}

export function mapPaymentSuccessDetails({
  provider,
  id,
  paymentId,
  orderNumber,
  status,
  totalPaid,
  estimatedDelivery,
}: SuccessDetailsInputI): PaymentSuccessDetailsI {
  return {
    id: id ?? "",
    provider: PAYMENT_RETURN_METHOD[provider],
    status,
    orderNumber: orderNumber || buildFallbackOrderNumber(provider, paymentId),
    totalPaid,
    estimatedDelivery,
    confirmationEmail: "",
  };
}

interface FailureDetailsInputI {
  provider: PaymentReturnProviderT;
  paymentId: string | null;
  status: string;
  reasonTitle: string;
  reasonMessage: string;
  /** Cancelled payments never reached an order, so they show no reference. */
  showOrderReference?: boolean;
}

export function mapPaymentFailureDetails({
  provider,
  paymentId,
  status,
  reasonTitle,
  reasonMessage,
  showOrderReference = true,
}: FailureDetailsInputI): PaymentErrorDetailsI {
  return {
    paymentId: paymentId ?? "",
    orderNumber: showOrderReference
      ? buildFallbackOrderNumber(provider, paymentId)
      : EMPTY_VALUE,
    amountDue: EMPTY_VALUE,
    attemptedOn: new Date().toLocaleString(),
    status,
    reasonTitle,
    reasonMessage,
    availableMethods: PAYMENT_RETURN_ALTERNATIVE_METHODS[provider],
  };
}
