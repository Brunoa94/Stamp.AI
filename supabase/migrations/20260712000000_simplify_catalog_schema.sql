-- ============================================
-- SIMPLIFY CATALOG SCHEMA
-- ============================================
-- Removes over-engineered multi-provider/multi-country architecture
-- Since we only use Printify Choice (provider 99), we don't need:
-- - print_providers table (just hardcode 99)
-- - product_provider_availability table (redundant)
-- - variant_pricing table (move price directly to product_variants)
-- - user_custom_designs table (never used)
-- - Complex fallback logic (Printify Choice handles this automatically)
-- ============================================

-- 1. Add pricing columns directly to product_variants
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS price_cents INTEGER,
ADD COLUMN IF NOT EXISTS cost_cents INTEGER,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 2. Migrate pricing data from variant_pricing to product_variants
-- Use Printify Choice (provider 99) pricing, fallback to any available pricing
UPDATE product_variants pv
SET
  price_cents = vp.price_cents,
  cost_cents = vp.cost_cents,
  is_available = vp.is_available
FROM variant_pricing vp
WHERE vp.variant_id = pv.id
  AND vp.print_provider_id = 99;

-- For variants without provider 99 pricing, use any available pricing
UPDATE product_variants pv
SET
  price_cents = vp.price_cents,
  cost_cents = vp.cost_cents,
  is_available = vp.is_available
FROM (
  SELECT DISTINCT ON (variant_id)
    variant_id, price_cents, cost_cents, is_available
  FROM variant_pricing
  WHERE is_available = true
  ORDER BY variant_id, print_provider_id
) vp
WHERE vp.variant_id = pv.id
  AND pv.price_cents IS NULL;

-- 3. Add shipping_cents to catalog_products (product-level shipping)
ALTER TABLE catalog_products
ADD COLUMN IF NOT EXISTS shipping_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'EUR';

-- Migrate shipping from product_provider_availability
UPDATE catalog_products cp
SET
  shipping_cents = ppa.shipping_cost_cents,
  currency_code = ppa.currency_code
FROM product_provider_availability ppa
WHERE ppa.product_id = cp.id
  AND ppa.print_provider_id = 99
  AND ppa.country_code = 'NL';

-- Fallback: use any available shipping data
UPDATE catalog_products cp
SET
  shipping_cents = ppa.shipping_cost_cents,
  currency_code = COALESCE(ppa.currency_code, 'EUR')
FROM (
  SELECT DISTINCT ON (product_id)
    product_id, shipping_cost_cents, currency_code
  FROM product_provider_availability
  WHERE is_available = true
  ORDER BY product_id,
    CASE WHEN country_code = 'NL' THEN 0 ELSE 1 END,
    print_provider_id
) ppa
WHERE ppa.product_id = cp.id
  AND cp.shipping_cents IS NULL OR cp.shipping_cents = 0;

-- 4. Drop the redundant tables
DROP TABLE IF EXISTS user_custom_designs CASCADE;
DROP TABLE IF EXISTS variant_pricing CASCADE;
DROP TABLE IF EXISTS product_provider_availability CASCADE;
DROP TABLE IF EXISTS print_providers CASCADE;

-- 5. Drop old RPC functions that referenced removed tables
DROP FUNCTION IF EXISTS get_providers_for_product(UUID, TEXT);
DROP FUNCTION IF EXISTS get_providers_for_product_with_fallback(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_variant_price(UUID, TEXT, TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS get_cheapest_provider(UUID, TEXT, TEXT, TEXT);

-- 6. Create simplified RPC functions

-- Get variant price (simplified - no provider/country needed)
CREATE OR REPLACE FUNCTION get_variant_price_simple(
  p_product_id UUID,
  p_color TEXT,
  p_size TEXT
)
RETURNS TABLE (
  variant_id UUID,
  color TEXT,
  size TEXT,
  title TEXT,
  price_cents INTEGER,
  cost_cents INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.id AS variant_id,
    pv.color,
    pv.size,
    pv.title,
    pv.price_cents,
    pv.cost_cents
  FROM product_variants pv
  WHERE pv.product_id = p_product_id
    AND pv.color = p_color
    AND pv.size = p_size
    AND pv.is_available = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get product with pricing info
CREATE OR REPLACE FUNCTION get_product_with_pricing(
  p_product_id UUID
)
RETURNS TABLE (
  id UUID,
  blueprint_id INTEGER,
  name TEXT,
  description TEXT,
  base_image_url TEXT,
  shipping_cents INTEGER,
  currency_code TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.blueprint_id,
    cp.name,
    cp.description,
    cp.base_image_url,
    cp.shipping_cents,
    cp.currency_code,
    cp.is_active
  FROM catalog_products cp
  WHERE cp.id = p_product_id
    AND cp.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 7. Create index for faster variant lookups
CREATE INDEX IF NOT EXISTS idx_variants_available
  ON product_variants(product_id, color, size)
  WHERE is_available = true;

-- 8. Add NOT NULL constraints now that data is migrated
-- (Only if we have data - skip if columns are still null)
DO $$
BEGIN
  -- Check if we have any variants with pricing
  IF EXISTS (SELECT 1 FROM product_variants WHERE price_cents IS NOT NULL LIMIT 1) THEN
    -- Set defaults for any remaining nulls
    UPDATE product_variants SET price_cents = 0 WHERE price_cents IS NULL;
    UPDATE product_variants SET cost_cents = 0 WHERE cost_cents IS NULL;
  END IF;
END $$;

-- 9. Update RLS policies for simplified schema
-- (The existing policies should still work since we're not changing auth logic)

COMMENT ON TABLE catalog_products IS 'Product catalog - simplified, single provider (Printify Choice)';
COMMENT ON TABLE product_variants IS 'Product variants with embedded pricing (no separate pricing table)';
COMMENT ON COLUMN product_variants.price_cents IS 'Selling price in cents (from Printify Choice)';
COMMENT ON COLUMN product_variants.cost_cents IS 'Cost price in cents (what we pay Printify)';
COMMENT ON COLUMN catalog_products.shipping_cents IS 'Shipping cost in cents (Printify Choice)';
