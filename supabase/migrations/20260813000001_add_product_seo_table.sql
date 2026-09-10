-- ============================================
-- Product SEO Table
-- ============================================
-- Stores per-product SEO data: the raw description synced from the
-- Printify blueprint plus admin-editable meta overrides. One row per
-- catalog product, keyed by blueprint_id.
--
-- Rows are created automatically by the sync-blueprint edge function
-- and can be backfilled with scripts/backfill-product-seo.ts.

CREATE TABLE IF NOT EXISTS product_seo (
  blueprint_id INTEGER PRIMARY KEY REFERENCES catalog_products(blueprint_id) ON DELETE CASCADE,

  -- Printify source data (raw, may contain HTML)
  printify_description TEXT,

  -- SEO meta fields (admin-editable overrides)
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keep updated_at fresh on every update
DROP TRIGGER IF EXISTS update_product_seo_updated_at ON product_seo;
CREATE TRIGGER update_product_seo_updated_at
  BEFORE UPDATE ON product_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE product_seo ENABLE ROW LEVEL SECURITY;

-- Anyone can read SEO data (public marketing content)
DROP POLICY IF EXISTS "Public read access" ON product_seo;
CREATE POLICY "Public read access"
  ON product_seo FOR SELECT
  USING (true);

-- Service role can do everything (sync function / backfill script)
DROP POLICY IF EXISTS "Service role full access on product_seo" ON product_seo;
CREATE POLICY "Service role full access on product_seo"
  ON product_seo FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE product_seo IS 'Per-product SEO data: Printify description plus admin-editable meta overrides';
COMMENT ON COLUMN product_seo.printify_description IS 'Raw description synced from the Printify blueprint API (may contain HTML)';
COMMENT ON COLUMN product_seo.meta_title IS 'Custom SEO title override (falls back to display_title)';
COMMENT ON COLUMN product_seo.meta_description IS 'Custom meta description override (falls back to printify_description)';
COMMENT ON COLUMN product_seo.meta_keywords IS 'Array of SEO keywords for the product';
