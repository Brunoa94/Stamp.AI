-- Add print_provider_id column to catalog_products
-- Each product can use a different Printify print provider

ALTER TABLE catalog_products
ADD COLUMN IF NOT EXISTS print_provider_id INTEGER NOT NULL DEFAULT 99;

COMMENT ON COLUMN catalog_products.print_provider_id IS 'Printify print provider ID (default 99 = Printify Choice)';

-- Re-activate blueprint 1389 (Tote Bag) - we'll find the right provider
UPDATE catalog_products SET is_active = true WHERE blueprint_id = 1389;
