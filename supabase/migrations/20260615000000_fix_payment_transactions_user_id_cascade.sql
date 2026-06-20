-- =====================================================
-- Fix payment_transactions.user_id Foreign Key Constraint
-- Created: 2026-06-15
-- Description: Add ON DELETE CASCADE to payment_transactions.user_id
--              to allow user deletion without foreign key constraint errors
-- =====================================================

-- Drop the existing foreign key constraint (if it exists)
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_user_id_fkey;

-- Recreate the foreign key constraint with ON DELETE CASCADE
ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT payment_transactions_user_id_fkey ON payment_transactions IS
  'Ensures user_id references a valid user. Cascades deletion when user is deleted.';
