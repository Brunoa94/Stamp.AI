-- =====================================================
-- Fix: Refunds Table & process_refund_atomic Function
-- Created: 2026-08-19
-- Description:
--   Repair migration to ensure:
--   1. The refunds table exists
--   2. The process_refund_atomic function has the correct 6-parameter signature
--
--   This is needed because migration 20260813000000 was recorded but the
--   actual schema changes may not have been applied correctly.
-- =====================================================

-- =====================================================
-- REFUNDS TABLE
-- Stores all refund transactions with full audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- References
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Provider information
    payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'paypal', 'mollie')),
    provider_refund_id TEXT NOT NULL,

    -- Refund details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    reason TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),

    -- Metadata for additional provider-specific data
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    refunded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_transaction_id ON refunds(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_provider_refund_id ON refunds(provider_refund_id);
CREATE INDEX IF NOT EXISTS idx_refunds_refunded_at ON refunds(refunded_at DESC);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Prevent duplicate refunds for the same order (only one completed refund per order)
CREATE UNIQUE INDEX IF NOT EXISTS idx_refunds_order_completed
ON refunds(order_id)
WHERE status = 'completed';

-- updated_at trigger
DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Users can view refunds for their own orders
DROP POLICY IF EXISTS "Users can view refunds for their orders" ON refunds;
CREATE POLICY "Users can view refunds for their orders" ON refunds
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = refunds.order_id
        AND orders.user_id = auth.uid()
    )
);

-- Service role can manage all refunds
DROP POLICY IF EXISTS "Service role can manage all refunds" ON refunds;
CREATE POLICY "Service role can manage all refunds" ON refunds
FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE refunds IS 'Stores all refund transactions with full audit trail';
COMMENT ON COLUMN refunds.provider_refund_id IS 'The refund ID returned by the payment provider (Stripe/PayPal/Mollie)';
COMMENT ON COLUMN refunds.amount IS 'Refund amount in the specified currency';

-- =====================================================
-- UPDATED process_refund_atomic FUNCTION
-- 6-parameter version that:
--   - Inserts into refunds table
--   - Updates orders.payment_status to 'refunded'
--   - Voids the associated invoice
-- =====================================================
CREATE OR REPLACE FUNCTION public.process_refund_atomic(
  p_order_id text,
  p_refund_id text,
  p_reason text,
  p_payment_provider text,
  p_amount DECIMAL DEFAULT NULL,
  p_currency TEXT DEFAULT 'USD'
)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
  v_order_uuid UUID;
  v_order_record orders%ROWTYPE;
  v_transaction_id UUID;
  v_transaction_amount DECIMAL(10,2);
  v_invoice_id UUID;
  v_refund_id UUID;
  v_rows_affected INTEGER;
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
      'refund_logged', false,
      'invoice_voided', false,
      'note', 'Temporary order - only transaction updated'
    );
  END IF;

  -- Validate order_id format
  BEGIN
    v_order_uuid = p_order_id::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid order_id format: %', p_order_id;
  END;

  -- Get the order record for amount if not provided
  SELECT * INTO v_order_record FROM orders WHERE id = v_order_uuid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- Get the payment transaction for this order
  SELECT id, amount INTO v_transaction_id, v_transaction_amount
  FROM payment_transactions
  WHERE order_id = v_order_uuid
    AND status IN ('succeeded', 'refunded')
  ORDER BY created_at DESC
  LIMIT 1;

  -- Mark the transaction refunded
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

  -- Update orders.payment_status to 'refunded'
  UPDATE orders
  SET payment_status = 'refunded',
      updated_at = NOW()
  WHERE id = v_order_uuid;

  -- Void the associated invoice (if exists)
  UPDATE invoices
  SET status = 'void',
      updated_at = NOW()
  WHERE order_id = v_order_uuid
    AND status = 'issued'
  RETURNING id INTO v_invoice_id;

  -- Insert into refunds table
  INSERT INTO refunds (
    order_id,
    payment_transaction_id,
    invoice_id,
    payment_provider,
    provider_refund_id,
    amount,
    currency,
    reason,
    status,
    metadata
  ) VALUES (
    v_order_uuid,
    v_transaction_id,
    v_invoice_id,
    p_payment_provider,
    p_refund_id,
    COALESCE(p_amount, v_transaction_amount, v_order_record.total_amount),
    COALESCE(p_currency, v_order_record.currency, 'USD'),
    p_reason,
    'completed',
    jsonb_build_object(
      'order_number', v_order_record.order_number,
      'customer_email', v_order_record.customer_email
    )
  )
  RETURNING id INTO v_refund_id;

  RETURN jsonb_build_object(
    'success', true,
    'transactions_updated', v_rows_affected,
    'orders_updated', 1,
    'order_id', v_order_uuid,
    'refund_id', p_refund_id,
    'refund_record_id', v_refund_id,
    'refund_logged', true,
    'invoice_voided', v_invoice_id IS NOT NULL,
    'invoice_id', v_invoice_id,
    'payment_status', 'refunded',
    'note', 'Refund logged, payment_status set to refunded, invoice voided'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Atomic refund failed for order %: %', p_order_id, SQLERRM;
END;
$function$;

COMMENT ON FUNCTION process_refund_atomic(text, text, text, text, DECIMAL, TEXT) IS 'Atomically processes a refund: updates payment_transactions to refunded, sets orders.payment_status to refunded, voids invoice, and logs refund in the refunds table.';

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Migration complete: refunds table and process_refund_atomic function are now available with 6-parameter signature';
END $$;
