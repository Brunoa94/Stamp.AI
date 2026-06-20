-- Drop external_order_id column from order_items
-- This column was never used in the application logic

-- Drop the column if it exists
ALTER TABLE order_items DROP COLUMN IF EXISTS external_order_id;

COMMENT ON TABLE order_items IS 'Order items table - external_order_id removed as it was unused';
