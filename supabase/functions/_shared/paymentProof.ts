import { FunctionError } from "./errors.ts";

export interface PaidPayment {
  amount: number;
  currency: string;
  userId: string;
  captureId?: string;
}

function requireOwner(owner: unknown, expectedUserId: string): string {
  if (typeof owner !== "string" || !expectedUserId || owner !== expectedUserId) {
    throw new FunctionError(403, "FORBIDDEN", "Payment does not belong to this user");
  }
  return owner;
}

function paidAmount(amount: number, currency: string, userId: string): PaidPayment {
  if (!Number.isFinite(amount) || amount <= 0 || !/^[a-z]{3}$/i.test(currency)) {
    throw new FunctionError(402, "INVALID_PAYMENT", "Payment amount or currency is invalid");
  }
  return { amount, currency: currency.toUpperCase(), userId };
}

export function verifyStripePayment(payment: {
  status: string;
  amount_received: number;
  currency: string;
  metadata: Record<string, string> | null;
}, userId: string): PaidPayment {
  requireOwner(payment.metadata?.user_id, userId);
  if (payment.status !== "succeeded" || payment.metadata?.type === "credit_purchase") {
    throw new FunctionError(402, "PAYMENT_NOT_COMPLETED", "No completed order payment");
  }
  return paidAmount(payment.amount_received / 100, payment.currency, userId);
}

export interface PayPalPayment {
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
    payments?: { captures?: Array<{
      id: string;
      status: string;
      amount: { value: string; currency_code: string };
    }> };
  }>;
}

export function verifyPayPalPayment(payment: PayPalPayment, userId: string, refundRetry = false): PaidPayment {
  // Our checkout creates one purchase unit and one capture. Reject ambiguous
  // or partial payments instead of treating an order's approval as payment.
  const unit = payment.purchase_units?.[0];
  let owner: unknown;
  try {
    owner = JSON.parse(unit?.custom_id || "{}").user_id;
  } catch {
    owner = undefined;
  }
  requireOwner(owner, userId);
  const capture = unit?.payments?.captures?.[0];
  if (payment.status !== "COMPLETED" || payment.purchase_units?.length !== 1 ||
    unit?.payments?.captures?.length !== 1 || !capture?.id ||
    (capture.status !== "COMPLETED" && !(refundRetry && capture.status === "REFUNDED"))) {
    throw new FunctionError(402, "PAYMENT_NOT_COMPLETED", "No completed capture");
  }
  return {
    ...paidAmount(Number(capture.amount.value), capture.amount.currency_code, userId),
    captureId: capture.id,
  };
}

export function verifyMolliePayment(payment: {
  status: string;
  metadata: Record<string, unknown> | null;
  amount: { value: string; currency: string };
  amountRefunded?: { value: string };
}, userId: string, refundRetry = false): PaidPayment {
  requireOwner(payment.metadata?.user_id, userId);
  const refunded = Number(payment.amountRefunded?.value || 0);
  if (payment.status !== "paid" || (refunded !== 0 && !(refundRetry && refunded === Number(payment.amount.value)))) {
    throw new FunctionError(402, "PAYMENT_NOT_COMPLETED", "No completed unrefunded payment");
  }
  return paidAmount(Number(payment.amount.value), payment.amount.currency, userId);
}

export function requirePaymentCurrency(payment: PaidPayment, currency: string): void {
  if (typeof currency !== "string" || payment.currency !== currency.toUpperCase()) {
    throw new FunctionError(400, "CURRENCY_MISMATCH", "Payment currency does not match order");
  }
}
