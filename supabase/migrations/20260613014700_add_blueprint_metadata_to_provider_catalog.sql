-- Add blueprint metadata columns to provider_catalog table
-- This enhancement stores blueprint information directly in the catalog
-- to eliminate separate API calls for blueprint metadata

ALTER TABLE provider_catalog
  ADD COLUMN IF NOT EXISTS blueprint_title TEXT,
  ADD COLUMN IF NOT EXISTS blueprint_brand TEXT,
  ADD COLUMN IF NOT EXISTS blueprint_model TEXT,
  ADD COLUMN IF NOT EXISTS blueprint_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS blueprint_print_areas JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN provider_catalog.blueprint_title IS 'Blueprint product name (e.g., "Unisex Heavy Cotton Tee")';
COMMENT ON COLUMN provider_catalog.blueprint_brand IS 'Blueprint brand (e.g., "Bella+Canvas", "Gildan")';
COMMENT ON COLUMN provider_catalog.blueprint_model IS 'Blueprint model number (e.g., "3001", "5000")';
COMMENT ON COLUMN provider_catalog.blueprint_images IS 'Array of blueprint image URLs';
COMMENT ON COLUMN provider_catalog.blueprint_print_areas IS 'Array of print area specifications with position, width, and height';

-- This migration is backwards compatible:
-- - All columns are nullable
-- - All columns have safe defaults for JSONB types
-- - Existing queries will continue to work
-- - New columns will be populated by the updated fetch-provider-catalog Edge Function
