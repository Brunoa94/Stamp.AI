import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { validateEnvVars } from "./validators.ts";
import { FunctionError } from "./errors.ts";
import { getPayPalOrder } from "./paypal.ts";
import { getMolliePayment } from "./mollie.ts";
import { verifyStripePayment, verifyPayPalPayment, verifyMolliePayment, type PaidPayment } from "./paymentProof.ts";

export async function verifyPaidPayment(provider: string, paymentId: string, userId: string, refundRetry = false): Promise<PaidPayment> {
  if (typeof paymentId !== "string" || !/^[a-z0-9_-]+$/i.test(paymentId)) {
    throw new FunctionError(400, "INVALID_PAYMENT_ID", "Invalid provider payment ID");
  }
  if (provider === "stripe") {
    const stripe = new Stripe(validateEnvVars.stripeSecretKey(), {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });
    const payment = await stripe.paymentIntents.retrieve(paymentId);
    // A refunded charge can still have a succeeded PaymentIntent.
    const chargeId = typeof payment.latest_charge === "string" ? payment.latest_charge : payment.latest_charge?.id;
    if (!chargeId) throw new FunctionError(402, "PAYMENT_NOT_COMPLETED", "Missing charge");
    const charge = await stripe.charges.retrieve(chargeId);
    if ((charge.amount_refunded > 0 && !(refundRetry && charge.refunded)) || charge.disputed) {
      throw new FunctionError(402, "INVALID_PAYMENT", "Payment has been refunded or disputed");
    }
    return verifyStripePayment(payment, userId);
  }
  if (provider === "paypal") return verifyPayPalPayment(await getPayPalOrder(paymentId), userId, refundRetry);
  if (provider === "mollie") return verifyMolliePayment(await getMolliePayment(paymentId), userId, refundRetry);
  throw new FunctionError(400, "INVALID_PROVIDER", "Unknown payment provider");
}
