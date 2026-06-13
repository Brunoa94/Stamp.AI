-- =====================================================
-- Migration: Drop products_provider table (legacy system)
-- =====================================================
--
-- The products_provider table was replaced by the provider_catalog system
-- which provides better multi-country support and more comprehensive caching.
--
-- Date: 2026-06-13
-- Reason: Cleanup legacy cache system after successful migration to provider_catalog
--
-- This migration drops:
-- - products_provider table
-- - 4 indexes (idx_products_provider_*)
-- - 2 RLS policies
-- - 1 trigger (update_products_provider_updated_at)
-- =====================================================

-- Drop RLS policies first (if they exist)
DROP POLICY IF EXISTS "Anyone can view non-expired provider products" ON products_provider;
DROP POLICY IF EXISTS "Service role can manage all provider products" ON products_provider;

-- Drop trigger (if it exists)
DROP TRIGGER IF EXISTS update_products_provider_updated_at ON products_provider;

-- Drop indexes explicitly (CASCADE will handle them, but being explicit is clearer)
DROP INDEX IF EXISTS idx_products_provider_country;
DROP INDEX IF EXISTS idx_products_provider_expires;
DROP INDEX IF EXISTS idx_products_provider_rank;
DROP INDEX IF EXISTS idx_products_provider_country_expires;

-- Drop the table with CASCADE to catch any remaining dependencies
DROP TABLE IF EXISTS products_provider CASCADE;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this migration, verify cleanup with:
--   SELECT * FROM pg_tables WHERE tablename = 'products_provider';
--   (Should return 0 rows)
-- =====================================================
