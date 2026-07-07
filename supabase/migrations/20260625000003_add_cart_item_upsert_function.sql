/**
 * Cart Item UPSERT Function
 *
 * Prevents duplicate cart items via atomic UPSERT
 * Handles standard products, custom products, and fully custom products
 */

-- ============================================================================
-- 1. Cart Item Atomic Add/Update
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_cart_item(
  p_cart_id UUID,
  p_product_id TEXT,
  p_variant_id TEXT,
  p_quantity INTEGER,
  p_custom_image_url TEXT DEFAULT NULL,
  p_custom_image_public_id TEXT DEFAULT NULL,
  p_selling_price NUMERIC DEFAULT NULL
)
RETURNS cart_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart_item cart_items;
  v_existing_quantity INTEGER := 0;
BEGIN
  -- For standard products (product_id + variant_id, no custom_image_url)
  IF p_product_id IS NOT NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NULL THEN

    -- Check if item exists
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id = p_product_id
      AND variant_id = p_variant_id
      AND custom_image_url IS NULL;

    IF FOUND THEN
      -- Update existing item quantity
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id = p_product_id
        AND variant_id = p_variant_id
        AND custom_image_url IS NULL
      RETURNING * INTO v_cart_item;
    ELSE
      -- Insert new item
      INSERT INTO cart_items (
        cart_id,
        product_id,
        variant_id,
        quantity,
        custom_image_url,
        custom_image_public_id,
        selling_price,
        product_name,
        created_at,
        updated_at
      ) VALUES (
        p_cart_id,
        p_product_id,
        p_variant_id,
        p_quantity,
        NULL,
        NULL,
        p_selling_price,
        'Product',
        NOW(),
        NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  -- For custom products (product_id + variant_id + custom_image_url)
  ELSIF p_product_id IS NOT NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NOT NULL THEN

    -- Check if item exists
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id = p_product_id
      AND variant_id = p_variant_id
      AND custom_image_url = p_custom_image_url;

    IF FOUND THEN
      -- Update existing item quantity
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id = p_product_id
        AND variant_id = p_variant_id
        AND custom_image_url = p_custom_image_url
      RETURNING * INTO v_cart_item;
    ELSE
      -- Insert new item
      INSERT INTO cart_items (
        cart_id,
        product_id,
        variant_id,
        quantity,
        custom_image_url,
        custom_image_public_id,
        selling_price,
        created_at,
        updated_at
      ) VALUES (
        p_cart_id,
        p_product_id,
        p_variant_id,
        p_quantity,
        p_custom_image_url,
        p_custom_image_public_id,
        p_selling_price,
        NOW(),
        NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  -- For fully custom products (no product_id, has custom_image_url + variant_id)
  ELSIF p_product_id IS NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NOT NULL THEN

    -- Check if item exists
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id IS NULL
      AND variant_id = p_variant_id
      AND custom_image_url = p_custom_image_url;

    IF FOUND THEN
      -- Update existing item quantity
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id IS NULL
        AND variant_id = p_variant_id
        AND custom_image_url = p_custom_image_url
      RETURNING * INTO v_cart_item;
    ELSE
      -- Insert new item
      INSERT INTO cart_items (
        cart_id,
        product_id,
        variant_id,
        quantity,
        custom_image_url,
        custom_image_public_id,
        selling_price,
        created_at,
        updated_at
      ) VALUES (
        p_cart_id,
        NULL,
        p_variant_id,
        p_quantity,
        p_custom_image_url,
        p_custom_image_public_id,
        p_selling_price,
        NOW(),
        NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid cart item parameters: product_id, variant_id, or custom_image_url missing';
  END IF;

  RETURN v_cart_item;
END;
$$;

-- ============================================================================
-- 2. Comments for documentation
-- ============================================================================

