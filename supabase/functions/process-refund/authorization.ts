import { FunctionError } from "../_shared/errors.ts";

export type PaymentProvider = "stripe" | "paypal" | "mollie";
export interface RefundRequest {
  order_id: string;
  payment_provider: PaymentProvider;
  amount?: number;
  currency?: string;
  reason?: string;
  stripe_payment_intent_id?: string;
  paypal_capture_id?: string;
  mollie_payment_id?: string;
}
export interface RefundOrder {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  printify_order_id: string | null;
  currency: string;
}
export interface RefundPayment {
  order_id: string;
  user_id: string;
  status: string;
  payment_provider: PaymentProvider;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  mollie_payment_id: string | null;
}

export function authorizeRefund(
  request: RefundRequest,
  order: RefundOrder,
  payment: RefundPayment,
  caller: { userId: string; isServiceRole: boolean },
) {
  if ((!caller.isServiceRole && caller.userId !== order.user_id) ||
    order.id !== request.order_id || payment.order_id !== order.id ||
    payment.user_id !== order.user_id || payment.payment_provider !== request.payment_provider) {
    throw new FunctionError(403, "FORBIDDEN", "Payment does not belong to this order");
  }
  // Cancellation is recorded by the server after the cancellation flow. A
  // failed confirmation is refundable only when no manufacturing order exists.
  const cancelled = ["cancelled", "canceled"].includes(order.status);
  const failed = order.status === "unsuccessful_confirmation" && !order.printify_order_id;
  if (order.payment_status !== "paid" || payment.status !== "succeeded" || (!cancelled && !failed)) {
    throw new FunctionError(409, "REFUND_NOT_ELIGIBLE", "Order is not eligible for an automatic refund");
  }
  const field = { stripe: "stripe_payment_intent_id", paypal: "paypal_capture_id", mollie: "mollie_payment_id" } as const;
  const providerId = payment[field[request.payment_provider]];
  if (!providerId || (request[field[request.payment_provider]] !== undefined &&
    request[field[request.payment_provider]] !== providerId)) {
    throw new FunctionError(403, "PAYMENT_MISMATCH", "Payment identifier does not match this order");
  }
  // This endpoint records a full order refund. Partial refunds require a
  // separate accounting flow and must not mark the entire order refunded.
  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || amount <= 0 ||
    (request.amount !== undefined && (!Number.isFinite(request.amount) ||
      Math.round(request.amount * 100) !== Math.round(amount * 100)))) {
    throw new FunctionError(400, "INVALID_REFUND_AMOUNT", "Refund must match the paid amount");
  }
  const currency = payment.currency.toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency) || currency !== order.currency.toUpperCase() ||
    (request.currency !== undefined && request.currency.toUpperCase() !== currency)) {
    throw new FunctionError(400, "CURRENCY_MISMATCH", "Refund currency must match payment");
  }
  const verificationId = request.payment_provider === "paypal" ? payment.paypal_order_id : providerId;
  if (!verificationId) throw new FunctionError(409, "MISSING_PAYMENT", "Missing provider order");
  return { providerId, verificationId, amount, currency };
}
