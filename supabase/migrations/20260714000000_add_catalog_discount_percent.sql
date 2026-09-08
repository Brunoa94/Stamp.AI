-- Add discount_percent column to catalog_products
-- Allows displaying a discount badge on product cards

ALTER TABLE catalog_products
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT NULL;

COMMENT ON COLUMN catalog_products.discount_percent IS
  'Discount percentage (e.g., 20 for 20% off). When set, UI displays a discount badge.';
