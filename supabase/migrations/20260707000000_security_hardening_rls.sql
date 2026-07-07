-- =====================================================
-- Security hardening: RLS + privilege fixes
-- Created: 2026-07-07
-- =====================================================
-- Addresses:
--   * Users could UPDATE their own orders' price/payment_status (privilege esc)
--   * Users could grant themselves coins / overwrite stripe_customer_id
--   * Any authenticated user could INSERT/UPDATE any products row
--   * deduct_coin(user_id) allowed draining another user's coins (IDOR)
--
-- Note on "privileged writer": service-role callers bypass RLS but triggers
-- still fire, so the column-guard triggers below explicitly allow the
-- service role / superuser (server-side code, migrations) while blocking the
-- authenticated/anon roles from touching protected columns.

-- Helper: is the current statement running as a trusted server-side role?
CREATE OR REPLACE FUNCTION is_privileged_writer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.role() = 'service_role', FALSE)
      OR current_user IN ('postgres', 'supabase_admin', 'service_role', 'supabase_auth_admin');
$$;

-- =====================================================
-- ORDERS — block user edits to financial / status columns
-- =====================================================
-- Users still need to UPDATE their own order (e.g. to set printify_order_id),
-- but must never change money or payment/fulfilment status. RLS cannot restrict
-- columns, so enforce it with a BEFORE UPDATE trigger.
CREATE OR REPLACE FUNCTION enforce_orders_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id                 IS DISTINCT FROM OLD.user_id
  OR NEW.order_number            IS DISTINCT FROM OLD.order_number
  OR NEW.subtotal                IS DISTINCT FROM OLD.subtotal
  OR NEW.tax_amount              IS DISTINCT FROM OLD.tax_amount
  OR NEW.discount_amount         IS DISTINCT FROM OLD.discount_amount
  OR NEW.shipping_cost           IS DISTINCT FROM OLD.shipping_cost
  OR NEW.total_amount            IS DISTINCT FROM OLD.total_amount
  OR NEW.currency                IS DISTINCT FROM OLD.currency
  OR NEW.payment_status          IS DISTINCT FROM OLD.payment_status
  OR NEW.payment_method          IS DISTINCT FROM OLD.payment_method
  OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
  OR NEW.stripe_customer_id      IS DISTINCT FROM OLD.stripe_customer_id
  OR NEW.status                  IS DISTINCT FROM OLD.status
  OR NEW.fulfillment_status      IS DISTINCT FROM OLD.fulfillment_status
  OR NEW.promo_code              IS DISTINCT FROM OLD.promo_code
  OR NEW.promo_value             IS DISTINCT FROM OLD.promo_value
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected order columns'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_protected_columns ON orders;
CREATE TRIGGER trg_orders_protected_columns
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION enforce_orders_protected_columns();

-- =====================================================
-- PROFILES — block user edits to coins / billing identity
-- =====================================================
CREATE OR REPLACE FUNCTION enforce_profiles_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF NEW.id                 IS DISTINCT FROM OLD.id
  OR NEW.email              IS DISTINCT FROM OLD.email
  OR NEW.coins              IS DISTINCT FROM OLD.coins
  OR NEW.coins_reset_at     IS DISTINCT FROM OLD.coins_reset_at
  OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile columns'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_protected_columns ON profiles;
CREATE TRIGGER trg_profiles_protected_columns
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_profiles_protected_columns();

-- =====================================================
-- PRODUCTS — scope user writes to the owning user_id
-- =====================================================
-- Previously any authenticated user could update/insert ANY product (set base
-- price to 0, deactivate the catalog). Catalog products are managed by the
-- service role (which bypasses RLS); end users may only write their own rows.
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Users can insert their own products"
  ON products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Users can update their own products"
  ON products
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- deduct_coin — lock to the calling user, revoke public access
-- =====================================================
-- The function is SECURITY DEFINER. It previously trusted a caller-supplied
-- user_id, letting anyone drain another user's coins. Force it to operate on
-- the authenticated caller only.
CREATE OR REPLACE FUNCTION deduct_coin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coins          INTEGER;
  v_coins_reset_at DATE;
  v_caller         UUID := auth.uid();
BEGIN
  -- A non-service caller may only deduct their own coins. NOTE: this runs
  -- SECURITY DEFINER, so current_user is the function owner — we must key the
  -- decision off the request JWT role/uid, not current_user.
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF v_caller IS NULL OR v_caller IS DISTINCT FROM user_id THEN
      RAISE EXCEPTION 'Not allowed to deduct coins for another user'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  SELECT coins, coins_reset_at
    INTO v_coins, v_coins_reset_at
    FROM profiles
   WHERE id = user_id
     FOR UPDATE;

  IF v_coins_reset_at < CURRENT_DATE THEN
    v_coins          := 5;
    v_coins_reset_at := CURRENT_DATE;
  END IF;

  IF v_coins < 1 THEN
    UPDATE profiles
       SET coins          = v_coins,
           coins_reset_at = v_coins_reset_at,
           updated_at     = NOW()
     WHERE id = user_id;
    RETURN FALSE;
  END IF;

  UPDATE profiles
     SET coins          = v_coins - 1,
         coins_reset_at = v_coins_reset_at,
         updated_at     = NOW()
   WHERE id = user_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION deduct_coin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION deduct_coin(UUID) TO authenticated, service_role;
