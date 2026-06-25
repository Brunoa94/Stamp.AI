-- =====================================================
-- Fix RLS Policies for Guest Carts and Product Creation
-- Created: 2026-06-21
-- Description:
-- 1. Allow guest users to create and manage carts using session_id
-- 2. Ensure authenticated users can insert products (policy already exists but may need verification)
-- =====================================================

-- =====================================================
-- CARTS TABLE - Guest Access
-- =====================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own cart" ON carts;
DROP POLICY IF EXISTS "Users can manage their own cart" ON carts;

-- Allow authenticated users to view their own carts
CREATE POLICY "Users can view their own cart"
  ON carts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow guests to view carts by session_id (when not authenticated)
CREATE POLICY "Guests can view carts by session"
  ON carts
  FOR SELECT
  USING (
    auth.uid() IS NULL
    AND session_id IS NOT NULL
  );

-- Allow authenticated users to manage their own carts
CREATE POLICY "Users can insert their own cart"
  ON carts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow guests to create carts with session_id
CREATE POLICY "Guests can create carts by session"
  ON carts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    AND session_id IS NOT NULL
    AND user_id IS NULL
  );

-- Allow authenticated users to update their own carts
CREATE POLICY "Users can update their own cart"
  ON carts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow guests to update carts by session_id
CREATE POLICY "Guests can update carts by session"
  ON carts
  FOR UPDATE
  USING (
    auth.uid() IS NULL
    AND session_id IS NOT NULL
    AND user_id IS NULL
  );

-- Allow authenticated users to delete their own carts
CREATE POLICY "Users can delete their own cart"
  ON carts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow guests to delete carts by session_id
CREATE POLICY "Guests can delete carts by session"
  ON carts
  FOR DELETE
  USING (
    auth.uid() IS NULL
    AND session_id IS NOT NULL
    AND user_id IS NULL
  );

-- =====================================================
-- CART ITEMS TABLE - Guest Access
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their cart items" ON cart_items;

-- Allow users to manage items in their own carts
CREATE POLICY "Users can manage their cart items"
  ON cart_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- Allow guests to manage items in session-based carts
CREATE POLICY "Guests can manage cart items by session"
  ON cart_items
  FOR ALL
  USING (
    auth.uid() IS NULL
    AND EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.session_id IS NOT NULL
      AND carts.user_id IS NULL
    )
  );

-- =====================================================
-- PRODUCTS TABLE - Verify Insert Policy Exists
-- =====================================================
-- Note: The policy "Authenticated users can insert products" should already exist
-- from migration 20260413100000_allow_users_insert_products.sql
-- This is just a verification that it exists, and creates it if missing

DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- ROLLBACK
-- =====================================================
-- To rollback this migration:
--
-- DROP POLICY IF EXISTS "Guests can view carts by session" ON carts;
-- DROP POLICY IF EXISTS "Guests can create carts by session" ON carts;
-- DROP POLICY IF EXISTS "Guests can update carts by session" ON carts;
-- DROP POLICY IF EXISTS "Guests can delete carts by session" ON carts;
-- DROP POLICY IF EXISTS "Guests can manage cart items by session" ON cart_items;
-- DROP POLICY IF EXISTS "Users can insert their own cart" ON carts;
-- DROP POLICY IF EXISTS "Users can update their own cart" ON carts;
-- DROP POLICY IF EXISTS "Users can delete their own cart" ON carts;
--
-- -- Restore original policies:
-- CREATE POLICY "Users can view their own cart" ON carts FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can manage their own cart" ON carts FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Users can manage their cart items" ON cart_items FOR ALL USING (
--   EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
-- );
