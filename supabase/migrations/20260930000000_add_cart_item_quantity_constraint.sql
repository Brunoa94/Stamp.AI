-- ============================================================================
-- Cart Item Quantity Validation
-- Enforce quantity range 1-99 at the database level
-- ============================================================================

-- Add check constraint to enforce valid quantity range (1-99, integers only)
-- The constraint name includes the table for clarity
ALTER TABLE cart_items
ADD CONSTRAINT cart_items_quantity_valid_range
CHECK (quantity >= 1 AND quantity <= 99);

-- Also add a similar constraint to order_items for consistency
ALTER TABLE order_items
ADD CONSTRAINT order_items_quantity_valid_range
CHECK (quantity >= 1 AND quantity <= 99);

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON CONSTRAINT cart_items_quantity_valid_range ON cart_items IS
  'Enforces valid item quantity range: minimum 1, maximum 99';
COMMENT ON CONSTRAINT order_items_quantity_valid_range ON order_items IS
  'Enforces valid item quantity range: minimum 1, maximum 99';
