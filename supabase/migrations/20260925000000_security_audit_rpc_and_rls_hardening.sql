-- =============================================================================
-- Security audit remediation (docs/security/SECURITY-AUDIT-2026-09-23.md)
-- Covers SEC-01, SEC-04 (partial), SEC-05 (partial), SEC-10, SEC-11.
--
-- Postgres grants EXECUTE on every new function to PUBLIC by default, and
-- PostgREST exposes every function in `public` as an RPC. A SECURITY DEFINER
-- function therefore runs with the owner's privileges for any caller holding
-- the anon key unless EXECUTE is revoked explicitly. This migration:
--
--   1. Makes internal / webhook / payment-capture RPCs service-role only.
--   2. Adds auth.uid() ownership checks to the RPCs the browser really calls.
--   3. Pins search_path on every SECURITY DEFINER function.
--   4. Locks payment_transactions and orders columns that only the server may
--      change, and drops the owner INSERT policy on payment_transactions.
--   5. Restricts custom `products` rows to their owner.
--   6. Stops anonymous callers from reading authenticated users' carts.
--   7. Revokes the default PUBLIC EXECUTE grant for functions created later.
--
-- It is written to be idempotent and safe to apply on a database that already
-- has all previous migrations.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Service-role-only RPCs (SEC-01)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  fn TEXT;
  service_only TEXT[] := ARRAY[
    'public.atomic_paypal_payment_capture(TEXT, TEXT, NUMERIC, TEXT, TIMESTAMPTZ)',
    'public.atomic_stripe_payment_capture(TEXT, NUMERIC, TEXT, TIMESTAMPTZ)',
    'public.atomic_mollie_payment_capture(TEXT, NUMERIC, TEXT, TIMESTAMPTZ)',
    'public.upsert_stripe_payment_transaction(TEXT, UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, JSONB, UUID)',
    'public.upsert_paypal_payment_transaction(TEXT, UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB)',
    'public.upsert_mollie_payment_transaction(TEXT, UUID, UUID, NUMERIC, TEXT, TEXT, JSONB)',
    'public.record_webhook_event_atomic(TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ)',
    'public.is_webhook_event_processed(TEXT, TEXT)',
    'public.get_order_by_idempotency_key(TEXT)',
    'public.trigger_catalog_sync()'
  ];
BEGIN
  FOREACH fn IN ARRAY service_only LOOP
    IF to_regprocedure(fn) IS NULL THEN
      RAISE NOTICE 'Skipping missing function %', fn;
      CONTINUE;
    END IF;
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
  END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. User-facing SECURITY DEFINER RPCs get ownership checks (SEC-11)
-- -----------------------------------------------------------------------------

-- JWT-based role check that is safe inside SECURITY DEFINER bodies (where
-- current_user is the owner, so is_privileged_writer() would always be true).
CREATE OR REPLACE FUNCTION public.is_service_role_caller()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(auth.role() = 'service_role', FALSE);
$$;
REVOKE EXECUTE ON FUNCTION public.is_service_role_caller() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_service_role_caller() TO anon, authenticated, service_role;

-- Shared helper: may the current caller act on this cart?
--   * authenticated users: only their own cart
--   * anonymous callers:   only guest carts (user_id IS NULL). Guest carts are
--     still not bound to a session server-side (SEC-04 follow-up); this at
--     least stops anon/other users from touching authenticated users' carts.
CREATE OR REPLACE FUNCTION public.caller_owns_cart(p_cart_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.carts c
    WHERE c.id = p_cart_id
      AND (
        (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
        OR (auth.uid() IS NULL AND c.user_id IS NULL AND c.session_id IS NOT NULL)
        OR public.is_service_role_caller()
      )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.caller_owns_cart(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.caller_owns_cart(UUID) TO anon, authenticated, service_role;

-- upsert_cart_item: same body as 20260804000000, plus the ownership guard and
-- input bounds. Callers may no longer add items to arbitrary carts.
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
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_cart_item cart_items;
  v_existing_quantity INTEGER := 0;
  v_custom_image_hash TEXT := NULL;
BEGIN
  IF NOT public.caller_owns_cart(p_cart_id) THEN
    RAISE EXCEPTION 'Cart not found or not owned by caller'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 100 THEN
    RAISE EXCEPTION 'Invalid quantity' USING ERRCODE = 'check_violation';
  END IF;

  IF p_unit_price IS NOT NULL AND (p_unit_price < 0 OR p_unit_price > 100000) THEN
    RAISE EXCEPTION 'Invalid unit price' USING ERRCODE = 'check_violation';
  END IF;

  IF p_custom_image_url IS NOT NULL THEN
    v_custom_image_hash := MD5(p_custom_image_url);
  END IF;

  -- Standard products (product_id + variant_id, no custom image)
  IF p_product_id IS NOT NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NULL THEN
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id = p_product_id
      AND variant_id = p_variant_id
      AND custom_image_url IS NULL;

    IF FOUND THEN
      UPDATE cart_items
      SET quantity = quantity + p_quantity, updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id = p_product_id
        AND variant_id = p_variant_id
        AND custom_image_url IS NULL
      RETURNING * INTO v_cart_item;
    ELSE
      INSERT INTO cart_items (
        cart_id, product_id, variant_id, quantity,
        custom_image_url, custom_image_public_id, custom_image_hash,
        unit_price, product_name, created_at, updated_at
      ) VALUES (
        p_cart_id, p_product_id, p_variant_id, p_quantity,
        NULL, NULL, NULL,
        p_unit_price, p_product_name, NOW(), NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  -- Custom products on a catalog product
  ELSIF p_product_id IS NOT NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NOT NULL THEN
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id = p_product_id
      AND variant_id = p_variant_id
      AND custom_image_hash = v_custom_image_hash;

    IF FOUND THEN
      UPDATE cart_items
      SET quantity = quantity + p_quantity, updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id = p_product_id
        AND variant_id = p_variant_id
        AND custom_image_hash = v_custom_image_hash
      RETURNING * INTO v_cart_item;
    ELSE
      INSERT INTO cart_items (
        cart_id, product_id, variant_id, quantity,
        custom_image_url, custom_image_public_id, custom_image_hash,
        unit_price, product_name, created_at, updated_at
      ) VALUES (
        p_cart_id, p_product_id, p_variant_id, p_quantity,
        p_custom_image_url, p_custom_image_public_id, v_custom_image_hash,
        p_unit_price, p_product_name, NOW(), NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  -- Fully custom products (no product_id)
  ELSIF p_product_id IS NULL AND p_variant_id IS NOT NULL AND p_custom_image_url IS NOT NULL THEN
    SELECT quantity INTO v_existing_quantity
    FROM cart_items
    WHERE cart_id = p_cart_id
      AND product_id IS NULL
      AND variant_id = p_variant_id
      AND custom_image_hash = v_custom_image_hash;

    IF FOUND THEN
      UPDATE cart_items
      SET quantity = quantity + p_quantity, updated_at = NOW()
      WHERE cart_id = p_cart_id
        AND product_id IS NULL
        AND variant_id = p_variant_id
        AND custom_image_hash = v_custom_image_hash
      RETURNING * INTO v_cart_item;
    ELSE
      INSERT INTO cart_items (
        cart_id, product_id, variant_id, quantity,
        custom_image_url, custom_image_public_id, custom_image_hash,
        unit_price, product_name, created_at, updated_at
      ) VALUES (
        p_cart_id, NULL, p_variant_id, p_quantity,
        p_custom_image_url, p_custom_image_public_id, v_custom_image_hash,
        p_unit_price, p_product_name, NOW(), NOW()
      )
      RETURNING * INTO v_cart_item;
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid cart item: variant_id is required and product_id/custom_image_url combination is not supported';
  END IF;

  RETURN v_cart_item;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.upsert_cart_item(uuid, text, text, integer, text, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_cart_item(uuid, text, text, integer, text, text, text, numeric) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.update_cart_items_selection(
  p_cart_id UUID,
  p_selected_item_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.caller_owns_cart(p_cart_id) THEN
    RAISE EXCEPTION 'Cart not found or not owned by caller'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE cart_items SET is_selected = false WHERE cart_id = p_cart_id;

  UPDATE cart_items
  SET is_selected = true
  WHERE cart_id = p_cart_id
    AND id = ANY(p_selected_item_ids);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.update_cart_items_selection(UUID, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_cart_items_selection(UUID, UUID[]) TO anon, authenticated, service_role;

-- get_user_coins: the caller may only read (and daily-reset) their own balance.
CREATE OR REPLACE FUNCTION public.get_user_coins(p_user_id UUID)
RETURNS TABLE(coins INTEGER, coins_reset_at DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_coins          INTEGER;
  v_coins_reset_at DATE;
BEGIN
  -- NOTE: is_privileged_writer() cannot be used inside SECURITY DEFINER bodies:
  -- current_user is the function owner there, so it would always be true.
  IF NOT public.is_service_role_caller() AND (auth.uid() IS NULL OR auth.uid() <> p_user_id) THEN
    RAISE EXCEPTION 'Not allowed to read another user''s coins'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT p.coins, p.coins_reset_at
    INTO v_coins, v_coins_reset_at
    FROM profiles p
   WHERE p.id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user: %', p_user_id;
  END IF;

  IF v_coins_reset_at < CURRENT_DATE THEN
    v_coins          := 5;
    v_coins_reset_at := CURRENT_DATE;

    UPDATE profiles
       SET coins          = v_coins,
           coins_reset_at = v_coins_reset_at,
           updated_at     = NOW()
     WHERE id = p_user_id;
  END IF;

  RETURN QUERY SELECT v_coins, v_coins_reset_at;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_user_coins(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_coins(UUID) TO authenticated, service_role;

-- create_refund_failure_alert: still callable by the browser after a failed
-- refund, but only for the caller's own order and with bounded inputs.
CREATE OR REPLACE FUNCTION public.create_refund_failure_alert(
  p_payment_id TEXT,
  p_payment_provider TEXT,
  p_order_id TEXT,
  p_amount DECIMAL,
  p_error_message TEXT,
  p_retry_count INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  failure_id UUID;
  v_order_uuid UUID;
BEGIN
  IF NOT public.is_service_role_caller() THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
    END IF;

    BEGIN
      v_order_uuid := p_order_id::UUID;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'Invalid order id' USING ERRCODE = 'invalid_parameter_value';
    END;

    IF NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = v_order_uuid AND o.user_id = auth.uid()) THEN
      RAISE EXCEPTION 'Order not found or not owned by caller'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_payment_provider NOT IN ('stripe', 'paypal', 'mollie') THEN
      RAISE EXCEPTION 'Invalid payment provider' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 100000 THEN
      RAISE EXCEPTION 'Invalid amount' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF length(COALESCE(p_payment_id, '')) > 255 OR length(COALESCE(p_error_message, '')) > 2000 THEN
      RAISE EXCEPTION 'Input too long' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Users cannot escalate straight to manual review with a fake retry count.
    p_retry_count := LEAST(GREATEST(COALESCE(p_retry_count, 0), 0), 3);
  END IF;

  INSERT INTO refund_failures (
    payment_id, payment_provider, order_id, amount, error_message,
    retry_count, status, next_retry_at
  ) VALUES (
    p_payment_id, p_payment_provider, p_order_id, p_amount, p_error_message,
    p_retry_count,
    CASE WHEN p_retry_count < 3 THEN 'retrying' ELSE 'pending_manual_review' END,
    CASE WHEN p_retry_count < 3 THEN NOW() + INTERVAL '5 minutes' * POWER(2, p_retry_count) ELSE NULL END
  ) RETURNING id INTO failure_id;

  RETURN failure_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_refund_failure_alert(TEXT, TEXT, TEXT, DECIMAL, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_refund_failure_alert(TEXT, TEXT, TEXT, DECIMAL, TEXT, INTEGER) TO authenticated, service_role;

-- Trigger helper functions are not RPC targets; make sure of it and pin their path.
DO $$
DECLARE
  fn TEXT;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.enforce_orders_protected_columns()',
    'public.enforce_profiles_protected_columns()',
    'public.is_privileged_writer()'
  ] LOOP
    IF to_regprocedure(fn) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
    END IF;
  END LOOP;
  -- is_privileged_writer is referenced from RLS/trigger context for all roles.
  IF to_regprocedure('public.enforce_orders_protected_columns()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.enforce_orders_protected_columns() FROM PUBLIC, anon, authenticated;
  END IF;
  IF to_regprocedure('public.enforce_profiles_protected_columns()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.enforce_profiles_protected_columns() FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. payment_transactions: no owner INSERT, and owner UPDATE may only link an
--    unlinked transaction to the owner's own order (SEC-05)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert their own payment transactions" ON public.payment_transactions;

DROP POLICY IF EXISTS "Users can update their own payment transactions" ON public.payment_transactions;
CREATE POLICY "Users can link their own payment transactions" ON public.payment_transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_payment_transactions_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  -- Everything financial or provider-related is server-owned.
  IF NEW.user_id                  IS DISTINCT FROM OLD.user_id
  OR NEW.amount                   IS DISTINCT FROM OLD.amount
  OR NEW.currency                  IS DISTINCT FROM OLD.currency
  OR NEW.status                    IS DISTINCT FROM OLD.status
  OR NEW.payment_provider          IS DISTINCT FROM OLD.payment_provider
  OR NEW.stripe_payment_intent_id  IS DISTINCT FROM OLD.stripe_payment_intent_id
  OR NEW.stripe_charge_id          IS DISTINCT FROM OLD.stripe_charge_id
  OR NEW.stripe_customer_id        IS DISTINCT FROM OLD.stripe_customer_id
  OR NEW.paypal_order_id           IS DISTINCT FROM OLD.paypal_order_id
  OR NEW.paypal_capture_id         IS DISTINCT FROM OLD.paypal_capture_id
  OR NEW.paypal_payer_id           IS DISTINCT FROM OLD.paypal_payer_id
  OR NEW.paypal_payer_email        IS DISTINCT FROM OLD.paypal_payer_email
  OR NEW.mollie_payment_id         IS DISTINCT FROM OLD.mollie_payment_id
  OR NEW.mollie_status             IS DISTINCT FROM OLD.mollie_status
  OR NEW.captured_at               IS DISTINCT FROM OLD.captured_at
  OR NEW.payment_method_type       IS DISTINCT FROM OLD.payment_method_type
  OR NEW.payment_method_details    IS DISTINCT FROM OLD.payment_method_details
  OR NEW.metadata                  IS DISTINCT FROM OLD.metadata
  OR NEW.error_message             IS DISTINCT FROM OLD.error_message
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected payment columns'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- order_id may be set once (NULL -> value) and only to the caller's own order.
  IF NEW.order_id IS DISTINCT FROM OLD.order_id THEN
    IF OLD.order_id IS NOT NULL THEN
      RAISE EXCEPTION 'Payment is already linked to an order'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    IF NEW.order_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = NEW.order_id AND o.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Payment can only be linked to your own order'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_payment_transactions_protected_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_payment_transactions_protected_columns ON public.payment_transactions;
CREATE TRIGGER trg_payment_transactions_protected_columns
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_transactions_protected_columns();

-- -----------------------------------------------------------------------------
-- 4. orders: fulfillment / idempotency identifiers are server-owned (SEC-05)
--    The create-printify-order edge function now writes printify_order_id.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_orders_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_privileged_writer() THEN
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
  OR NEW.status                  IS DISTINCT FROM OLD.status
  OR NEW.promo_code              IS DISTINCT FROM OLD.promo_code
  OR NEW.promo_value             IS DISTINCT FROM OLD.promo_value
  OR NEW.printify_order_id       IS DISTINCT FROM OLD.printify_order_id
  OR NEW.idempotency_key         IS DISTINCT FROM OLD.idempotency_key
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected order columns'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

-- Owner INSERTs are still allowed because checkout creates the order from the
-- browser after payment (SEC-05 / SEC-06 follow-up: move order creation to the
-- server). Until then, an owner-inserted order can only be fulfilled by
-- create-printify-order after a provider-verified payment matching its total.

-- -----------------------------------------------------------------------------
-- 5. products: custom products are private to their creator (SEC-10)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Active products are visible to their owner" ON public.products
  FOR SELECT
  USING (
    is_active = true
    AND (
      user_id IS NULL            -- legacy catalog rows without an owner
      OR user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 6. carts: anonymous callers must never see authenticated users' carts (SEC-04)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Guests can view carts by session" ON public.carts;
CREATE POLICY "Guests can view carts by session" ON public.carts
  FOR SELECT
  USING (
    auth.uid() IS NULL
    AND session_id IS NOT NULL
    AND user_id IS NULL
  );

DROP POLICY IF EXISTS "Guests can update carts by session" ON public.carts;
CREATE POLICY "Guests can update carts by session" ON public.carts
  FOR UPDATE
  USING (auth.uid() IS NULL AND session_id IS NOT NULL AND user_id IS NULL)
  WITH CHECK (auth.uid() IS NULL AND session_id IS NOT NULL AND user_id IS NULL);

-- NOTE (SEC-04, not fixed here): guest carts are still identified only by a
-- client-generated session_id and any anonymous caller can enumerate them.
-- The durable fix is Supabase anonymous sign-in (auth.uid() per guest) or a
-- server proxy with a signed session cookie.

-- -----------------------------------------------------------------------------
-- 7. Secure default for functions created by future migrations
-- -----------------------------------------------------------------------------
-- Functions created from now on in `public` by the migration role are NOT
-- executable by anon/authenticated unless a migration grants it explicitly.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO service_role;

COMMENT ON FUNCTION public.caller_owns_cart(UUID) IS
  'True when the caller (auth.uid(), anonymous guest, or service role) may act on the cart.';
COMMENT ON FUNCTION public.enforce_payment_transactions_protected_columns() IS
  'Blocks non-service updates to financial/provider columns; order_id may be set once to an owned order.';
