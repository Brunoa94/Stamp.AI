-- Drop design_id from order_items
-- This column was intended for user_designs feature but is not currently used

-- Drop the foreign key constraint first
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_design_id_fkey;

-- Drop the column
ALTER TABLE order_items DROP COLUMN IF EXISTS design_id;

COMMENT ON TABLE order_items IS 'Order items table - design_id removed as it was unused';
