-- =====================================================
-- Allow Authenticated Users to Insert Products
-- Created: 2026-04-13
-- Description: Allows authenticated users to create products
--              (useful for development/testing)
-- =====================================================

-- Allow authenticated users to insert products
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products"
    ON products
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products"
    ON products
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- To rollback this migration:
-- DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
-- DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
