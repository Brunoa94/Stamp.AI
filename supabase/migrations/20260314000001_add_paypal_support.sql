-- Add PayPal support to payment_transactions table

-- Step 1: Drop the existing unique constraint on stripe_payment_intent_id
-- (We'll recreate it as a partial index)
DROP INDEX IF EXISTS idx_payment_transactions_stripe_payment_intent;

-- Step 2: Make stripe_payment_intent_id nullable
ALTER TABLE payment_transactions
  ALTER COLUMN stripe_payment_intent_id DROP NOT NULL;

-- Step 3: Add payment provider discriminator column
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe'
  CHECK (payment_provider IN ('stripe', 'paypal'));

-- Step 4: Add PayPal-specific fields
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_payer_email TEXT;

-- Step 5: Create partial unique indexes (only where values are not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent
  ON payment_transactions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_paypal_order
  ON payment_transactions(paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

-- Step 6: Add constraint to ensure at least one payment ID exists
ALTER TABLE payment_transactions
  ADD CONSTRAINT chk_payment_id_exists
  CHECK (stripe_payment_intent_id IS NOT NULL OR paypal_order_id IS NOT NULL);

-- Step 7: Create index for payment provider queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider
  ON payment_transactions(payment_provider);

-- Step 8: Update status check to include refunded status for PayPal
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_status_check;

ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_status_check
  CHECK (status IN ('processing', 'succeeded', 'failed', 'canceled', 'refunded'));
