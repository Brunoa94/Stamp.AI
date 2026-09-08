/**
 * Add order_id parameter to upsert_stripe_payment_transaction
 *
 * The Stripe payment upsert function was missing the order_id parameter,
 * which meant payment_transactions.order_id was never set for Stripe payments.
 * This caused cancel-order to fail to find the payment transaction when
 * processing refunds, since it queries by order_id.
 *
 * This migration updates the function to accept and store order_id.
 */

-- Drop the old function signature first to avoid ambiguity
DROP FUNCTION IF EXISTS upsert_stripe_payment_transaction(TEXT, UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION upsert_stripe_payment_transaction(
  p_stripe_payment_intent_id TEXT,
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_status TEXT,
  p_payment_method_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_order_id UUID DEFAULT NULL
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
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
  RETURNING * INTO v_payment;

  RETURN v_payment;
END;
$$;

COMMENT ON FUNCTION upsert_stripe_payment_transaction(TEXT, UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, JSONB, UUID) IS
  'Atomically inserts or updates a Stripe payment transaction with order_id support, preventing webhook/creation race conditions';
