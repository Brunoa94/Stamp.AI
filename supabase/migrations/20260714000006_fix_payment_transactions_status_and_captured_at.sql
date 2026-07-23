/**
 * Fix payment_transactions: conflicting status constraints + missing captured_at
 *
 * Two overlapping CHECK constraints on payment_transactions.status were both
 * active:
 *   payment_transactions_status_check : (processing, succeeded, failed, canceled, refunded)  -- no 'pending'
 *   check_valid_transaction_status    : (pending, succeeded, failed, refunded, canceled)     -- no 'processing'
 * A row must satisfy BOTH, so the intersection excluded BOTH 'pending' and
 * 'processing'. That made it impossible to insert a new payment row (create-*-payment
 * insert status='pending') or a Stripe checkout.session row (status='processing').
 * Consolidate into a single constraint covering every status the app actually uses.
 *
 * Also: atomic_stripe/paypal/mollie_payment_capture (migration 20260625000001) write
 * payment_transactions.captured_at, but no migration ever added that column, so every
 * capture RPC failed at runtime. Add it.
 */

ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ;

ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_status_check;
ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS check_valid_transaction_status;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_status_check
  CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'canceled'));
