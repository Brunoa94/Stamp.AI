-- ============================================
-- ADD PRODUCT OF THE MONTH FLAG
-- ============================================
-- Adds a boolean flag to catalog_products to mark a product as the
-- "Product of the Month" for homepage promotion.
-- ============================================

ALTER TABLE catalog_products
ADD COLUMN IF NOT EXISTS is_product_of_month BOOLEAN DEFAULT false;

COMMENT ON COLUMN catalog_products.is_product_of_month IS 'When true, this product is featured as the Product of the Month on the homepage';

-- Ensure only one product can be product of the month at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_products_product_of_month
  ON catalog_products (is_product_of_month)
  WHERE is_product_of_month = true;

-- Set Tote Bag (blueprint 1389) as the initial Product of the Month
UPDATE catalog_products
SET is_product_of_month = true
WHERE blueprint_id = 1389;
