-- =====================================================
-- Add Atomic Operations and Database Constraints
-- Created: 2026-04-13
-- Description: Ensures database consistency and atomicity
-- =====================================================

-- =====================================================
-- 1. ATOMIC REFUND OPERATION
-- =====================================================

-- Function to process refunds atomically
-- This ensures payment_transactions and orders are updated together
-- Either both succeed or both rollback
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

  -- ATOMIC OPERATION: Both updates succeed or both rollback

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

  -- Update orders
  UPDATE orders
  SET payment_status = 'refunded',
      updated_at = NOW()
  WHERE id = v_order_uuid
    AND payment_status != 'refunded';

  v_result = jsonb_build_object(
    'success', true,
    'transactions_updated', v_rows_affected,
    'orders_updated', 1,
    'order_id', v_order_uuid
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RAISE EXCEPTION 'Atomic refund failed for order %: %', p_order_id, SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_refund_atomic IS
  'Atomically updates payment_transactions and orders for refunds. Either both succeed or both rollback.';

-- =====================================================
-- 2. ATOMIC ORDER STATUS UPDATE
-- =====================================================

-- Function to update order and payment status atomically
CREATE OR REPLACE FUNCTION update_order_payment_status_atomic(
  p_order_id UUID,
  p_payment_status TEXT,
  p_order_status TEXT,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Validate status values
  IF p_payment_status NOT IN ('pending', 'paid', 'failed', 'refunded', 'canceled') THEN
    RAISE EXCEPTION 'Invalid payment_status: %', p_payment_status;
  END IF;

  IF p_order_status NOT IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid order_status: %', p_order_status;
  END IF;

  -- ATOMIC OPERATION: Update order with both statuses
  UPDATE orders
  SET payment_status = p_payment_status,
      status = p_order_status,
      payment_method = COALESCE(p_payment_method, payment_method),
      updated_at = NOW()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  v_result = jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'payment_status', p_payment_status,
    'status', p_order_status
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Atomic order status update failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_order_payment_status_atomic IS
  'Atomically updates both payment_status and status for an order.';

-- =====================================================
-- 3. FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraint for payment_transactions -> orders
-- Use SET NULL on delete to prevent orphaned transactions from blocking order deletion
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS fk_payment_transactions_order;

ALTER TABLE payment_transactions
  ADD CONSTRAINT fk_payment_transactions_order
  FOREIGN KEY (order_id)
  REFERENCES orders(id)
  ON DELETE SET NULL;

COMMENT ON CONSTRAINT fk_payment_transactions_order ON payment_transactions IS
  'Ensures order_id references a valid order. Sets to NULL if order is deleted.';

-- =====================================================
-- 4. CHECK CONSTRAINTS
-- =====================================================

-- Ensure valid payment_status values in orders
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS check_valid_payment_status;

ALTER TABLE orders
  ADD CONSTRAINT check_valid_payment_status
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'canceled'));

-- Ensure valid status values in orders
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS check_valid_order_status;

ALTER TABLE orders
  ADD CONSTRAINT check_valid_order_status
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Ensure valid status values in payment_transactions
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS check_valid_transaction_status;

ALTER TABLE payment_transactions
  ADD CONSTRAINT check_valid_transaction_status
  CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'canceled'));

-- =====================================================
-- 5. WEBHOOK IDEMPOTENCY TABLE
-- =====================================================

-- Create table to track processed webhooks
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Webhook identification
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'mollie')),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,

  -- Payload
  payload JSONB,

  -- Processing status
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  processing_status TEXT DEFAULT 'processed' CHECK (processing_status IN ('processed', 'failed', 'duplicate')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to prevent duplicate webhook processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_provider_event_id
  ON webhook_events(provider, event_id);

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at
  ON webhook_events(created_at DESC);

COMMENT ON TABLE webhook_events IS
  'Tracks processed webhooks to prevent duplicate processing (idempotency).';

-- Function to check if webhook was already processed
CREATE OR REPLACE FUNCTION is_webhook_processed(
  p_provider TEXT,
  p_event_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM webhook_events
    WHERE provider = p_provider
      AND event_id = p_event_id
  ) INTO v_exists;

  RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to record webhook processing
CREATE OR REPLACE FUNCTION record_webhook_event(
  p_provider TEXT,
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_webhook_id UUID;
BEGIN
  INSERT INTO webhook_events (provider, event_id, event_type, payload)
  VALUES (p_provider, p_event_id, p_event_type, p_payload)
  ON CONFLICT (provider, event_id) DO UPDATE
    SET processed_at = NOW(),
        processing_status = 'duplicate'
  RETURNING id INTO v_webhook_id;

  RETURN v_webhook_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. STATUS ALIGNMENT TRIGGER
-- =====================================================

-- Function to warn about misaligned statuses
CREATE OR REPLACE FUNCTION check_order_status_alignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment_status is 'paid', status should eventually be 'confirmed' or beyond
  IF NEW.payment_status = 'paid' AND NEW.status = 'pending' THEN
    -- Allow temporary misalignment (order just created)
    -- But log a warning if it's been more than 5 minutes
    IF NEW.created_at < NOW() - INTERVAL '5 minutes' THEN
      RAISE WARNING 'Order % has payment_status=paid but status=pending for > 5 minutes', NEW.id;
    END IF;
  END IF;

  -- If payment_status is 'refunded', order should be cancelled
  IF NEW.payment_status = 'refunded' AND NEW.status NOT IN ('cancelled', 'pending') THEN
    RAISE WARNING 'Order % has payment_status=refunded but status=%', NEW.id, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_alignment_check ON orders;
CREATE TRIGGER order_status_alignment_check
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_order_status_alignment();

-- =====================================================
-- 7. CLEANUP FUNCTION FOR OLD WEBHOOK EVENTS
-- =====================================================

-- Function to clean up old webhook events (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM webhook_events
  WHERE created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_webhook_events IS
  'Deletes webhook events older than 30 days. Should be run via cron job.';

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated and service roles
GRANT EXECUTE ON FUNCTION process_refund_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_order_payment_status_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_webhook_processed TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_webhook_event TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_webhook_events TO service_role;

-- Grant table permissions
GRANT SELECT, INSERT ON webhook_events TO authenticated, service_role;
GRANT DELETE ON webhook_events TO service_role;

-- =====================================================
-- 9. ENABLE RLS ON WEBHOOK_EVENTS
-- =====================================================

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role can manage all webhook events
DROP POLICY IF EXISTS "Service role can manage webhook events" ON webhook_events;
CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  USING (auth.role() = 'service_role');

-- Users cannot directly access webhook events
DROP POLICY IF EXISTS "Users cannot access webhook events" ON webhook_events;
CREATE POLICY "Users cannot access webhook events"
  ON webhook_events FOR SELECT
  USING (false);
