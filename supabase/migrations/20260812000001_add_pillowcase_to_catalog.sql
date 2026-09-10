/**
 * Add Spun Polyester Square Pillowcase (blueprint 229) and deactivate old pillow (10699)
 *
 * Blueprint 229 has better EU shipping via MWW On Demand ($5.69-$5.79 to Netherlands)
 * compared to the Faux Linen Pillow (10699).
 */

-- Step 1: Deactivate old pillow (10699 - Faux Linen Pillow)
UPDATE catalog_products
SET is_active = false, updated_at = NOW()
WHERE blueprint_id = 10699;

-- Step 2: Insert Spun Polyester Square Pillowcase (or update if it exists)
INSERT INTO catalog_products (
  blueprint_id,
  display_title,
  base_image_url,
  min_price_cents,
  print_provider_id,
  is_active,
  last_synced_at
) VALUES (
  229,
  'Spun Polyester Square Pillowcase',
  NULL,  -- Will be synced from Printify API
  0,     -- Will be synced from Printify API
  99,    -- Printify Choice (auto-selects best provider)
  true,
  NOW()
) ON CONFLICT (blueprint_id) DO UPDATE SET
  display_title = 'Spun Polyester Square Pillowcase',
  is_active = true,
  updated_at = NOW();

-- Note: After applying this migration, run the sync-blueprint edge function
-- with blueprint_id: 229 to populate variants and pricing from Printify API.
