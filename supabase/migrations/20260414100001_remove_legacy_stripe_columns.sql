-- Migration: Remove legacy Stripe columns from orders table
-- Description: The Stripe payment info is now stored in payment_transactions table.
--              These columns on orders were duplicating data and are no longer needed.
--
-- Columns being removed:
--   - stripe_payment_intent_id (duplicated in payment_transactions.stripe_payment_intent_id)
--   - stripe_customer_id (duplicated in payment_transactions.stripe_customer_id)
--
-- NOTE: payment_method column is KEPT as it's a generic field used by all providers

-- Remove legacy Stripe columns
ALTER TABLE orders DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE orders DROP COLUMN IF EXISTS stripe_customer_id;

-- Add comment to clarify where payment info lives
COMMENT ON TABLE orders IS 'Orders table - payment details stored in payment_transactions table, linked via order_id';
