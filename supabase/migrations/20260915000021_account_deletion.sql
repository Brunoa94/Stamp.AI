-- =====================================================
-- GDPR: right to erasure (Art. 17) with Dutch tax retention
-- Created: 2026-09-15
-- Description:
--   * Retention-safe FKs: deleting an auth.users row must never cascade into
--     payment records (payment_transactions / payment_recovery previously
--     cascaded and would have destroyed 7-year bookkeeping data).
--   * account_deletions audit table (hashed user id, no PII).
--   * delete_own_account(p_reason) — scoped to auth.uid():
--       - refuses (structured result) while the user has non-final orders,
--         pending payment recoveries or unresolved refund failures;
--       - anonymises orders / order_items / invoices / payment_transactions /
--         payment_recovery / refunds that must be kept for 7 years under the
--         Dutch bookkeeping duty (amounts, dates, order & invoice numbers,
--         provider ids stay; name, email, phone, addresses, tracking, payer
--         ids, card details and user_id are scrubbed);
--       - deletes carts, credits, custom products, uploads, AI generations
--         and the profile;
--       - returns the invoice PDF object paths so the API route (service
--         role) can remove them from storage and finally delete auth.users
--         via auth.admin.deleteUser (auth mutations are done through GoTrue
--         in this codebase, not via SQL).
-- Idempotent: safe to re-run.
-- =====================================================

-- -----------------------------------------------------
-- 1. Retention-safe foreign keys
-- -----------------------------------------------------
ALTER TABLE public.payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_user_id_fkey;
ALTER TABLE public.payment_transactions
  ADD CONSTRAINT payment_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
COMMENT ON CONSTRAINT payment_transactions_user_id_fkey ON public.payment_transactions IS
  'SET NULL on user deletion: payment records are retained 7 years for tax purposes.';

ALTER TABLE public.payment_recovery
  DROP CONSTRAINT IF EXISTS payment_recovery_user_id_fkey;
ALTER TABLE public.payment_recovery
  ADD CONSTRAINT payment_recovery_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- -----------------------------------------------------
-- 2. Audit table (no PII: user id is sha256-hashed)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_hash TEXT NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  orders_anonymised INTEGER NOT NULL DEFAULT 0,
  invoices_anonymised INTEGER NOT NULL DEFAULT 0,
  payments_anonymised INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_deletions FROM PUBLIC, anon, authenticated;
CREATE INDEX IF NOT EXISTS account_deletions_deleted_at_idx
  ON public.account_deletions (deleted_at);

COMMENT ON TABLE public.account_deletions IS
  'Audit log of GDPR account deletions. Contains only a sha256 hash of the former user id.';

-- -----------------------------------------------------
-- 3. delete_own_account()
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_own_account(p_reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
  v_hash TEXT;
  v_profile_existed BOOLEAN;
  v_open_orders JSONB;
  v_pending_recoveries INTEGER;
  v_unresolved_refunds INTEGER;
  v_order_ids UUID[];
  v_invoice_pdfs JSONB;
  v_orders_count INTEGER := 0;
  v_invoices_count INTEGER := 0;
  v_payments_count INTEGER := 0;
  c_tombstone_email CONSTANT TEXT := 'deleted-user@anonymised.invalid';
  c_tombstone_image CONSTANT TEXT := 'removed:account-deleted';
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_hash := encode(sha256(convert_to(v_uid::text, 'UTF8')), 'hex');
  SELECT users.email INTO v_email FROM auth.users AS users WHERE users.id = v_uid;
  v_profile_existed := EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid);

  -- ---------------------------------------------------
  -- Blockers: money or goods still in flight
  -- ---------------------------------------------------
  -- Non-final = fulfilment still running, or paid but neither delivered
  -- nor cancelled (covers pending/unsuccessful_confirmation awaiting refund).
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'order_number', o.order_number,
           'status', o.status,
           'payment_status', o.payment_status
         ) ORDER BY o.created_at), '[]'::jsonb)
  INTO v_open_orders
  FROM public.orders o
  WHERE o.user_id = v_uid
    AND (
      o.status IN ('waiting_confirmation', 'confirmed', 'processing', 'shipped')
      OR (o.payment_status = 'paid'
          AND COALESCE(o.status, '') NOT IN ('delivered', 'cancelled'))
    );

  SELECT count(*) INTO v_pending_recoveries
  FROM public.payment_recovery pr
  WHERE pr.recovery_status = 'pending'
    AND (pr.user_id = v_uid
         OR (v_email IS NOT NULL AND lower(pr.user_email) = lower(v_email)));

  SELECT count(*) INTO v_unresolved_refunds
  FROM public.refund_failures rf
  WHERE rf.order_id IN (SELECT id FROM public.orders WHERE user_id = v_uid)
    AND rf.resolved_at IS NULL
    AND COALESCE(rf.status, '') NOT IN ('resolved', 'refunded_manually');

  IF jsonb_array_length(v_open_orders) > 0
     OR v_pending_recoveries > 0
     OR v_unresolved_refunds > 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'OPEN_ORDERS',
      'open_orders', v_open_orders,
      'pending_payment_recoveries', v_pending_recoveries,
      'unresolved_refunds', v_unresolved_refunds
    );
  END IF;

  SELECT COALESCE(array_agg(id), '{}'::uuid[]) INTO v_order_ids
  FROM public.orders WHERE user_id = v_uid;

  -- Collected BEFORE scrubbing so the caller can remove the objects.
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'bucket', COALESCE(i.pdf_bucket, 'invoices'),
           'path', i.pdf_path
         )), '[]'::jsonb)
  INTO v_invoice_pdfs
  FROM public.invoices i
  WHERE (i.user_id = v_uid OR i.order_id = ANY(v_order_ids))
    AND i.pdf_path IS NOT NULL;

  -- ---------------------------------------------------
  -- Anonymise records retained for the 7-year bookkeeping duty
  -- ---------------------------------------------------
  UPDATE public.order_items
  SET custom_image_url = c_tombstone_image,
      design_config = NULL
  WHERE order_id = ANY(v_order_ids);

  UPDATE public.orders
  SET user_id = NULL,
      customer_email = c_tombstone_email,
      customer_name = NULL,
      customer_phone = NULL,
      shipping_address = NULL,
      billing_address = NULL,
      tracking_number = NULL,
      tracking_url = NULL
  WHERE id = ANY(v_order_ids);
  GET DIAGNOSTICS v_orders_count = ROW_COUNT;

  UPDATE public.invoices
  SET user_id = NULL,
      customer_email = c_tombstone_email,
      customer_name = NULL,
      billing_address = NULL,
      shipping_address = NULL
  WHERE user_id = v_uid OR order_id = ANY(v_order_ids);
  GET DIAGNOSTICS v_invoices_count = ROW_COUNT;

  UPDATE public.payment_transactions
  SET user_id = NULL,
      paypal_payer_email = NULL,
      paypal_payer_id = NULL,
      stripe_customer_id = NULL,
      payment_method_details = NULL,
      metadata = NULL
  WHERE user_id = v_uid OR order_id = ANY(v_order_ids);
  GET DIAGNOSTICS v_payments_count = ROW_COUNT;

  UPDATE public.payment_recovery
  SET user_id = NULL,
      user_email = c_tombstone_email,
      session_id = NULL,
      shipping_address = NULL,
      cart_snapshot = NULL,
      line_items = NULL,
      metadata = NULL
  WHERE user_id = v_uid
     OR (v_email IS NOT NULL AND lower(user_email) = lower(v_email))
     OR order_id = ANY(v_order_ids);

  UPDATE public.refunds
  SET metadata = NULL
  WHERE order_id = ANY(v_order_ids);

  -- ---------------------------------------------------
  -- Delete personal data with no retention duty
  -- ---------------------------------------------------
  DELETE FROM public.cart_items
  WHERE cart_id IN (SELECT id FROM public.carts WHERE user_id = v_uid);
  DELETE FROM public.carts WHERE user_id = v_uid;
  DELETE FROM public.credit_transactions WHERE user_id = v_uid;
  DELETE FROM public.user_credits WHERE user_id = v_uid;
  DELETE FROM public.products WHERE user_id = v_uid;
  DELETE FROM public.ai_generations WHERE user_id = v_uid;
  DELETE FROM public.user_uploads WHERE user_id = v_uid;
  DELETE FROM public.profiles WHERE id = v_uid;

  IF v_profile_existed THEN
    INSERT INTO public.account_deletions (
      user_id_hash, reason, orders_anonymised, invoices_anonymised, payments_anonymised
    ) VALUES (
      v_hash, left(p_reason, 500), v_orders_count, v_invoices_count, v_payments_count
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'user_id', v_uid,
    'invoice_pdfs', v_invoice_pdfs,
    'orders_anonymised', v_orders_count,
    'invoices_anonymised', v_invoices_count,
    'payments_anonymised', v_payments_count
  );
END;
$$;

COMMENT ON FUNCTION public.delete_own_account(TEXT) IS
  'GDPR erasure for the calling user (auth.uid()). Refuses with {ok:false, reason:OPEN_ORDERS} while orders/payments are in flight; otherwise anonymises tax-retained records and deletes the rest. auth.users deletion and storage cleanup are done by the API route.';

REVOKE ALL ON FUNCTION public.delete_own_account(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account(TEXT) TO authenticated, service_role;
