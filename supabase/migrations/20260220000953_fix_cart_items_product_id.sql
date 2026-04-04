-- Migration: Change cart_items.product_id from UUID to TEXT
-- Description: Store Printify product IDs (hex strings) directly in cart_items and order_items
-- This allows us to store products before they're saved to the products table

-- Step 1: Drop the foreign key constraints
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Step 2: Change product_id column type from UUID to TEXT in both tables
ALTER TABLE cart_items ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;
ALTER TABLE order_items ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;

-- Step 3: Update comments for documentation
COMMENT ON COLUMN cart_items.product_id IS 'Printify product ID (hex string format)';
COMMENT ON COLUMN cart_items.variant_id IS 'Printify variant ID (stored as text)';
COMMENT ON COLUMN order_items.product_id IS 'Printify product ID (hex string format)';
COMMENT ON COLUMN order_items.variant_id IS 'Printify variant ID (stored as text)';

-- Step 4: Add product_name column if it doesn't exist (for display purposes)
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Step 5: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id) WHERE product_id IS NOT NULL;

-- Note: We no longer have foreign keys to products table because cart/order items can reference
-- Printify products that haven't been saved to our database yet. The product_id is just
-- a reference string to the Printify product.
