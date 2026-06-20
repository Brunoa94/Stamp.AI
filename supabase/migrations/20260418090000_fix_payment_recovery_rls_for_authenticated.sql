-- =====================================================
-- Fix payment_recovery RLS for authenticated checkout flow
-- Created: 2026-04-18
-- Description:
--   The checkout client calls rpc(record_payment_for_recovery), which performs
--   INSERT ... ON CONFLICT DO UPDATE on payment_recovery using the caller role.
--   Existing RLS only allowed SELECT for users and ALL for service_role,
--   causing "new row violates row-level security policy".
-- =====================================================

-- Authenticated users need UPDATE privilege for upsert conflict path and
-- mark_payment_recovered() updates.
GRANT UPDATE ON payment_recovery TO authenticated;

-- Insert policy: user can insert only rows that belong to auth.uid().
DROP POLICY IF EXISTS "Users can insert own payment recoveries" ON payment_recovery;
CREATE POLICY "Users can insert own payment recoveries"
  ON payment_recovery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update policy: user can update only their own rows and cannot change owner.
DROP POLICY IF EXISTS "Users can update own payment recoveries" ON payment_recovery;
CREATE POLICY "Users can update own payment recoveries"
  ON payment_recovery FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
