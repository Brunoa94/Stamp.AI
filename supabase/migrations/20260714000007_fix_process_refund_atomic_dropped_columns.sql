/**
 * Fix process_refund_atomic: it referenced orders columns that no longer exist.
 *
 * The function (from 20260620000000) does:
 *   UPDATE orders SET refund_failed = false, internal_notes = ... WHERE id = ...
 * but `internal_notes` was dropped in 20260621000000_cleanup_unused_schema and
 * `refund_failed` does not exist on orders. So every refund on a real order threw
 * "column internal_notes does not exist", rolling back the payment_transactions
 * status='refunded' update — refunds never recorded.
 *
 * The refund id/reason are already tracked in payment_transactions.metadata, so the
 * orders write only needs to touch updated_at. payment_status is intentionally left
 * as 'paid' (payment was captured; the refund is tracked on the transaction).
 */

CREATE OR REPLACE FUNCTION public.process_refund_atomic(
  p_order_id text,
  p_refund_id text,
  p_reason text,
  p_payment_provider text
)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
  v_order_uuid UUID;
  v_rows_affected INTEGER;
  v_result JSON;
BEGIN
  -- If it starts with "temp_", it's not a real order; only update payment_transactions
  IF p_order_id LIKE 'temp_%' THEN
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

    RETURN jsonb_build_object(
      'success', true,
      'transactions_updated', v_rows_affected,
      'orders_updated', 0,
      'note', 'Temporary order - only transaction updated'
    );
  END IF;

  BEGIN
    v_order_uuid = p_order_id::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid order_id format: %', p_order_id;
  END;

  -- Mark the transaction refunded. Keep orders.payment_status as 'paid'
  -- (payment was captured); the refund is tracked on the transaction row.
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

  UPDATE orders
  SET updated_at = NOW()
  WHERE id = v_order_uuid;

  RETURN jsonb_build_object(
    'success', true,
    'transactions_updated', v_rows_affected,
    'orders_updated', 1,
    'order_id', v_order_uuid,
    'refund_id', p_refund_id,
    'note', 'Payment status kept as paid, transaction marked as refunded'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Atomic refund failed for order %: %', p_order_id, SQLERRM;
END;
$function$;
