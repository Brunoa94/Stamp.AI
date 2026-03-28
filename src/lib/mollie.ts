/**
 * Mollie Configuration
 * Mollie uses a redirect-based payment flow, so we only need minimal client-side config
 */

/**
 * Check if Mollie is enabled via environment variable
 */
export const MOLLIE_ENABLED = process.env.NEXT_PUBLIC_MOLLIE_ENABLED === "true";

/**
 * Check if Mollie is configured and enabled
 */
export const isMollieConfigured = (): boolean => {
  return MOLLIE_ENABLED;
};

/**
 * Mollie payment status types (for client-side use)
 */
export type MolliePaymentStatus =
  | "open"
  | "canceled"
  | "pending"
  | "authorized"
  | "expired"
  | "failed"
  | "paid";

/**
 * Check if a payment status indicates success
 */
export const isMolliePaymentPaid = (status: MolliePaymentStatus): boolean => {
  return status === "paid";
};

/**
 * Check if a payment status indicates failure
 */
export const isMolliePaymentFailed = (status: MolliePaymentStatus): boolean => {
  return status === "failed" || status === "canceled" || status === "expired";
};

/**
 * Check if a payment is still pending/processing
 */
export const isMolliePaymentPending = (status: MolliePaymentStatus): boolean => {
  return status === "open" || status === "pending" || status === "authorized";
};
