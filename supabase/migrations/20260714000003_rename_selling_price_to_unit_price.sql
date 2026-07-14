-- Rename selling_price to unit_price in cart_items
-- The codebase expects unit_price but we added selling_price

-- Only rename if selling_price exists and unit_price doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'selling_price'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE cart_items RENAME COLUMN selling_price TO unit_price;
  END IF;
END $$;

COMMENT ON COLUMN cart_items.unit_price IS 'Unit price for the item in euros';
