-- Add missing columns to cart_items table
-- Required by upsert_cart_item function

ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS custom_image_public_id TEXT DEFAULT NULL;

ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT NULL;

COMMENT ON COLUMN cart_items.custom_image_public_id IS 'Cloudinary public ID for the custom image';
COMMENT ON COLUMN cart_items.selling_price IS 'Unit price for the item in euros';
