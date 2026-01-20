-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can insert order items for their orders" ON order_items;

-- Allow users to insert order items for their own orders
CREATE POLICY "Users can insert order items for their orders" ON order_items
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
);
