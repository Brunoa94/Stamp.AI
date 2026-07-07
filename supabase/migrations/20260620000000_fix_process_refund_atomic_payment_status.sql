-- =====================================================
-- Fix process_refund_atomic to NOT update orders.payment_status
-- Created: 2026-06-20
-- Description: Refund processing should keep orders.payment_status as 'paid'
--              since payment WAS successfully captured. Only the
--              payment_transactions.status should be 'refunded' to track
--              the refund. This prevents conflicting with the business logic
--              where payment_status accurately reflects capture state.
-- =====================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS process_refund_atomic(TEXT, TEXT, TEXT, TEXT);

-- Recreate with fixed logic
CREATE OR REPLACE FUNCTION process_refund_atomic(
  p_order_id TEXT,
  p_refund_id TEXT,
  p_reason TEXT,
  p_payment_provider TEXT
)
RETURNS JSON AS $$
DECLARE
  v_order_uuid UUID;
  v_rows_affected INTEGER;
  v_result JSON;
BEGIN
  -- Try to parse order_id as UUID
  -- If it starts with "temp_", it's not a real order, skip order update
  IF p_order_id LIKE 'temp_%' THEN
    -- Only update payment_transactions (no order exists yet)
    UPDATE payment_transactions
    SET status = 'refunded',
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
          'refund_id', p_refund_id,
          'refund_reason', p_reason
        ),
        updated_at = NOW()
    WHERE (
      (p_payment_provider = 'stripe' AND stripe_payment_intent_id IS NOT NULL) OR
      (p_payment_provider = 'paypal' AND paypal_capture_id IS NOT NULL) OR
      (p_payment_provider = 'mollie' AND mollie_payment_id IS NOT NULL)
    )
    AND status != 'refunded';

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

    v_result = jsonb_build_object(
      'success', true,
      'transactions_updated', v_rows_affected,
      'orders_updated', 0,
      'note', 'Temporary order - only transaction updated'
    );

    RETURN v_result;
  END IF;

  -- Parse as UUID for real orders
  BEGIN
    v_order_uuid = p_order_id::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid order_id format: %', p_order_id;
  END;

  -- ATOMIC OPERATION: Update payment_transactions only
  -- ✅ CRITICAL FIX: Do NOT update orders.payment_status
  -- The payment_status should remain 'paid' because payment WAS captured.
  -- Only the transaction status should be 'refunded' to track the refund.

  -- Update payment_transactions
  UPDATE payment_transactions
  SET status = 'refunded',
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'refund_id', p_refund_id,
        'refund_reason', p_reason
      ),
      updated_at = NOW()
  WHERE order_id = v_order_uuid
    AND status != 'refunded';

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  -- Update orders table: use existing refund tracking columns
  -- Do NOT change payment_status (keep as 'paid' since payment was captured)
  UPDATE orders
  SET refund_failed = false,
      internal_notes = COALESCE(internal_notes, '') ||
        E'\n[' || NOW() || '] Refund processed: ' || p_refund_id ||
        ' - Reason: ' || p_reason,
      updated_at = NOW()
  WHERE id = v_order_uuid;

  v_result = jsonb_build_object(
    'success', true,
    'transactions_updated', v_rows_affected,
    'orders_updated', 1,
    'order_id', v_order_uuid,
    'refund_id', p_refund_id,
    'note', 'Payment status kept as paid, transaction marked as refunded'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RAISE EXCEPTION 'Atomic refund failed for order %: %', p_order_id, SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_refund_atomic IS
  'Atomically updates payment_transactions to refunded status and logs refund in order metadata. Does NOT change orders.payment_status (keeps it as paid since payment was captured).';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION process_refund_atomic TO authenticated, service_role;
