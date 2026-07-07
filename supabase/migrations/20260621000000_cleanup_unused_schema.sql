-- =====================================================
-- CLEANUP MIGRATION: Remove Unused Tables and Columns
-- =====================================================
-- Date: 2026-06-21
-- Description: Removes deprecated tables and columns after catalog-first architecture migration
-- Author: Generated via Claude Code
--
-- This migration removes:
-- 1. provider_catalog table (replaced by catalog_products + related tables)
-- 2. product_categories table (unused)
-- 3. product_images table (images now in catalog_products.base_image_url)
-- 4. user_designs table (replaced by cart_items/order_items custom_image_url)
-- 5. Unused columns from products, orders, cart_items, order_items
-- =====================================================

-- =====================================================
-- STEP 1: Drop RPC Functions (provider_catalog related)
-- =====================================================

DROP FUNCTION IF EXISTS get_providers_for_blueprint(INTEGER);
DROP FUNCTION IF EXISTS has_valid_catalog_cache(INTEGER[]);
DROP FUNCTION IF EXISTS get_best_provider_for_country(INTEGER, TEXT);

-- =====================================================
-- STEP 2: Drop Deprecated Tables
-- =====================================================

-- Drop provider_catalog table (replaced by new catalog schema)
DROP TABLE IF EXISTS provider_catalog CASCADE;

-- Drop product_categories table (unused)
DROP TABLE IF EXISTS product_categories CASCADE;

-- Drop product_images table (images now in catalog_products)
DROP TABLE IF EXISTS product_images CASCADE;

-- Drop user_designs table (design data now in cart_items/order_items)
-- NOTE: This will fail if there are foreign key references or data
-- If you need to preserve data, export it first before running this migration
DROP TABLE IF EXISTS user_designs CASCADE;

-- =====================================================
-- STEP 3: Drop Unused Columns from products
-- =====================================================

-- Remove pricing columns (now in catalog tables)
ALTER TABLE products DROP COLUMN IF EXISTS base_price;
ALTER TABLE products DROP COLUMN IF EXISTS currency;

-- Remove unused organizational columns
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
ALTER TABLE products DROP COLUMN IF EXISTS is_featured;
ALTER TABLE products DROP COLUMN IF EXISTS slug;

-- =====================================================
-- STEP 4: Drop Unused Columns from orders
-- =====================================================

-- Remove unused pricing breakdown columns
ALTER TABLE orders DROP COLUMN IF EXISTS subtotal;
ALTER TABLE orders DROP COLUMN IF EXISTS tax_amount;
ALTER TABLE orders DROP COLUMN IF EXISTS discount_amount;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_cost;

-- Remove unused customer information columns
ALTER TABLE orders DROP COLUMN IF EXISTS customer_name;
ALTER TABLE orders DROP COLUMN IF EXISTS customer_phone;
ALTER TABLE orders DROP COLUMN IF EXISTS customer_notes;
ALTER TABLE orders DROP COLUMN IF EXISTS internal_notes;

-- Remove unused address columns
ALTER TABLE orders DROP COLUMN IF EXISTS billing_address;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address;
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_method;

-- Remove unused fulfillment tracking columns
ALTER TABLE orders DROP COLUMN IF EXISTS shipped_at;
ALTER TABLE orders DROP COLUMN IF EXISTS delivered_at;

-- =====================================================
-- STEP 5: Drop Unused Columns from cart_items
-- =====================================================

-- Remove unused pricing column (pricing comes from catalog)
ALTER TABLE cart_items DROP COLUMN IF EXISTS unit_price;

-- Remove unused variant_id (not currently used in cart service)
-- UNCOMMENT if you're certain you won't need variant selection in cart
-- ALTER TABLE cart_items DROP COLUMN IF EXISTS variant_id;

-- =====================================================
-- STEP 6: Drop Unused Columns from order_items
-- =====================================================

-- Remove unused variant columns
ALTER TABLE order_items DROP COLUMN IF EXISTS variant_id;
ALTER TABLE order_items DROP COLUMN IF EXISTS variant_name;

-- Remove unused pricing columns (pricing tracked at order level)
ALTER TABLE order_items DROP COLUMN IF EXISTS total_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS unit_price;

-- =====================================================
-- STEP 7: Drop Unused Indexes
-- =====================================================

-- Drop indexes that referenced deleted columns or tables
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_is_featured;
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_product_images_product_id;
DROP INDEX IF EXISTS idx_user_designs_user_id;
DROP INDEX IF EXISTS idx_user_designs_product_id;
DROP INDEX IF EXISTS idx_user_designs_is_favorite;
DROP INDEX IF EXISTS idx_user_designs_created_at;
DROP INDEX IF EXISTS idx_cart_items_product_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_order_items_design_id;
DROP INDEX IF EXISTS idx_orders_fulfillment_status;
DROP INDEX IF EXISTS idx_provider_catalog_blueprint;
DROP INDEX IF EXISTS idx_provider_catalog_provider;
DROP INDEX IF EXISTS idx_provider_catalog_expires;
DROP INDEX IF EXISTS idx_provider_catalog_blueprint_valid;
DROP INDEX IF EXISTS idx_provider_catalog_metadata;

-- =====================================================
-- STEP 8: Drop Triggers for Deleted Tables
-- =====================================================

-- Only drop triggers if the tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'product_categories') THEN
        DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_designs') THEN
        DROP TRIGGER IF EXISTS update_user_designs_updated_at ON user_designs;
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after migration to verify cleanup:
--
-- -- Check remaining tables
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
--
-- -- Check remaining columns in products
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'products' AND table_schema = 'public';
--
-- -- Check remaining columns in orders
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'orders' AND table_schema = 'public';
--
-- -- Check remaining columns in cart_items
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'cart_items' AND table_schema = 'public';
--
-- -- Check remaining columns in order_items
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'order_items' AND table_schema = 'public';
-- =====================================================
