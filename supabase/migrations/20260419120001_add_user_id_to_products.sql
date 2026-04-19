-- Add user_id to products table to track which user created the product

-- Add user_id column
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

COMMENT ON COLUMN products.user_id IS 'The user who created this product';
