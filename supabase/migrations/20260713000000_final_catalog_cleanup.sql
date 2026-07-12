-- ============================================
-- FINAL CATALOG SCHEMA CLEANUP
-- ============================================
-- Simplifies to 2 tables only:
-- 1. catalog_products - Product metadata (some fields editable by admin)
-- 2. product_variants - Variants with pricing (fully synced)
--
-- Key decisions:
-- - Use blueprint_id as primary key (no UUID)
-- - Protect display_title, is_active, selling_price_cents from sync overwrites
-- - Add min_price_cents computed from variants
-- - Remove all unused columns and tables
-- ============================================

-- ============================================
-- STEP 1: Drop orphaned tables from old system
-- ============================================

-- These tables reference removed foreign keys or are unused
DROP TABLE IF EXISTS catalog_price_history CASCADE;
DROP TABLE IF EXISTS catalog_stock_changes CASCADE;
DROP TABLE IF EXISTS catalog_sync_queue CASCADE;

-- Drop views that reference removed tables
DROP VIEW IF EXISTS price_change_analytics CASCADE;
DROP VIEW IF EXISTS catalog_stock_health CASCADE;
DROP VIEW IF EXISTS recent_stock_changes CASCADE;
DROP VIEW IF EXISTS recent_price_changes CASCADE;
DROP VIEW IF EXISTS catalog_sync_status CASCADE;

-- ============================================
-- STEP 1.5: Unschedule old cron jobs (if pg_cron is available)
-- ============================================

DO $$
BEGIN
  -- Try to unschedule old cron jobs - these are no longer needed
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('process-catalog-queue');
    PERFORM cron.unschedule('daily-price-refresh');
    PERFORM cron.unschedule('stock-availability-check');
    RAISE NOTICE 'Unscheduled old catalog cron jobs';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not unschedule cron jobs: %', SQLERRM;
END $$;

-- ============================================
-- STEP 2: Drop unused functions and triggers
-- ============================================

-- Drop triggers first (they depend on functions)
-- Note: trigger may not exist if table was already dropped
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_calculate_price_change') THEN
    DROP TRIGGER trigger_calculate_price_change ON catalog_price_history;
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Drop all unused functions
DROP FUNCTION IF EXISTS update_product_stock_status(UUID, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS record_price_change(UUID, INTEGER, TEXT, INTEGER, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_products_for_daily_price_update() CASCADE;
DROP FUNCTION IF EXISTS calculate_price_change() CASCADE;
DROP FUNCTION IF EXISTS get_next_product_to_sync() CASCADE;
DROP FUNCTION IF EXISTS update_sync_queue_status(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS trigger_product_sync(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_sync_queue() CASCADE;
DROP FUNCTION IF EXISTS get_variant_price_simple(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_product_with_pricing(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_providers_for_product(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_providers_for_product_with_fallback(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_variant_price(UUID, TEXT, TEXT, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_cheapest_provider(UUID, TEXT, TEXT, TEXT) CASCADE;

-- ============================================
-- STEP 3: Recreate catalog_products with simplified schema
-- ============================================

-- Create new table
CREATE TABLE IF NOT EXISTS catalog_products_new (
  blueprint_id INTEGER PRIMARY KEY,
  display_title TEXT NOT NULL,
  base_image_url TEXT,
  min_price_cents INTEGER DEFAULT 0,
  shipping_cents INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  -- Optional overrides (you edit these)
  selling_price_cents INTEGER,
  original_price_cents INTEGER,
  is_on_sale BOOLEAN DEFAULT false,
  -- Sync metadata
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data from old table
INSERT INTO catalog_products_new (
  blueprint_id,
  display_title,
  base_image_url,
  min_price_cents,
  shipping_cents,
  is_active,
  selling_price_cents,
  original_price_cents,
  is_on_sale,
  created_at,
  updated_at
)
SELECT
  blueprint_id,
  COALESCE(display_title, name, 'Untitled Product'),
  base_image_url,
  0, -- Will be computed after variants migrate
  COALESCE(shipping_cents, 0),
  COALESCE(is_active, false),
  selling_price_cents,
  original_price_cents,
  COALESCE(is_on_sale, false),
  COALESCE(created_at, NOW()),
  COALESCE(updated_at, NOW())
FROM catalog_products
ON CONFLICT (blueprint_id) DO NOTHING;

-- ============================================
-- STEP 4: Recreate product_variants with simplified schema
-- ============================================

-- Create new variants table
CREATE TABLE IF NOT EXISTS product_variants_new (
  blueprint_id INTEGER NOT NULL REFERENCES catalog_products_new(blueprint_id) ON DELETE CASCADE,
  printify_variant_id INTEGER NOT NULL,
  color TEXT,
  size TEXT,
  price_cents INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blueprint_id, printify_variant_id)
);

-- Migrate variants data
INSERT INTO product_variants_new (
  blueprint_id,
  printify_variant_id,
  color,
  size,
  price_cents,
  is_available,
  created_at,
  updated_at
)
SELECT
  cp.blueprint_id,
  pv.printify_variant_id,
  pv.color,
  pv.size,
  COALESCE(pv.price_cents, 0),
  COALESCE(pv.is_available, true),
  COALESCE(pv.created_at, NOW()),
  COALESCE(pv.updated_at, NOW())
FROM product_variants pv
JOIN catalog_products cp ON cp.id = pv.product_id
ON CONFLICT (blueprint_id, printify_variant_id) DO NOTHING;

-- ============================================
-- STEP 5: Drop old tables and rename new ones
-- ============================================

DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS catalog_products CASCADE;

ALTER TABLE catalog_products_new RENAME TO catalog_products;
ALTER TABLE product_variants_new RENAME TO product_variants;

-- ============================================
-- STEP 6: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_variants_blueprint ON product_variants(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_variants_color_size ON product_variants(blueprint_id, color, size);
CREATE INDEX IF NOT EXISTS idx_variants_available ON product_variants(blueprint_id, is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON catalog_products(is_active) WHERE is_active = true;

-- ============================================
-- STEP 7: Update min_price_cents from variants
-- ============================================

UPDATE catalog_products cp
SET min_price_cents = (
  SELECT COALESCE(MIN(pv.price_cents), 0)
  FROM product_variants pv
  WHERE pv.blueprint_id = cp.blueprint_id
    AND pv.is_available = true
    AND pv.price_cents > 0
);

-- ============================================
-- STEP 8: Create helper functions
-- ============================================

-- Check if a specific size is available for a blueprint
CREATE OR REPLACE FUNCTION has_size_available(p_blueprint_id INTEGER, p_size TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM product_variants
    WHERE blueprint_id = p_blueprint_id
      AND size = p_size
      AND is_available = true
      AND price_cents > 0
  );
$$ LANGUAGE sql STABLE;

-- Get variant for a specific color+size
CREATE OR REPLACE FUNCTION get_variant(
  p_blueprint_id INTEGER,
  p_color TEXT,
  p_size TEXT
)
RETURNS TABLE (
  printify_variant_id INTEGER,
  price_cents INTEGER
) AS $$
  SELECT printify_variant_id, price_cents
  FROM product_variants
  WHERE blueprint_id = p_blueprint_id
    AND color = p_color
    AND size = p_size
    AND is_available = true
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get all available colors for a blueprint
CREATE OR REPLACE FUNCTION get_available_colors(p_blueprint_id INTEGER)
RETURNS TEXT[] AS $$
  SELECT ARRAY(
    SELECT DISTINCT color
    FROM product_variants
    WHERE blueprint_id = p_blueprint_id
      AND is_available = true
      AND color IS NOT NULL
    ORDER BY color
  );
$$ LANGUAGE sql STABLE;

-- Get all available sizes for a blueprint + color
CREATE OR REPLACE FUNCTION get_available_sizes(p_blueprint_id INTEGER, p_color TEXT)
RETURNS TEXT[] AS $$
  SELECT ARRAY(
    SELECT size
    FROM (
      SELECT DISTINCT size,
        CASE size
          WHEN 'XS' THEN 1
          WHEN 'S' THEN 2
          WHEN 'M' THEN 3
          WHEN 'L' THEN 4
          WHEN 'XL' THEN 5
          WHEN '2XL' THEN 6
          WHEN '3XL' THEN 7
          WHEN '4XL' THEN 8
          WHEN '5XL' THEN 9
          ELSE 10
        END as sort_order
      FROM product_variants
      WHERE blueprint_id = p_blueprint_id
        AND color = p_color
        AND is_available = true
        AND size IS NOT NULL
    ) sub
    ORDER BY sort_order
  );
$$ LANGUAGE sql STABLE;

-- ============================================
-- STEP 9: RLS Policies
-- ============================================

ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
  ON catalog_products FOR SELECT
  USING (is_active = true);

-- Service role can do everything
CREATE POLICY "Service role full access on products"
  ON catalog_products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone can read available variants
CREATE POLICY "Anyone can read available variants"
  ON product_variants FOR SELECT
  USING (is_available = true);

-- Service role can do everything on variants
CREATE POLICY "Service role full access on variants"
  ON product_variants FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 10: Comments
-- ============================================

COMMENT ON TABLE catalog_products IS 'Product catalog - blueprint_id is primary key. display_title, is_active, selling_price_cents are admin-editable and NOT overwritten by sync.';
COMMENT ON COLUMN catalog_products.blueprint_id IS 'Printify blueprint ID - primary key';
COMMENT ON COLUMN catalog_products.display_title IS 'Admin-editable display name (sync will NOT overwrite if already set)';
COMMENT ON COLUMN catalog_products.min_price_cents IS 'Computed: cheapest available variant price';
COMMENT ON COLUMN catalog_products.is_active IS 'Admin-controlled: whether product is visible (sync will NOT change)';
COMMENT ON COLUMN catalog_products.selling_price_cents IS 'Admin override: if set, shows this price instead of variant price';

COMMENT ON TABLE product_variants IS 'Product variants with embedded pricing. Fully synced from Printify.';
COMMENT ON COLUMN product_variants.printify_variant_id IS 'Required for Printify order API calls';
COMMENT ON COLUMN product_variants.price_cents IS 'Synced from Printify Choice (provider 99)';

COMMENT ON FUNCTION has_size_available IS 'Check if at least one variant has the specified size available';
COMMENT ON FUNCTION get_variant IS 'Get variant details for a specific color+size combination';
COMMENT ON FUNCTION get_available_colors IS 'Get array of available colors for a blueprint';
COMMENT ON FUNCTION get_available_sizes IS 'Get array of available sizes for a blueprint+color, sorted by size order';
