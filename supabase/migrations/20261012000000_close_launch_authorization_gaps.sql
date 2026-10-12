-- Guest carts are kept in browser storage. A session_id supplied by a client
-- is not a database identity and must never grant access to other guest carts.
DROP POLICY IF EXISTS "Guests can view carts by session" ON public.carts;
DROP POLICY IF EXISTS "Guests can create carts by session" ON public.carts;
DROP POLICY IF EXISTS "Guests can update carts by session" ON public.carts;
DROP POLICY IF EXISTS "Guests can delete carts by session" ON public.carts;
DROP POLICY IF EXISTS "Guests can manage cart items by session" ON public.cart_items;

-- Execute cart mutations under the caller's RLS identity, not the function owner.
ALTER FUNCTION public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC)
  SECURITY INVOKER;
ALTER FUNCTION public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC)
  SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_cart_item(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC)
  TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.update_cart_items_selection(p_cart_id UUID, p_selected_item_ids UUID[])
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND (
    auth.uid() IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.carts WHERE id = p_cart_id AND user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Cart not found or not owned by caller' USING ERRCODE = '42501';
  END IF;
  UPDATE public.cart_items SET is_selected = id = ANY(COALESCE(p_selected_item_ids, ARRAY[]::UUID[]))
    WHERE cart_id = p_cart_id;
END;
$$;
REVOKE ALL ON FUNCTION public.update_cart_items_selection(UUID, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_cart_items_selection(UUID, UUID[]) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_coins(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_coins(UUID) TO authenticated, service_role;

-- Payment linking is now performed by finalize-order. Browsers have no writes.
DROP POLICY IF EXISTS "Users can update their own payment transactions" ON public.payment_transactions;
REVOKE INSERT, UPDATE, DELETE ON public.payment_transactions FROM anon, authenticated;

-- A client must not claim someone else's Printify product by inserting its ID.
-- create-custom-product persists the server-verified owner before returning.
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;

-- Protect all order fields after payment, and all provider fields even on drafts.
CREATE OR REPLACE FUNCTION public.enforce_orders_protected_columns()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_privileged_writer() THEN RETURN NEW; END IF;
  IF OLD.payment_status IS DISTINCT FROM 'pending'
    OR (to_jsonb(NEW) - 'customer_notes' - 'updated_at') IS DISTINCT FROM
       (to_jsonb(OLD) - 'customer_notes' - 'updated_at') THEN
    RAISE EXCEPTION 'Order changes must be performed by the server' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

-- Close every overload of internal RPCs, including older signatures left by migrations.
DO $$ DECLARE fn REGPROCEDURE; BEGIN
  FOR fn IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN (
      'atomic_stripe_payment_capture','atomic_paypal_payment_capture','atomic_mollie_payment_capture',
      'upsert_stripe_payment_transaction','upsert_paypal_payment_transaction','upsert_mollie_payment_transaction',
      'process_refund_atomic','update_order_payment_status_atomic','record_webhook_event_atomic',
      'record_webhook_event','is_webhook_event_processed','is_webhook_processed',
      'increment_recovery_attempt','record_amount_validation_failure','cleanup_old_webhook_events',
      'cleanup_old_payment_recoveries','get_order_by_idempotency_key',
      'trigger_catalog_sync','grant_stripe_purchase_credits','refund_coin'
    )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',fn);
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp',fn);
  END LOOP;
END $$;

CREATE TABLE public.printify_image_owners (
  image_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(image_id,user_id)
);
ALTER TABLE public.printify_image_owners ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.printify_image_owners FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.printify_image_owners TO service_role;
