-- Store the full Printify blueprint image gallery on catalog_products.
-- base_image_url keeps holding the first image for existing consumers;
-- image_urls holds every image returned by the Printify blueprint API
-- and is populated by the sync-blueprint edge function on the next sync.
ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS image_urls text[];

COMMENT ON COLUMN public.catalog_products.image_urls IS
  'All product photo URLs from the Printify blueprint (images array). First entry matches base_image_url.';
