-- =====================================================
-- Webhook upserts merge payment metadata instead of replacing it
-- =====================================================
-- The payment functions store the server-priced checkout (priced_items,
-- totals, promo_code) in payment_transactions.metadata. The Stripe and PayPal
-- webhook upserts replaced the whole column with provider metadata on success,
-- dropping that record, so fulfilment could no longer verify the paid items.
-- Existing keys now win; provider metadata only adds new keys. Signatures,
-- SECURITY DEFINER and grants are unchanged.
-- =====================================================

CREATE OR REPLACE FUNCTION "public"."upsert_stripe_payment_transaction"("p_stripe_payment_intent_id" "text", "p_user_id" "uuid", "p_stripe_customer_id" "text", "p_amount" numeric, "p_currency" "text", "p_status" "text", "p_payment_method_type" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_order_id" "uuid" DEFAULT NULL::"uuid") RETURNS "public"."payment_transactions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_payment payment_transactions;
BEGIN
  -- UPSERT: Insert or update on conflict
  INSERT INTO payment_transactions (
    user_id,
    order_id,
    payment_provider,
    stripe_payment_intent_id,
    stripe_customer_id,
    amount,
    currency,
    status,
    payment_method_type,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_order_id,
    'stripe',
    p_stripe_payment_intent_id,
    p_stripe_customer_id,
    p_amount,
    p_currency,
    p_status,
    p_payment_method_type,
    p_metadata,
    NOW(),
    NOW()
  )
  ON CONFLICT (stripe_payment_intent_id)
  DO UPDATE SET
    user_id = COALESCE(EXCLUDED.user_id, payment_transactions.user_id),
    order_id = COALESCE(EXCLUDED.order_id, payment_transactions.order_id),
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, payment_transactions.stripe_customer_id),
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    payment_method_type = COALESCE(EXCLUDED.payment_method_type, payment_transactions.payment_method_type),
    metadata = COALESCE(EXCLUDED.metadata, '{}'::jsonb) || COALESCE(payment_transactions.metadata, '{}'::jsonb),
    updated_at = NOW()
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."upsert_paypal_payment_transaction"("p_paypal_order_id" "text", "p_user_id" "uuid", "p_order_id" "uuid", "p_amount" numeric, "p_currency" "text", "p_status" "text", "p_paypal_capture_id" "text" DEFAULT NULL::"text", "p_paypal_payer_id" "text" DEFAULT NULL::"text", "p_paypal_payer_email" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."payment_transactions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_payment payment_transactions;
BEGIN
  -- UPSERT: Insert or update on conflict
  INSERT INTO payment_transactions (
    user_id,
    order_id,
    payment_provider,
    paypal_order_id,
    paypal_capture_id,
    paypal_payer_id,
    paypal_payer_email,
    amount,
    currency,
    status,
    payment_method_type,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_order_id,
    'paypal',
    p_paypal_order_id,
    p_paypal_capture_id,
    p_paypal_payer_id,
    p_paypal_payer_email,
    p_amount,
    p_currency,
    p_status,
    'paypal',
    p_metadata,
    NOW(),
    NOW()
  )
  ON CONFLICT (paypal_order_id)
  DO UPDATE SET
    user_id = COALESCE(EXCLUDED.user_id, payment_transactions.user_id),
    order_id = COALESCE(EXCLUDED.order_id, payment_transactions.order_id),
    paypal_capture_id = COALESCE(EXCLUDED.paypal_capture_id, payment_transactions.paypal_capture_id),
    paypal_payer_id = COALESCE(EXCLUDED.paypal_payer_id, payment_transactions.paypal_payer_id),
    paypal_payer_email = COALESCE(EXCLUDED.paypal_payer_email, payment_transactions.paypal_payer_email),
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    metadata = COALESCE(EXCLUDED.metadata, '{}'::jsonb) || COALESCE(payment_transactions.metadata, '{}'::jsonb),
    updated_at = NOW()
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

