-- =====================================================
-- Add printify_order_id column to orders table
-- =====================================================
-- This column stores the Printify order ID after the order
-- is successfully created in Printify

ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_order_id TEXT;

-- Add an index for faster lookups by Printify order ID
CREATE INDEX IF NOT EXISTS idx_orders_printify_order_id ON orders(printify_order_id);

-- Add a comment explaining the column
COMMENT ON COLUMN orders.printify_order_id IS 'The Printify order ID returned after successfully creating the order in Printify';
