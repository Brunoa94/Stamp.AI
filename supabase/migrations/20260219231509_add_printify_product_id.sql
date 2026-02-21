-- Migration: Add printify_product_id to products table
-- Description: Store the Printify product ID separately from the UUID primary key
-- This allows us to reference Printify products while using proper UUIDs for our database

-- Add printify_product_id column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS printify_product_id TEXT;

-- Create unique index on printify_product_id for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_printify_product_id ON products(printify_product_id) WHERE printify_product_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.printify_product_id IS 'The Printify product ID (hex string format, not UUID)';

-- Note: No rollback section needed - this is a non-breaking additive change
-- If rollback is needed:
-- ALTER TABLE products DROP COLUMN IF EXISTS printify_product_id;
-- DROP INDEX IF EXISTS idx_products_printify_product_id;
