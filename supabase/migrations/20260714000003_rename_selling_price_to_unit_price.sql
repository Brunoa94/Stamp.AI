-- Rename selling_price to unit_price in cart_items
-- The codebase expects unit_price but we added selling_price

ALTER TABLE cart_items
RENAME COLUMN selling_price TO unit_price;

COMMENT ON COLUMN cart_items.unit_price IS 'Unit price for the item in euros';
