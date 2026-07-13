-- Fix upsert_cart_item function to match frontend parameter names
-- Frontend sends: p_product_name, p_unit_price
-- Function expected: p_selling_price (and hardcoded 'Product' for name)

-- Drop the old function with old parameter signature
DROP FUNCTION IF EXISTS public.upsert_cart_item(uuid, text, text, integer, text, text, numeric);

CREATE OR REPLACE FUNCTION public.upsert_cart_item(
  p_cart_id uuid,
  p_product_id text,
  p_variant_id text,
  p_quantity integer,
  p_custom_image_url text DEFAULT NULL::text,
  p_custom_image_public_id text DEFAULT NULL::text,
  p_product_name text DEFAULT 'Product'::text,
  p_unit_price numeric DEFAULT NULL::numeric
)
RETURNS cart_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
        unit_price,
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
        p_unit_price,
        p_product_name,
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
        unit_price,
        product_name,
        created_at,
        updated_at
      ) VALUES (
        p_cart_id,
        p_product_id,
        p_variant_id,
        p_quantity,
        p_custom_image_url,
        p_custom_image_public_id,
        p_unit_price,
        p_product_name,
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
        unit_price,
        product_name,
        created_at,
        updated_at
      ) VALUES (
        p_cart_id,
        NULL,
        p_variant_id,
        p_quantity,
        p_custom_image_url,
        p_custom_image_public_id,
        p_unit_price,
        p_product_name,
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
$function$;

COMMENT ON FUNCTION public.upsert_cart_item IS
  'Atomic upsert for cart items. Accepts p_product_name and p_unit_price from frontend.';
