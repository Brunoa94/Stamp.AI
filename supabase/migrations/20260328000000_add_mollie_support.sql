-- Add Mollie support to payment_transactions table

-- Step 1: Add Mollie-specific fields
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS mollie_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS mollie_status TEXT;

-- Step 2: Update payment_provider check constraint to include 'mollie'
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_payment_provider_check;

ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_payment_provider_check
  CHECK (payment_provider IN ('stripe', 'paypal', 'mollie'));

-- Step 3: Update payment ID existence check to include Mollie
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS chk_payment_id_exists;

ALTER TABLE payment_transactions
  ADD CONSTRAINT chk_payment_id_exists
  CHECK (stripe_payment_intent_id IS NOT NULL
         OR paypal_order_id IS NOT NULL
         OR mollie_payment_id IS NOT NULL);

-- Step 4: Create partial unique index for Mollie payment IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_mollie_payment
  ON payment_transactions(mollie_payment_id)
  WHERE mollie_payment_id IS NOT NULL;

-- Step 5: Comment for documentation
COMMENT ON COLUMN payment_transactions.mollie_payment_id IS 'The Mollie payment ID (tr_xxx)';
COMMENT ON COLUMN payment_transactions.mollie_status IS 'The Mollie payment status (open, pending, paid, failed, canceled, expired)';
