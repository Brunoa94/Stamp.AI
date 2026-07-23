-- Add new products to catalog: Sublimation Crew Socks EU and Faux Linen Pillow
-- Blueprint IDs from Printify:
-- 496: Sublimation Crew Socks (EU) - Generic Brand
-- 10699: Faux Linen Pillow - Generic Brand
--
-- IMPORTANT: After applying this migration, run the sync-blueprint Edge Function
-- for each product to fetch images and variants from Printify:
--
-- curl -X POST https://<SUPABASE_URL>/functions/v1/sync-blueprint \
--   -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
--   -H "Content-Type: application/json" \
--   -d '{"blueprint_id": 496}'
--
-- curl -X POST https://<SUPABASE_URL>/functions/v1/sync-blueprint \
--   -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
--   -H "Content-Type: application/json" \
--   -d '{"blueprint_id": 10699}'

-- Insert Sublimation Crew Socks EU (blueprint 496)
INSERT INTO catalog_products (
  blueprint_id,
  display_title,
  base_image_url,
  min_price_cents,
  shipping_cents,
  is_active,
  print_provider_id,
  selling_price_cents,
  original_price_cents,
  is_on_sale
) VALUES (
  496,
  'Sublimation Crew Socks',
  'https://images.printify.com/66d5c59bb168767454063216',
  1200,  -- €12 min price
  400,   -- €4 shipping
  true,
  26,    -- Textildruck Europa (only provider for this blueprint)
  1500,  -- €15 selling price
  1800,  -- €18 original price
  true   -- On sale
) ON CONFLICT (blueprint_id) DO UPDATE SET
  is_active = true,
  display_title = COALESCE(catalog_products.display_title, EXCLUDED.display_title),
  min_price_cents = COALESCE(catalog_products.min_price_cents, EXCLUDED.min_price_cents),
  shipping_cents = COALESCE(catalog_products.shipping_cents, EXCLUDED.shipping_cents),
  selling_price_cents = COALESCE(catalog_products.selling_price_cents, EXCLUDED.selling_price_cents),
  original_price_cents = COALESCE(catalog_products.original_price_cents, EXCLUDED.original_price_cents),
  is_on_sale = COALESCE(catalog_products.is_on_sale, EXCLUDED.is_on_sale);

-- Insert Faux Linen Pillow (blueprint 10699)
INSERT INTO catalog_products (
  blueprint_id,
  display_title,
  base_image_url,
  min_price_cents,
  shipping_cents,
  is_active,
  print_provider_id,
  selling_price_cents,
  original_price_cents,
  is_on_sale
) VALUES (
  10699,
  'Faux Linen Pillow',
  'https://images.printify.com/6a352df19fef6b6ab10733d1',
  1800,  -- €18 min price
  500,   -- €5 shipping
  true,
  10,    -- MWW On Demand (only provider for this blueprint)
  2200,  -- €22 selling price
  2800,  -- €28 original price
  true   -- On sale
) ON CONFLICT (blueprint_id) DO UPDATE SET
  is_active = true,
  display_title = COALESCE(catalog_products.display_title, EXCLUDED.display_title),
  min_price_cents = COALESCE(catalog_products.min_price_cents, EXCLUDED.min_price_cents),
  shipping_cents = COALESCE(catalog_products.shipping_cents, EXCLUDED.shipping_cents),
  selling_price_cents = COALESCE(catalog_products.selling_price_cents, EXCLUDED.selling_price_cents),
  original_price_cents = COALESCE(catalog_products.original_price_cents, EXCLUDED.original_price_cents),
  is_on_sale = COALESCE(catalog_products.is_on_sale, EXCLUDED.is_on_sale);

-- Note: Variants will be populated by the sync-blueprint Edge Function.
-- The function fetches all variant data (colors, sizes, prices) from Printify
-- and inserts them into the product_variants table automatically.
