/**
 * Atomic Payment Capture Stored Procedure
 *
 * Ensures payment transaction and order updates happen atomically
 * Prevents scenario where payment is marked successful but order stays pending
 */

-- ============================================================================
-- 1. Atomic PayPal Payment Capture
-- ============================================================================

CREATE OR REPLACE FUNCTION atomic_paypal_payment_capture(
  p_paypal_order_id TEXT,
  p_paypal_capture_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_captured_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_record payment_transactions%ROWTYPE;
  v_order_record orders%ROWTYPE;
  v_result JSON;
BEGIN
  -- Start transaction (implicit in function)

  -- Step 1: Update payment transaction
  UPDATE payment_transactions
  SET
    status = 'succeeded',
    paypal_capture_id = p_paypal_capture_id,
    amount = p_amount,
    currency = p_currency,
    captured_at = p_captured_at,
    updated_at = NOW()
  WHERE paypal_order_id = p_paypal_order_id
  RETURNING * INTO v_payment_record;

  -- Check if payment record was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment transaction not found for PayPal order: %', p_paypal_order_id;
  END IF;

  -- Step 2: Update order payment status (if order_id exists)
  IF v_payment_record.order_id IS NOT NULL THEN
    UPDATE orders
    SET
      payment_status = 'paid',
      updated_at = NOW()
    WHERE id = v_payment_record.order_id
    RETURNING * INTO v_order_record;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Order not found for payment: %', v_payment_record.order_id;
    END IF;
  END IF;

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'payment_id', v_payment_record.id,
    'order_id', v_payment_record.order_id,
    'status', v_payment_record.status
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception
    RAISE EXCEPTION 'Atomic payment capture failed: %', SQLERRM;
END;
$$;

-- ============================================================================
-- 2. Atomic Stripe Payment Capture
-- ============================================================================

CREATE OR REPLACE FUNCTION atomic_stripe_payment_capture(
  p_stripe_payment_intent_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_captured_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_record payment_transactions%ROWTYPE;
  v_order_record orders%ROWTYPE;
  v_result JSON;
BEGIN
  -- Step 1: Update payment transaction
  UPDATE payment_transactions
  SET
    status = 'succeeded',
    amount = p_amount,
    currency = p_currency,
    captured_at = p_captured_at,
    updated_at = NOW()
  WHERE stripe_payment_intent_id = p_stripe_payment_intent_id
  RETURNING * INTO v_payment_record;

  -- Check if payment record was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment transaction not found for Stripe payment intent: %', p_stripe_payment_intent_id;
  END IF;

  -- Step 2: Update order payment status (if order_id exists)
  IF v_payment_record.order_id IS NOT NULL THEN
    UPDATE orders
    SET
      payment_status = 'paid',
      updated_at = NOW()
    WHERE id = v_payment_record.order_id
    RETURNING * INTO v_order_record;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Order not found for payment: %', v_payment_record.order_id;
    END IF;
  END IF;

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'payment_id', v_payment_record.id,
    'order_id', v_payment_record.order_id,
    'status', v_payment_record.status
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Atomic payment capture failed: %', SQLERRM;
END;
$$;

-- ============================================================================
-- 3. Atomic Mollie Payment Capture
-- ============================================================================

CREATE OR REPLACE FUNCTION atomic_mollie_payment_capture(
  p_mollie_payment_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_captured_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_record payment_transactions%ROWTYPE;
  v_order_record orders%ROWTYPE;
  v_result JSON;
BEGIN
  -- Step 1: Update payment transaction
  UPDATE payment_transactions
  SET
    status = 'succeeded',
    amount = p_amount,
    currency = p_currency,
    captured_at = p_captured_at,
    updated_at = NOW()
  WHERE mollie_payment_id = p_mollie_payment_id
  RETURNING * INTO v_payment_record;

  -- Check if payment record was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment transaction not found for Mollie payment: %', p_mollie_payment_id;
  END IF;

  -- Step 2: Update order payment status (if order_id exists)
  IF v_payment_record.order_id IS NOT NULL THEN
    UPDATE orders
    SET
      payment_status = 'paid',
      updated_at = NOW()
    WHERE id = v_payment_record.order_id
    RETURNING * INTO v_order_record;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Order not found for payment: %', v_payment_record.order_id;
    END IF;
  END IF;

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'payment_id', v_payment_record.id,
    'order_id', v_payment_record.order_id,
    'status', v_payment_record.status
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Atomic payment capture failed: %', SQLERRM;
END;
$$;

-- ============================================================================
-- 4. Comments for documentation
-- ============================================================================



