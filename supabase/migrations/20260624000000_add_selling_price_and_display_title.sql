-- Add Selling Price and Display Title to Products
--
-- Adds fields for customer-facing pricing and product titles
-- separate from internal Printify data

-- Add selling price fields to catalog_products
ALTER TABLE catalog_products
ADD COLUMN IF NOT EXISTS display_title TEXT,
ADD COLUMN IF NOT EXISTS selling_price_cents INTEGER,
ADD COLUMN IF NOT EXISTS original_price_cents INTEGER,
ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN catalog_products.display_title IS 'Customer-facing product title (e.g., "Men''s T-shirt Stretch")';
COMMENT ON COLUMN catalog_products.selling_price_cents IS 'Current selling price in cents (e.g., 1800 for €18)';
COMMENT ON COLUMN catalog_products.original_price_cents IS 'Original price before discount in cents (e.g., 2000 for €20)';
COMMENT ON COLUMN catalog_products.is_on_sale IS 'Whether product is currently on sale';
COMMENT ON COLUMN catalog_products.is_featured IS 'Whether to display product on homepage';

-- Set initial values for featured products
-- Blueprint 26: Men's Lightweight Fashion Tee → Men's T-shirt Stretch (€18, was €20)
UPDATE catalog_products
SET
  display_title = 'Men''s T-shirt Stretch',
  selling_price_cents = 1800,
  original_price_cents = 2000,
  is_on_sale = true,
  is_featured = true
WHERE blueprint_id = 26;

-- Blueprint 6: Unisex Heavy Cotton Tee → T-shirt Premium Cotton (€20, was €25)
UPDATE catalog_products
SET
  display_title = 'T-shirt Premium Cotton',
  selling_price_cents = 2000,
  original_price_cents = 2500,
  is_on_sale = true,
  is_featured = true
WHERE blueprint_id = 6;

-- Blueprint 145: Unisex Softstyle T-Shirt → T-shirt Regular (€16, was €20)
UPDATE catalog_products
SET
  display_title = 'T-shirt Regular',
  selling_price_cents = 1600,
  original_price_cents = 2000,
  is_on_sale = true,
  is_featured = true
WHERE blueprint_id = 145;

-- Blueprint 1389: Tote Bag (AOP) → Tote Bag (€20, was €25)
UPDATE catalog_products
SET
  display_title = 'Tote Bag',
  selling_price_cents = 2000,
  original_price_cents = 2500,
  is_on_sale = true,
  is_featured = true
WHERE blueprint_id = 1389;

-- Create index for featured products query
CREATE INDEX IF NOT EXISTS idx_catalog_products_featured
ON catalog_products(is_featured)
WHERE is_featured = true;
