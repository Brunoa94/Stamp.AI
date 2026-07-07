-- =====================================================
-- Drop Analytics and Audit Tables
-- Created: 2026-06-27
-- Description: Removes analytics/audit tables that are not critical to main user flows
-- Tables dropped: catalog_price_history, amount_validation_failures
-- =====================================================

-- =====================================================
-- 1. DROP VIEWS THAT DEPEND ON CATALOG_PRICE_HISTORY
-- =====================================================

DROP VIEW IF EXISTS recent_price_changes CASCADE;
DROP VIEW IF EXISTS price_change_analytics CASCADE;

-- =====================================================
-- 2. DROP FUNCTIONS THAT USE CATALOG_PRICE_HISTORY
-- =====================================================

-- Drop the record_price_change function
DROP FUNCTION IF EXISTS record_price_change(UUID, INTEGER, TEXT, INTEGER, INTEGER, TEXT) CASCADE;

-- Drop the trigger function for calculating price changes
DROP FUNCTION IF EXISTS calculate_price_change() CASCADE;

-- =====================================================
-- 3. DROP CATALOG_PRICE_HISTORY TABLE
-- =====================================================

DROP TABLE IF EXISTS catalog_price_history CASCADE;

-- =====================================================
-- 4. DROP AMOUNT_VALIDATION_FAILURES TABLE
-- =====================================================

DROP TABLE IF EXISTS amount_validation_failures CASCADE;

-- =====================================================
-- 5. DROP RECORD_AMOUNT_VALIDATION_FAILURE FUNCTION (if exists)
-- =====================================================

DROP FUNCTION IF EXISTS record_amount_validation_failure(
  TEXT, TEXT, DECIMAL, TEXT, DECIMAL, DECIMAL,
  UUID, TEXT, TEXT, TEXT, JSONB, TEXT
) CASCADE;

-- =====================================================
-- 6. CLEANUP PERMISSIONS (No-op - CASCADE handles this)
-- =====================================================

-- Note: CASCADE on DROP TABLE/FUNCTION automatically revokes permissions

-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- TABLES DROPPED:
-- 1. catalog_price_history - Tracked price changes for analytics
-- 2. amount_validation_failures - Logged payment amount mismatches
--
-- FUNCTIONS DROPPED:
-- 1. record_price_change() - Recorded price changes
-- 2. calculate_price_change() - Trigger function for price calculations
-- 3. record_amount_validation_failure() - Logged validation failures
--
-- VIEWS DROPPED:
-- 1. recent_price_changes - Price changes from last 7 days
-- 2. price_change_analytics - Daily price change statistics
--
-- IMPACT:
-- - No analytics/reporting on price changes
-- - No audit trail for payment amount mismatches
-- - Main user flows (cart, checkout, payment, fulfillment) NOT affected
-- - sync-catalog function needs update to remove record_price_change() call
-- - daily-price-refresh function needs update to remove price history queries
