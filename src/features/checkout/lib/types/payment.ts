/**
 * Minimal shape of the Stripe PaymentIntent handed back by usePaymentForm's
 * onSuccess callback — only the fields the checkout consumes.
 */
export interface StripePaymentIntentResultT {
  id: string;
  client_secret?: string | null;
  status?: string;
}
