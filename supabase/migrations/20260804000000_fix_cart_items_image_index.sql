-- Fix cart_items indexes that include custom_image_url
-- Problem: Base64 images stored in custom_image_url can exceed PostgreSQL's
-- B-tree index row size limit of 8191 bytes (error 54000)
--
-- Solution: Add a hash column for the custom_image_url and index that instead.
-- The hash is computed using MD5 which produces a fixed 32-character string.

-- ============================================================================
-- 1. Drop the problematic indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_cart_items_custom_unique;
DROP INDEX IF EXISTS idx_cart_items_fully_custom_unique;

-- ============================================================================
-- 2. Add a hash column for custom_image_url
-- ============================================================================

ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS custom_image_hash TEXT;

COMMENT ON COLUMN cart_items.custom_image_hash IS 'MD5 hash of custom_image_url for indexing (avoids 8KB index limit)';

-- ============================================================================
-- 3. Create a function to compute and set the hash automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION compute_custom_image_hash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_image_url IS NOT NULL THEN
    NEW.custom_image_hash := MD5(NEW.custom_image_url);
  ELSE
    NEW.custom_image_hash := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Create trigger to auto-compute hash on insert/update
-- ============================================================================

DROP TRIGGER IF EXISTS tr_cart_items_compute_image_hash ON cart_items;

CREATE TRIGGER tr_cart_items_compute_image_hash
BEFORE INSERT OR UPDATE OF custom_image_url ON cart_items
FOR EACH ROW
EXECUTE FUNCTION compute_custom_image_hash();

-- ============================================================================
-- 5. Backfill existing rows with hash values
-- ============================================================================

UPDATE cart_items
SET custom_image_hash = MD5(custom_image_url)
WHERE custom_image_url IS NOT NULL
  AND custom_image_hash IS NULL;

-- ============================================================================
-- 6. Create new indexes using the hash column instead
-- ============================================================================

-- Add unique constraint for custom products (with custom image)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_custom_unique
ON cart_items(cart_id, product_id, variant_id, custom_image_hash)
WHERE product_id IS NOT NULL
  AND variant_id IS NOT NULL
  AND custom_image_hash IS NOT NULL;

-- Add unique constraint for fully custom products (no product_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_fully_custom_unique
ON cart_items(cart_id, custom_image_hash, variant_id)
WHERE product_id IS NULL
  AND custom_image_hash IS NOT NULL
  AND variant_id IS NOT NULL;

-- ============================================================================
-- 7. Update the upsert_cart_item function to use hash for comparison
-- ============================================================================

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
  v_custom_image_hash TEXT := NULL;
BEGIN
  -- Compute hash if custom_image_url is provided
  IF p_custom_image_url IS NOT NULL THEN
    v_custom_image_hash := MD5(p_custom_image_url);
  END IF;

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
        custom_image_hash,
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

    -- Check if item exists using hash for comparison (much faster and avoids index issues)
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id = p_product_id
      AND variant_id = p_variant_id
      AND custom_image_hash = v_custom_image_hash;

    IF FOUND THEN
      -- Update existing item quantity
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id = p_product_id
        AND variant_id = p_variant_id
        AND custom_image_hash = v_custom_image_hash
      RETURNING * INTO v_cart_item;
    ELSE
      -- Insert new item (trigger will compute hash automatically)
      INSERT INTO cart_items (
        cart_id,
        product_id,
        variant_id,
        quantity,
        custom_image_url,
        custom_image_public_id,
        custom_image_hash,
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
        v_custom_image_hash,
        p_unit_price,
        p_product_name,
        NOW(),
        NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  -- For fully custom products (no product_id, has custom_image_url + variant_id)
  ELSIF p_product_id IS NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NOT NULL THEN

    -- Check if item exists using hash for comparison
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id IS NULL
      AND variant_id = p_variant_id
      AND custom_image_hash = v_custom_image_hash;

    IF FOUND THEN
      -- Update existing item quantity
      UPDATE cart_items
      SET
        quantity = quantity + p_quantity,
        updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id IS NULL
        AND variant_id = p_variant_id
        AND custom_image_hash = v_custom_image_hash
      RETURNING * INTO v_cart_item;
    ELSE
      -- Insert new item (trigger will compute hash automatically)
      INSERT INTO cart_items (
        cart_id,
        product_id,
        variant_id,
        quantity,
        custom_image_url,
        custom_image_public_id,
        custom_image_hash,
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
        v_custom_image_hash,
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
  'Atomic upsert for cart items. Uses MD5 hash for custom_image_url comparison to avoid index size limits.';
