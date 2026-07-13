/**
 * Atomic Order Cancellation + Refund
 *
 * Ensures order cancellation and refund happen atomically
 * Prevents scenario where order is cancelled but refund fails
 */

-- ============================================================================
-- 0. Columns the cancellation flow needs (written by the cancel-order edge fn)
-- ============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- ============================================================================
-- 1. Atomic Order Cancellation with Refund
-- ============================================================================

CREATE OR REPLACE FUNCTION cancel_order_with_refund_atomic(
  p_order_id UUID,
  p_refund_amount NUMERIC,
  p_refund_provider TEXT,
  p_refund_external_id TEXT,
  p_cancellation_reason TEXT DEFAULT 'customer_request'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_record orders%ROWTYPE;
  v_payment_record payment_transactions%ROWTYPE;
  v_result JSON;
BEGIN
  -- Start transaction (implicit in function)

  -- Step 1: Validate order exists and can be cancelled
  SELECT * INTO v_order_record
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  IF v_order_record.status = 'cancelled' THEN
    RAISE EXCEPTION 'Order already cancelled: %', p_order_id;
  END IF;

  IF v_order_record.payment_status != 'paid' THEN
    RAISE EXCEPTION 'Cannot refund order that is not paid: %', p_order_id;
  END IF;

  -- Step 2: Create refund record
  INSERT INTO payment_transactions (
    user_id,
    order_id,
    payment_provider,
    amount,
    currency,
    status,
    payment_method_type,
    metadata,
    created_at,
    updated_at
  )
  SELECT
    user_id,
    p_order_id,
    payment_provider,
    p_refund_amount * -1, -- Negative amount for refund
    currency,
    'refund_pending',
    'refund',
    jsonb_build_object(
      'original_payment_id', id,
      'refund_external_id', p_refund_external_id,
      'cancellation_reason', p_cancellation_reason
    ),
    NOW(),
    NOW()
  FROM payment_transactions
  WHERE order_id = p_order_id
    AND status = 'succeeded'
    AND amount > 0
  LIMIT 1
  RETURNING * INTO v_payment_record;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No successful payment found for order: %', p_order_id;
  END IF;

  -- Step 3: Update order status to cancelled
  UPDATE orders
  SET
    status = 'cancelled',
    payment_status = 'refunded',
    cancellation_reason = p_cancellation_reason,
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'order_id', p_order_id,
    'refund_id', v_payment_record.id,
    'refund_amount', p_refund_amount,
    'order_status', 'cancelled',
    'payment_status', 'refunded'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception
    RAISE EXCEPTION 'Atomic order cancellation failed for order %: %', p_order_id, SQLERRM;
END;
$$;

-- ============================================================================
-- 2. Update Refund Status (After External Refund Completes)
-- ============================================================================

CREATE OR REPLACE FUNCTION confirm_refund_completed(
  p_refund_id UUID,
  p_refund_external_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_refund_record payment_transactions%ROWTYPE;
  v_result JSON;
BEGIN
  -- Update refund status to succeeded
  UPDATE payment_transactions
  SET
    status = 'succeeded',
    metadata = metadata || jsonb_build_object(
      'refund_external_id', p_refund_external_id,
      'refund_completed_at', NOW()
    ),
    updated_at = NOW()
  WHERE id = p_refund_id
    AND payment_method_type = 'refund'
    AND status = 'refund_pending'
  RETURNING * INTO v_refund_record;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Refund not found or already completed: %', p_refund_id;
  END IF;

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'refund_id', p_refund_id,
    'order_id', v_refund_record.order_id,
    'status', 'succeeded'
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 3. Handle Refund Failure (Rollback Order Cancellation)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_refund_failure(
  p_order_id UUID,
  p_error_message TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Revert order status
  UPDATE orders
  SET
    status = 'confirmed', -- Or previous status
    payment_status = 'paid',
    cancellation_reason = NULL,
    cancelled_at = NULL,
    updated_at = NOW()
  WHERE id = p_order_id
    AND status = 'cancelled';

  -- Mark refund as failed
  UPDATE payment_transactions
  SET
    status = 'failed',
    metadata = metadata || jsonb_build_object(
      'error_message', p_error_message,
      'failed_at', NOW()
    ),
    updated_at = NOW()
  WHERE order_id = p_order_id
    AND payment_method_type = 'refund'
    AND status = 'refund_pending';

  -- Return result
  v_result := json_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_status', 'confirmed',
    'payment_status', 'paid',
    'refund_status', 'failed'
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 4. Comments for documentation
-- ============================================================================

COMMENT ON FUNCTION cancel_order_with_refund_atomic IS
  'Atomically cancels an order and creates a pending refund transaction.';
COMMENT ON FUNCTION confirm_refund_completed IS
  'Marks refund as completed after external payment provider confirms refund.';
COMMENT ON FUNCTION handle_refund_failure IS
  'Reverts order cancellation if refund fails at payment provider.';
