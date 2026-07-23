-- =====================================================
-- Verify and fix payment_recovery RLS policies
-- =====================================================
-- This migration ensures all necessary RLS policies and grants
-- are in place for the payment_recovery table to work with
-- authenticated users calling record_payment_for_recovery RPC.

-- Ensure authenticated role has necessary grants
GRANT SELECT, INSERT, UPDATE ON payment_recovery TO authenticated;

-- Drop and recreate all policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view own payment recoveries" ON payment_recovery;
CREATE POLICY "Users can view own payment recoveries"
  ON payment_recovery FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payment recoveries" ON payment_recovery;
CREATE POLICY "Users can insert own payment recoveries"
  ON payment_recovery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payment recoveries" ON payment_recovery;
CREATE POLICY "Users can update own payment recoveries"
  ON payment_recovery FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage payment recoveries" ON payment_recovery;
CREATE POLICY "Service role can manage payment recoveries"
  ON payment_recovery FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON POLICY "Users can view own payment recoveries" ON payment_recovery IS
  'Allows authenticated users to view their own payment recovery records';

COMMENT ON POLICY "Users can insert own payment recoveries" ON payment_recovery IS
  'Allows authenticated users to insert payment recovery records for themselves via record_payment_for_recovery RPC';

COMMENT ON POLICY "Users can update own payment recoveries" ON payment_recovery IS
  'Allows authenticated users to update their own payment recovery records (e.g., on conflict in record_payment_for_recovery)';

COMMENT ON POLICY "Service role can manage payment recoveries" ON payment_recovery IS
  'Allows service role full access to all payment recovery records';
