/**
 * Payment Transaction UPSERT Functions
 *
 * Atomic UPSERT operations for webhook processing
 * Prevents race conditions between webhook and payment creation
 */

-- ============================================================================
-- 1. Stripe Payment Intent UPSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_stripe_payment_transaction(
  p_stripe_payment_intent_id TEXT,
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_status TEXT,
  p_payment_method_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS payment_transactions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment payment_transactions;
BEGIN
  -- UPSERT: Insert or update on conflict
  INSERT INTO payment_transactions (
    user_id,
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
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, payment_transactions.stripe_customer_id),
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    payment_method_type = COALESCE(EXCLUDED.payment_method_type, payment_transactions.payment_method_type),
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

-- ============================================================================
-- 2. PayPal Order UPSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_paypal_payment_transaction(
  p_paypal_order_id TEXT,
  p_user_id UUID,
  p_order_id UUID,
  p_amount NUMERIC,
  p_currency TEXT,
  p_status TEXT,
  p_paypal_capture_id TEXT DEFAULT NULL,
  p_paypal_payer_id TEXT DEFAULT NULL,
  p_paypal_payer_email TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS payment_transactions
LANGUAGE plpgsql
SECURITY DEFINER
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
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

-- ============================================================================
-- 3. Mollie Payment UPSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_mollie_payment_transaction(
  p_mollie_payment_id TEXT,
  p_user_id UUID,
  p_order_id UUID,
  p_amount NUMERIC,
  p_currency TEXT,
  p_status TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS payment_transactions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment payment_transactions;
BEGIN
  -- UPSERT: Insert or update on conflict
  INSERT INTO payment_transactions (
    user_id,
    order_id,
    payment_provider,
    mollie_payment_id,
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
    'mollie',
    p_mollie_payment_id,
    p_amount,
    p_currency,
    p_status,
    'mollie',
    p_metadata,
    NOW(),
    NOW()
  )
  ON CONFLICT (mollie_payment_id)
  DO UPDATE SET
    user_id = COALESCE(EXCLUDED.user_id, payment_transactions.user_id),
    order_id = COALESCE(EXCLUDED.order_id, payment_transactions.order_id),
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

-- ============================================================================
-- 4. Atomic Webhook Event Recording
-- ============================================================================

CREATE OR REPLACE FUNCTION record_webhook_event_atomic(
  p_provider TEXT,
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_processed_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS webhook_events
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event webhook_events;
BEGIN
  -- Insert webhook event with unique constraint handling
  INSERT INTO webhook_events (
    provider,
    event_id,
    event_type,
    payload,
    processed_at,
    created_at
  ) VALUES (
    p_provider,
    p_event_id,
    p_event_type,
    p_payload,
    p_processed_at,
    NOW()
  )
  ON CONFLICT (provider, event_id) DO NOTHING
  RETURNING * INTO v_event;

  -- If RETURNING INTO returned nothing, event already exists
  IF v_event IS NULL THEN
    -- Fetch existing event
    SELECT * INTO v_event
    FROM webhook_events
    WHERE provider = p_provider AND event_id = p_event_id;
  END IF;

  RETURN v_event;
END;
$$;

-- ============================================================================
-- 5. Check if webhook was already processed (idempotency check)
-- ============================================================================

CREATE OR REPLACE FUNCTION is_webhook_event_processed(
  p_provider TEXT,
  p_event_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM webhook_events
    WHERE provider = p_provider AND event_id = p_event_id
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

-- ============================================================================
-- 6. Comments for documentation
-- ============================================================================





  'Checks if webhook event was already processed for idempotency';
