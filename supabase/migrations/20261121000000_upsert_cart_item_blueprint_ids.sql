-- =====================================================
-- upsert_cart_item: store the Printify blueprint and print provider
-- =====================================================
-- cart_items.printify_blueprint_id / printify_print_provider_id exist but the
-- RPC never wrote them, so every account-cart row had NULL. The cart needs the
-- blueprint to show the product title in the visitor's language.
--
-- Both parameters are optional (DEFAULT NULL), so a client that doesn't send
-- them keeps working. Inserts write them; quantity merges only fill them when
-- the stored value is NULL, so an existing row's values never change. Rows
-- created before this migration keep NULL and show their stored English name.
--
-- The old 8-argument signature is dropped so PostgREST has one function to
-- resolve, and the hardening from 20261012000000_close_launch_authorization_gaps
-- (SECURITY INVOKER, fixed search_path, no anon access) is reapplied.

DROP FUNCTION IF EXISTS public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC);

CREATE FUNCTION public.upsert_cart_item(
  p_cart_id uuid,
  p_product_id text,
  p_variant_id text,
  p_quantity integer,
  p_custom_image_url text DEFAULT NULL::text,
  p_custom_image_public_id text DEFAULT NULL::text,
  p_product_name text DEFAULT 'Product'::text,
  p_unit_price numeric DEFAULT NULL::numeric,
  p_printify_blueprint_id integer DEFAULT NULL::integer,
  p_printify_print_provider_id integer DEFAULT NULL::integer
)
RETURNS cart_items
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_cart_item cart_items;
  v_existing_quantity INTEGER := 0;
  v_custom_image_hash TEXT := NULL;
BEGIN
  -- Compute hash if custom_image_url is provided
  IF p_custom_image_url IS NOT NULL THEN
    v_custom_image_hash := MD5(p_custom_image_url);
  END IF;

  -- For standard products (product_id + variant_id, no custom_image_url)
  IF p_product_id IS NOT NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NULL THEN

    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id = p_product_id
      AND variant_id = p_variant_id
      AND custom_image_url IS NULL;

    IF FOUND THEN
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        printify_blueprint_id = COALESCE(printify_blueprint_id, p_printify_blueprint_id),
        printify_print_provider_id = COALESCE(printify_print_provider_id, p_printify_print_provider_id),
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id = p_product_id
        AND variant_id = p_variant_id
        AND custom_image_url IS NULL
      RETURNING * INTO v_cart_item;
    ELSE
      INSERT INTO cart_items (
        cart_id, product_id, variant_id, quantity,
        custom_image_url, custom_image_public_id, custom_image_hash,
        unit_price, product_name,
        printify_blueprint_id, printify_print_provider_id,
        created_at, updated_at
      ) VALUES (
        p_cart_id, p_product_id, p_variant_id, p_quantity,
        NULL, NULL, NULL,
        p_unit_price, p_product_name,
        p_printify_blueprint_id, p_printify_print_provider_id,
        NOW(), NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  -- For custom products (product_id + variant_id + custom_image_url)
  ELSIF p_product_id IS NOT NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NOT NULL THEN

    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id = p_product_id
      AND variant_id = p_variant_id
      AND custom_image_hash = v_custom_image_hash;

    IF FOUND THEN
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        printify_blueprint_id = COALESCE(printify_blueprint_id, p_printify_blueprint_id),
        printify_print_provider_id = COALESCE(printify_print_provider_id, p_printify_print_provider_id),
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id = p_product_id
        AND variant_id = p_variant_id
        AND custom_image_hash = v_custom_image_hash
      RETURNING * INTO v_cart_item;
    ELSE
      INSERT INTO cart_items (
        cart_id, product_id, variant_id, quantity,
        custom_image_url, custom_image_public_id, custom_image_hash,
        unit_price, product_name,
        printify_blueprint_id, printify_print_provider_id,
        created_at, updated_at
      ) VALUES (
        p_cart_id, p_product_id, p_variant_id, p_quantity,
        p_custom_image_url, p_custom_image_public_id, v_custom_image_hash,
        p_unit_price, p_product_name,
        p_printify_blueprint_id, p_printify_print_provider_id,
        NOW(), NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  -- For fully custom products (no product_id, has custom_image_url + variant_id)
  ELSIF p_product_id IS NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NOT NULL THEN

    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id IS NULL
      AND variant_id = p_variant_id
      AND custom_image_hash = v_custom_image_hash;

    IF FOUND THEN
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        printify_blueprint_id = COALESCE(printify_blueprint_id, p_printify_blueprint_id),
        printify_print_provider_id = COALESCE(printify_print_provider_id, p_printify_print_provider_id),
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id IS NULL
        AND variant_id = p_variant_id
        AND custom_image_hash = v_custom_image_hash
      RETURNING * INTO v_cart_item;
    ELSE
      INSERT INTO cart_items (
        cart_id, product_id, variant_id, quantity,
        custom_image_url, custom_image_public_id, custom_image_hash,
        unit_price, product_name,
        printify_blueprint_id, printify_print_provider_id,
        created_at, updated_at
      ) VALUES (
        p_cart_id, NULL, p_variant_id, p_quantity,
        p_custom_image_url, p_custom_image_public_id, v_custom_image_hash,
        p_unit_price, p_product_name,
        p_printify_blueprint_id, p_printify_print_provider_id,
        NOW(), NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid cart item parameters: product_id, variant_id, or custom_image_url missing';
  END IF;

  RETURN v_cart_item;
END;
$function$;

COMMENT ON FUNCTION public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC, INTEGER, INTEGER) IS
  'Atomic upsert for cart items. Uses MD5 hash for custom_image_url comparison to avoid index size limits. Stores the Printify blueprint and print provider so the cart can show translated titles.';

REVOKE ALL ON FUNCTION public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC, INTEGER, INTEGER)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC, INTEGER, INTEGER)
  TO authenticated, service_role;
