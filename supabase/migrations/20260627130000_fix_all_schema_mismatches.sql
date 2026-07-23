-- Fix All Schema Mismatches
-- Created: 2026-06-27
-- Description: Adds all missing columns discovered through integration testing

-- ============================================================================
-- 1. Fix cart_items table
-- ============================================================================
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS variant_name TEXT,
ADD COLUMN IF NOT EXISTS printify_blueprint_id INTEGER,
ADD COLUMN IF NOT EXISTS printify_print_provider_id INTEGER;

COMMENT ON COLUMN cart_items.variant_name IS 'Human-readable variant description (e.g., "M / Black")';
COMMENT ON COLUMN cart_items.printify_blueprint_id IS 'Printify product template ID';
COMMENT ON COLUMN cart_items.printify_print_provider_id IS 'Printify print provider ID';

-- ============================================================================
-- 2. Fix order_items table
-- ============================================================================
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS variant_id TEXT,
ADD COLUMN IF NOT EXISTS variant_name TEXT,
ADD COLUMN IF NOT EXISTS unit_price INTEGER,  -- Stored in cents
ADD COLUMN IF NOT EXISTS total_price INTEGER;  -- Stored in cents

COMMENT ON COLUMN order_items.variant_id IS 'Product variant identifier';
COMMENT ON COLUMN order_items.variant_name IS 'Variant description (e.g., "M / Black")';
COMMENT ON COLUMN order_items.unit_price IS 'Price per item in cents';
COMMENT ON COLUMN order_items.total_price IS 'Total for line item in cents (unit_price * quantity)';

-- ============================================================================
-- 3. Fix carts table
-- ============================================================================
ALTER TABLE carts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add check constraint for cart status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_status_check'
  ) THEN
    ALTER TABLE carts
    ADD CONSTRAINT cart_status_check
    CHECK (status IN ('active', 'abandoned', 'converted'));
  END IF;
END $$;

COMMENT ON COLUMN carts.status IS 'Cart status: active, abandoned, or converted';

-- ============================================================================
-- 4. Update existing data with defaults
-- ============================================================================

-- Set default status for existing carts
UPDATE carts SET status = 'active' WHERE status IS NULL;

-- Note: For order_items, total_price should be calculated as unit_price * quantity
-- But we don't have unit_price data for existing rows, so we leave them NULL
-- New orders will have these fields populated correctly
