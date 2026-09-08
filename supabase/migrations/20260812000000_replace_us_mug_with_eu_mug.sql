/**
 * Replace Ceramic Mug 11oz (blueprint 1320) with Ceramic Mug EU (blueprint 441),
 * add Spiral Journal EU (blueprint 475), and add Spun Polyester Square Pillowcase (blueprint 229)
 *
 * Reason: The US-based mug (1320) has high shipping costs to EU ($21+ to Netherlands).
 * The EU mug (441) will use EU-based print providers via Printify Choice for lower shipping.
 * The Spiral Journal EU (475) and Pillowcase (229) are new products being added to the catalog.
 */

-- Step 1: Deactivate old US mug
UPDATE catalog_products
SET is_active = false, updated_at = NOW()
WHERE blueprint_id = 1320;

-- Step 2: Deactivate old pillow (10699 - Faux Linen Pillow)
UPDATE catalog_products
SET is_active = false, updated_at = NOW()
WHERE blueprint_id = 10699;

-- Step 3: Insert EU mug (or update if it exists)
INSERT INTO catalog_products (
  blueprint_id,
  display_title,
  base_image_url,
  min_price_cents,
  print_provider_id,
  is_active,
  last_synced_at
) VALUES (
  441,
  'Ceramic Mug EU',
  NULL,  -- Will be synced from Printify API
  0,     -- Will be synced from Printify API
  99,    -- Printify Choice (auto-selects best provider)
  true,
  NOW()
) ON CONFLICT (blueprint_id) DO UPDATE SET
  display_title = 'Ceramic Mug EU',
  is_active = true,
  updated_at = NOW();

-- Step 4: Insert Spiral Journal EU (or update if it exists)
INSERT INTO catalog_products (
  blueprint_id,
  display_title,
  base_image_url,
  min_price_cents,
  print_provider_id,
  is_active,
  last_synced_at
) VALUES (
  475,
  'Spiral Journal EU',
  NULL,  -- Will be synced from Printify API
  0,     -- Will be synced from Printify API
  30,    -- OPT OnDemand (EU provider)
  true,
  NOW()
) ON CONFLICT (blueprint_id) DO UPDATE SET
  display_title = 'Spiral Journal EU',
  is_active = true,
  updated_at = NOW();

-- Step 5: Insert Spun Polyester Square Pillowcase (or update if it exists)
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
-- with blueprint_id: 441, 475, and 229 to populate variants and pricing from Printify API.
