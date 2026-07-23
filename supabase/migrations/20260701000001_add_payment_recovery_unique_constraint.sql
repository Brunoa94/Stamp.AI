-- =====================================================
-- Add missing unique constraint to payment_recovery table
-- =====================================================
-- This migration adds the unique constraint that is required
-- by the record_payment_for_recovery function's ON CONFLICT clause.
--
-- The constraint ensures that each payment (identified by provider
-- and payment_intent_id) can only be recorded once, preventing
-- duplicate recovery records.

-- Add the unique constraint if it doesn't exist
-- Note: We use IF NOT EXISTS equivalent by checking first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_payment_recovery'
        AND conrelid = 'public.payment_recovery'::regclass
    ) THEN
        ALTER TABLE payment_recovery
        ADD CONSTRAINT unique_payment_recovery
        UNIQUE (payment_provider, payment_intent_id);

        RAISE NOTICE 'Added unique_payment_recovery constraint';
    ELSE
        RAISE NOTICE 'unique_payment_recovery constraint already exists';
    END IF;
END $$;

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_payment_recovery ON payment_recovery IS
  'Ensures each payment intent can only be recorded once per provider for recovery tracking';
