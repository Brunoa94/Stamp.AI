-- Drop design_id from cart_items
-- This column was intended for user_designs feature but is not currently used

-- Drop the foreign key constraint first
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_design_id_fkey;

-- Drop the column
ALTER TABLE cart_items DROP COLUMN IF EXISTS design_id;

COMMENT ON TABLE cart_items IS 'Cart items table - design_id removed as it was unused';
