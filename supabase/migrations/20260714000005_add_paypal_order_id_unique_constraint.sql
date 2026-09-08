/**
 * Add a full UNIQUE constraint on payment_transactions.paypal_order_id
 *
 * Stripe already has a full unique constraint
 * (payment_transactions_stripe_payment_intent_id_key), which is what makes
 * `ON CONFLICT (stripe_payment_intent_id)` work in upsert_stripe_payment_transaction
 * and in the app-side merge-duplicates upserts.
 *
 * paypal_order_id only had PARTIAL unique indexes (WHERE paypal_order_id IS NOT NULL),
 * which Postgres will NOT match against a bare `ON CONFLICT (paypal_order_id)`. That
 * caused upsert_paypal_payment_transaction (and the PostgREST on_conflict upserts) to
 * fail with "there is no unique or exclusion constraint matching the ON CONFLICT
 * specification". A full unique constraint fixes both (NULLs remain allowed for
 * non-PayPal rows; existing partial indexes already guarantee no duplicate values).
 */

ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_paypal_order_id_key UNIQUE (paypal_order_id);
