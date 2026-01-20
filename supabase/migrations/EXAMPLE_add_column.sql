-- =====================================================
-- EXAMPLE MIGRATION: Add Column to Orders Table
-- =====================================================
-- This is an EXAMPLE file showing how to add a new column
-- Rename this file with a timestamp to apply it:
-- mv EXAMPLE_add_column.sql $(date +%Y%m%d%H%M%S)_add_printify_product_id.sql
-- =====================================================

-- Add printify_product_id column to store the Printify product ID
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_product_id TEXT;

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_printify_product_id ON orders(printify_product_id);

-- Add a comment explaining the column
COMMENT ON COLUMN orders.printify_product_id IS 'The Printify product ID associated with this order';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- To rollback this migration, create a new file with:
-- ALTER TABLE orders DROP COLUMN IF EXISTS printify_product_id;
-- DROP INDEX IF EXISTS idx_orders_printify_product_id;
