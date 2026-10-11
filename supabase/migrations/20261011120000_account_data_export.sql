-- =====================================================
-- GDPR: data access / portability (Art. 15 & 20)
-- Created: 2026-09-15
-- Description: export_own_data() returns a JSON document with every record
--              stored about the calling user. Always scoped to auth.uid();
--              there is deliberately no user_id parameter.
-- Idempotent: CREATE OR REPLACE + REVOKE/GRANT.
-- =====================================================

CREATE OR REPLACE FUNCTION public.export_own_data()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT users.email INTO v_email FROM auth.users AS users WHERE users.id = v_uid;

  RETURN jsonb_build_object(
    'schema_version', 1,
    'exported_at', now(),
    'user_id', v_uid,

    'account', (
      SELECT jsonb_build_object(
        'id', users.id,
        'email', users.email,
        'email_confirmed_at', users.email_confirmed_at,
        'created_at', users.created_at,
        'last_sign_in_at', users.last_sign_in_at,
        'metadata', users.raw_user_meta_data
      )
      FROM auth.users AS users
      WHERE users.id = v_uid
    ),

    'profile', (SELECT to_jsonb(p) FROM public.profiles p WHERE p.id = v_uid),

    -- Distinct shipping / billing addresses ever used on an order
    'addresses', (
      SELECT COALESCE(jsonb_agg(DISTINCT addr), '[]'::jsonb)
      FROM (
        SELECT shipping_address AS addr FROM public.orders
        WHERE user_id = v_uid AND shipping_address IS NOT NULL
        UNION
        SELECT billing_address FROM public.orders
        WHERE user_id = v_uid AND billing_address IS NOT NULL
      ) a
    ),

    'orders', (
      SELECT COALESCE(jsonb_agg(
        to_jsonb(o) || jsonb_build_object(
          'items', (
            SELECT COALESCE(jsonb_agg(to_jsonb(oi) ORDER BY oi.created_at), '[]'::jsonb)
            FROM public.order_items oi WHERE oi.order_id = o.id
          ),
          'status_history', (
            SELECT COALESCE(jsonb_agg(to_jsonb(h) ORDER BY h.created_at), '[]'::jsonb)
            FROM public.order_status_history h WHERE h.order_id = o.id
          ),
          'refunds', (
            SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.refunded_at), '[]'::jsonb)
            FROM public.refunds r WHERE r.order_id = o.id
          )
        ) ORDER BY o.created_at
      ), '[]'::jsonb)
      FROM public.orders o
      WHERE o.user_id = v_uid
    ),

    'payments', (
      SELECT COALESCE(jsonb_agg(to_jsonb(pt) ORDER BY pt.created_at), '[]'::jsonb)
      FROM public.payment_transactions pt
      WHERE pt.user_id = v_uid
         OR pt.order_id IN (SELECT id FROM public.orders WHERE user_id = v_uid)
    ),

    'payment_recovery', (
      SELECT COALESCE(jsonb_agg(to_jsonb(pr) ORDER BY pr.created_at), '[]'::jsonb)
      FROM public.payment_recovery pr
      WHERE pr.user_id = v_uid
         OR (v_email IS NOT NULL AND lower(pr.user_email) = lower(v_email))
    ),

    -- Invoice metadata only; the PDF itself is downloadable from the orders page
    'invoices', (
      SELECT COALESCE(jsonb_agg((to_jsonb(i) - 'pdf_bucket' - 'pdf_path') ORDER BY i.issued_at), '[]'::jsonb)
      FROM public.invoices i
      WHERE i.user_id = v_uid
         OR i.order_id IN (SELECT id FROM public.orders WHERE user_id = v_uid)
    ),

    'carts', (
      SELECT COALESCE(jsonb_agg(
        to_jsonb(c) || jsonb_build_object(
          'items', (
            SELECT COALESCE(jsonb_agg(to_jsonb(ci) ORDER BY ci.created_at), '[]'::jsonb)
            FROM public.cart_items ci WHERE ci.cart_id = c.id
          )
        ) ORDER BY c.created_at
      ), '[]'::jsonb)
      FROM public.carts c
      WHERE c.user_id = v_uid
    ),

    'credits', jsonb_build_object(
      'balance', (SELECT uc.credits FROM public.user_credits uc WHERE uc.user_id = v_uid),
      'transactions', (
        SELECT COALESCE(jsonb_agg(to_jsonb(ct) ORDER BY ct.created_at), '[]'::jsonb)
        FROM public.credit_transactions ct WHERE ct.user_id = v_uid
      )
    ),

    'custom_products', (
      SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at), '[]'::jsonb)
      FROM public.products p WHERE p.user_id = v_uid
    ),

    'uploads', (
      SELECT COALESCE(jsonb_agg(to_jsonb(u) ORDER BY u.created_at), '[]'::jsonb)
      FROM public.user_uploads u WHERE u.user_id = v_uid
    ),

    'ai_generations', (
      SELECT COALESCE(jsonb_agg(to_jsonb(g) ORDER BY g.created_at), '[]'::jsonb)
      FROM public.ai_generations g WHERE g.user_id = v_uid
    )
  );
END;
$$;

COMMENT ON FUNCTION public.export_own_data() IS
  'GDPR data export for the calling user (auth.uid()). Returns profile, addresses, orders, payments, invoices metadata, carts, credits, custom products, uploads and AI generations.';

REVOKE ALL ON FUNCTION public.export_own_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.export_own_data() TO authenticated, service_role;
