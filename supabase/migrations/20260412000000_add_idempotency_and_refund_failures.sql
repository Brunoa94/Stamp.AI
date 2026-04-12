-- =====================================================
-- Add Idempotency Support and Refund Failures Tracking
-- Created: 2026-04-12
-- Description: Prevents duplicate orders and tracks refund failures
-- =====================================================

-- =====================================================
-- 1. ADD IDEMPOTENCY KEY TO ORDERS TABLE
-- =====================================================

-- Add idempotency_key column to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create unique index on idempotency_key (allows NULL values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key_not_null
  ON orders(idempotency_key);

-- Add comment for documentation
COMMENT ON COLUMN orders.idempotency_key IS
  'Idempotency key format: {provider}_{payment_id}. Prevents duplicate orders for same payment.';

-- =====================================================
-- 2. CREATE REFUND FAILURES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS refund_failures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Payment Information
  payment_id TEXT NOT NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'paypal', 'mollie')),
  order_id TEXT,

  -- Refund Details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  reason TEXT,

  -- Error Information
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Status Tracking
  status TEXT DEFAULT 'pending_manual_review'
    CHECK (status IN (
      'pending_manual_review',
      'pending_settlement',
      'retrying',
      'resolved',
      'customer_contacted',
      'refunded_manually'
    )),

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,
  manual_refund_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  next_retry_at TIMESTAMPTZ
);

-- Indexes for refund_failures
CREATE INDEX IF NOT EXISTS idx_refund_failures_payment_id
  ON refund_failures(payment_id);

CREATE INDEX IF NOT EXISTS idx_refund_failures_status
  ON refund_failures(status);

CREATE INDEX IF NOT EXISTS idx_refund_failures_created_at
  ON refund_failures(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_refund_failures_next_retry
  ON refund_failures(next_retry_at)
  WHERE status = 'retrying' AND next_retry_at IS NOT NULL;

-- Enable RLS on refund_failures
ALTER TABLE refund_failures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for refund_failures
DROP POLICY IF EXISTS "Service role can manage all refund failures" ON refund_failures;
CREATE POLICY "Service role can manage all refund failures"
  ON refund_failures FOR ALL
  USING (auth.role() = 'service_role');

-- Users cannot directly access refund_failures (admin-only table)
DROP POLICY IF EXISTS "Users cannot access refund failures" ON refund_failures;
CREATE POLICY "Users cannot access refund failures"
  ON refund_failures FOR SELECT
  USING (false);

-- Add updated_at trigger
CREATE TRIGGER update_refund_failures_updated_at
  BEFORE UPDATE ON refund_failures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CREATE STATUS RECONCILIATION TABLE
-- =====================================================

-- Track cases where Printify order succeeds but status update fails
CREATE TABLE IF NOT EXISTS order_status_reconciliation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

  -- Expected vs Actual Status
  expected_status TEXT NOT NULL,
  actual_status TEXT,

  -- Printify Information
  printify_order_id TEXT,
  printify_status TEXT,

  -- Error Details
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Status
  reconciliation_status TEXT DEFAULT 'pending'
    CHECK (reconciliation_status IN ('pending', 'reconciled', 'manual_review_required')),

  -- Resolution
  reconciled_at TIMESTAMPTZ,
  reconciled_by TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_status_reconciliation_order_id
  ON order_status_reconciliation(order_id);

CREATE INDEX IF NOT EXISTS idx_status_reconciliation_status
  ON order_status_reconciliation(reconciliation_status);

-- Enable RLS
ALTER TABLE order_status_reconciliation ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Service role can manage status reconciliation" ON order_status_reconciliation;
CREATE POLICY "Service role can manage status reconciliation"
  ON order_status_reconciliation FOR ALL
  USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE TRIGGER update_status_reconciliation_updated_at
  BEFORE UPDATE ON order_status_reconciliation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ADD HELPER FUNCTIONS
-- =====================================================

-- Function to check if order exists by idempotency key
CREATE OR REPLACE FUNCTION get_order_by_idempotency_key(key TEXT)
RETURNS UUID AS $$
DECLARE
  order_uuid UUID;
BEGIN
  SELECT id INTO order_uuid
  FROM orders
  WHERE idempotency_key = key
  LIMIT 1;

  RETURN order_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create refund failure alert
CREATE OR REPLACE FUNCTION create_refund_failure_alert(
  p_payment_id TEXT,
  p_payment_provider TEXT,
  p_order_id TEXT,
  p_amount DECIMAL,
  p_error_message TEXT,
  p_retry_count INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  failure_id UUID;
BEGIN
  INSERT INTO refund_failures (
    payment_id,
    payment_provider,
    order_id,
    amount,
    error_message,
    retry_count,
    status,
    next_retry_at
  ) VALUES (
    p_payment_id,
    p_payment_provider,
    p_order_id,
    p_amount,
    p_error_message,
    p_retry_count,
    CASE
      WHEN p_retry_count < 3 THEN 'retrying'
      ELSE 'pending_manual_review'
    END,
    CASE
      WHEN p_retry_count < 3 THEN NOW() + INTERVAL '5 minutes' * POWER(2, p_retry_count)
      ELSE NULL
    END
  ) RETURNING id INTO failure_id;

  RETURN failure_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE refund_failures IS
  'Tracks refund attempts that failed. Critical for preventing customer charges without orders.';

COMMENT ON TABLE order_status_reconciliation IS
  'Tracks cases where order status in DB differs from Printify status. Used for reconciliation.';

COMMENT ON FUNCTION get_order_by_idempotency_key(TEXT) IS
  'Returns order UUID for given idempotency key. Used to prevent duplicate order creation.';

COMMENT ON FUNCTION create_refund_failure_alert IS
  'Creates a refund failure record with automatic retry scheduling based on retry count.';
