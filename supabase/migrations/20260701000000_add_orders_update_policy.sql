-- =====================================================
-- Add UPDATE policy for orders table
-- =====================================================
-- This migration adds a missing RLS policy to allow users
-- to update their own orders. Previously, users could only
-- SELECT and INSERT their own orders, but not UPDATE them.
--
-- This caused failures when trying to update orders with
-- printify_order_id after Printify order creation.

DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment explaining the policy
COMMENT ON POLICY "Users can update their own orders" ON orders IS
  'Allows authenticated users to update their own orders (e.g., adding printify_order_id after order creation)';
