/**
 * Order cancellation support
 *
 * Adds the columns the cancel-order edge function writes when cancelling an
 * order.
 *
 * NOTE: This migration originally also defined atomic-cancellation RPCs
 * (cancel_order_with_refund_atomic / confirm_refund_completed /
 * handle_refund_failure). Those were removed: they were unused dead code,
 * incompatible with the current payment_transactions constraints (they wrote
 * status='refund_pending', which check_valid_transaction_status forbids). The
 * live cancel flow performs a direct UPDATE and delegates refunds to the
 * process-refund edge function.
 */

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
