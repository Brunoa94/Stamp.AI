-- Add is_selected column to cart_items table
-- Used to persist which items are selected for checkout
-- Defaults to true so all items are selected by default

ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT true NOT NULL;

COMMENT ON COLUMN cart_items.is_selected IS 'Whether the item is selected for checkout';

-- Create function to update selected items for a cart
-- Called when user proceeds to checkout to persist their selection
CREATE OR REPLACE FUNCTION update_cart_items_selection(
  p_cart_id UUID,
  p_selected_item_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set all items in the cart to not selected
  UPDATE cart_items
  SET is_selected = false
  WHERE cart_id = p_cart_id;

  -- Set only the specified items to selected
  UPDATE cart_items
  SET is_selected = true
  WHERE cart_id = p_cart_id
    AND id = ANY(p_selected_item_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_cart_items_selection(UUID, UUID[]) TO authenticated;
