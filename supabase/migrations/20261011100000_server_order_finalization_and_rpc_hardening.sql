-- =====================================================
-- Server-side order finalization and RPC hardening
--
-- Paid orders are now minted by the finalize-order Edge Function and the
-- payment webhooks (service role). The browser may still create *unpaid*
-- draft orders, but can no longer insert an order that claims to be paid,
-- forge the identifiers that link an order to its payment or fulfilment, or
-- act on another user's cart through SECURITY DEFINER RPCs.
-- =====================================================

-- -----------------------------------------------------
-- 1. One Printify order per application order
-- -----------------------------------------------------
-- create-printify-order inserts the claim before calling Printify; the
-- primary key turns a concurrent second request into 409 ALREADY_FULFILLED.
CREATE TABLE IF NOT EXISTS order_fulfillment_claims (
  order_id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE order_fulfillment_claims IS 'Fulfilment lock: an order is sent to Printify at most once';

ALTER TABLE order_fulfillment_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE order_fulfillment_claims FROM anon, authenticated;

-- Orders already at Printify are already fulfilled.
INSERT INTO order_fulfillment_claims (order_id)
SELECT id FROM orders WHERE printify_order_id IS NOT NULL
ON CONFLICT (order_id) DO NOTHING;

-- -----------------------------------------------------
-- 2. orders: browsers may only insert unpaid drafts
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_orders_insert_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.payment_status, 'pending') <> 'pending'
  OR COALESCE(NEW.status, 'pending') <> 'pending'
  OR NEW.printify_order_id IS NOT NULL
  OR NEW.printify_status IS NOT NULL
  OR NEW.idempotency_key IS NOT NULL THEN
    RAISE EXCEPTION 'Paid orders are created by the server'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_insert_defaults ON orders;
CREATE TRIGGER trg_orders_insert_defaults
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION enforce_orders_insert_defaults();

-- Fulfilment and payment-link identifiers are server-owned as well.
CREATE OR REPLACE FUNCTION enforce_orders_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
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

-- The items of a paid order are part of what was paid for.
CREATE OR REPLACE FUNCTION enforce_order_items_of_unpaid_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order_id UUID := CASE WHEN TG_OP = 'DELETE' THEN OLD.order_id ELSE NEW.order_id END;
BEGIN
  IF is_privileged_writer() THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM orders
     WHERE id IN (v_order_id, CASE WHEN TG_OP = 'UPDATE' THEN OLD.order_id END)
       AND COALESCE(payment_status, 'pending') <> 'pending'
  ) THEN
    RAISE EXCEPTION 'Items of a paid order cannot be changed'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_of_unpaid_orders ON order_items;
CREATE TRIGGER trg_order_items_of_unpaid_orders
  BEFORE INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION enforce_order_items_of_unpaid_orders();

-- -----------------------------------------------------
-- 3. Cart RPCs act only on the caller's own (or a guest) cart
-- -----------------------------------------------------
-- upsert_cart_item and update_cart_items_selection are SECURITY DEFINER, so
-- RLS does not apply inside them. A row trigger still fires there and still
-- sees the caller's JWT, so it guards every path that writes cart items.
CREATE OR REPLACE FUNCTION enforce_cart_item_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := auth.role();
  v_cart_ids UUID[];
BEGIN
  -- Migrations, cron jobs and Edge Functions (service role) are trusted.
  IF v_role IS NULL OR v_role = 'service_role' THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  v_cart_ids := CASE TG_OP
    WHEN 'INSERT' THEN ARRAY[NEW.cart_id]
    WHEN 'DELETE' THEN ARRAY[OLD.cart_id]
    ELSE ARRAY[NEW.cart_id, OLD.cart_id]
  END;

  IF EXISTS (
    SELECT 1 FROM carts c
     WHERE c.id = ANY (v_cart_ids)
       AND c.user_id IS NOT NULL
       AND c.user_id IS DISTINCT FROM auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cart not found or not owned by caller'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

REVOKE ALL ON FUNCTION enforce_cart_item_ownership() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_cart_item_ownership ON cart_items;
CREATE TRIGGER trg_cart_item_ownership
  BEFORE INSERT OR UPDATE OR DELETE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION enforce_cart_item_ownership();

-- -----------------------------------------------------
-- 4. User-facing SECURITY DEFINER RPCs check the caller
-- -----------------------------------------------------
-- Same body as 20260807000000, plus the ownership guard.
CREATE OR REPLACE FUNCTION get_user_coins(p_user_id UUID)
RETURNS TABLE(coins INTEGER, coins_reset_at DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coins          INTEGER;
  v_coins_reset_at DATE;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not allowed to read another user''s coins'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Lock the row for this user to handle concurrent calls
  SELECT p.coins, p.coins_reset_at
    INTO v_coins, v_coins_reset_at
    FROM profiles p
   WHERE p.id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user: %', p_user_id;
  END IF;

  -- Daily reset: if the last reset date is before today, refill coins
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

-- Same body as 20260412000000. A browser may only report a failed refund of
-- its own payment, with bounded values.
CREATE OR REPLACE FUNCTION create_refund_failure_alert(
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
SET search_path = public
AS $$
DECLARE
  failure_id UUID;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF NOT EXISTS (
      SELECT 1 FROM payment_transactions pt
       WHERE pt.user_id = auth.uid()
         AND p_payment_id IN (pt.stripe_payment_intent_id, pt.paypal_order_id, pt.paypal_capture_id, pt.mollie_payment_id)
    ) THEN
      RAISE EXCEPTION 'Payment not found for this user'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    IF p_retry_count IS NULL OR p_retry_count < 0 OR p_retry_count > 10
    OR p_amount IS NULL OR p_amount < 0 OR p_amount > 1000000
    OR length(COALESCE(p_error_message, '')) > 2000 THEN
      RAISE EXCEPTION 'Invalid refund failure report' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  INSERT INTO refund_failures (
    payment_id,
    payment_provider,
    order_id,
    amount,
    error_message,
    retry_count,
    status,
    next_retry_at
  ) VALUES (
    p_payment_id,
    p_payment_provider,
    p_order_id,
    p_amount,
    p_error_message,
    p_retry_count,
    CASE
      WHEN p_retry_count < 3 THEN 'retrying'
      ELSE 'pending_manual_review'
    END,
    CASE
      WHEN p_retry_count < 3 THEN NOW() + INTERVAL '5 minutes' * POWER(2, p_retry_count)
      ELSE NULL
    END
  ) RETURNING id INTO failure_id;

  RETURN failure_id;
END;
$$;

-- -----------------------------------------------------
-- 5. Internal RPCs are server-only
-- -----------------------------------------------------
-- 20261010120000 locked the capture and Stripe/PayPal upsert functions; these
-- are the remaining webhook/internal functions PostgREST still exposed.
DO $$
DECLARE
  fn REGPROCEDURE;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN (
         'upsert_mollie_payment_transaction',
         'record_webhook_event_atomic',
         'record_webhook_event',
         'is_webhook_event_processed',
         'is_webhook_processed',
         'get_order_by_idempotency_key',
         'trigger_catalog_sync'
       )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn);
  END LOOP;
END;
$$;

-- -----------------------------------------------------
-- 6. Custom products are private to their creator
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Active products are visible to their owner" ON products;
CREATE POLICY "Active products are visible to their owner" ON products
  FOR SELECT
  USING (
    is_active = true
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- -----------------------------------------------------
-- 7. Secure default for functions created by later migrations
-- -----------------------------------------------------
-- New functions in `public` are not callable by browsers unless a migration
-- grants it explicitly.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO service_role;
