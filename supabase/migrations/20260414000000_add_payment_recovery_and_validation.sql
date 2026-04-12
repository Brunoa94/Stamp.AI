-- =====================================================
-- Payment Recovery and Enhanced Validation
-- Created: 2026-04-14
-- Description: Adds payment recovery mechanism and amount validation tracking
-- =====================================================

-- =====================================================
-- 1. PAYMENT RECOVERY TABLE
-- =====================================================
-- Tracks successful payments that haven't been finalized into orders
-- Enables recovery from browser crashes, network failures, etc.

CREATE TABLE IF NOT EXISTS payment_recovery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Payment identification
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'paypal', 'mollie')),
  payment_intent_id TEXT NOT NULL,
  payment_status TEXT NOT NULL,

  -- User identification
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  session_id TEXT,

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Order context (stored for recovery)
  cart_snapshot JSONB, -- Full cart state at time of payment
  shipping_address JSONB, -- Shipping address
  line_items JSONB, -- Printify line items
  metadata JSONB, -- Additional metadata

  -- Recovery status
  recovery_status TEXT DEFAULT 'pending' CHECK (
    recovery_status IN ('pending', 'recovered', 'failed', 'cancelled')
  ),
  recovery_attempts INTEGER DEFAULT 0,
  last_recovery_attempt TIMESTAMPTZ,
  recovery_error TEXT,

  -- Associated order (set when recovery succeeds)
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  recovered_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_payment_recovery UNIQUE (payment_provider, payment_intent_id)
);

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_payment_recovery_user_id
  ON payment_recovery(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_recovery_status
  ON payment_recovery(recovery_status) WHERE recovery_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_payment_recovery_created
  ON payment_recovery(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_recovery_provider_intent
  ON payment_recovery(payment_provider, payment_intent_id);

COMMENT ON TABLE payment_recovery IS
  'Tracks successful payments that need order finalization. Enables recovery from crashes/failures.';

-- =====================================================
-- 2. AMOUNT VALIDATION FAILURES TABLE
-- =====================================================
-- Tracks payment amount mismatches for security monitoring

CREATE TABLE IF NOT EXISTS amount_validation_failures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Payment details
  payment_provider TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_currency TEXT NOT NULL,

  -- Expected vs actual
  expected_amount DECIMAL(10, 2) NOT NULL,
  difference DECIMAL(10, 2) NOT NULL,

  -- Context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,

  -- Validation details
  validation_context JSONB, -- Cart items, shipping, discounts
  error_message TEXT,

  -- Actions taken
  action_taken TEXT CHECK (action_taken IN ('refund_initiated', 'manual_review', 'ignored')),
  refund_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amount_validation_failures_created
  ON amount_validation_failures(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_amount_validation_failures_user
  ON amount_validation_failures(user_id);

COMMENT ON TABLE amount_validation_failures IS
  'Security audit log for payment amount mismatches. Used to detect price tampering attempts.';

-- =====================================================
-- 3. TEST MODE VIOLATIONS TABLE
-- =====================================================
-- Tracks instances where test mode was requested in production

CREATE TABLE IF NOT EXISTS test_mode_violations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Context
  violation_type TEXT NOT NULL CHECK (violation_type IN ('printify_order', 'payment_processing', 'other')),
  requested_test_mode BOOLEAN NOT NULL,
  enforced_test_mode BOOLEAN NOT NULL,

  -- Request details
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT,
  request_body JSONB,

  -- Environment
  environment TEXT,
  is_production BOOLEAN,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_mode_violations_created
  ON test_mode_violations(created_at DESC);

COMMENT ON TABLE test_mode_violations IS
  'Audit log for test mode violations in production. Critical for detecting misconfigurations.';

-- =====================================================
-- 4. FUNCTIONS FOR PAYMENT RECOVERY
-- =====================================================

-- Function to record a payment for recovery
CREATE OR REPLACE FUNCTION record_payment_for_recovery(
  p_payment_provider TEXT,
  p_payment_intent_id TEXT,
  p_payment_status TEXT,
  p_user_id UUID,
  p_user_email TEXT,
  p_amount DECIMAL,
  p_currency TEXT,
  p_cart_snapshot JSONB,
  p_shipping_address JSONB,
  p_line_items JSONB,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_recovery_id UUID;
BEGIN
  INSERT INTO payment_recovery (
    payment_provider,
    payment_intent_id,
    payment_status,
    user_id,
    user_email,
    amount,
    currency,
    cart_snapshot,
    shipping_address,
    line_items,
    metadata,
    recovery_status
  )
  VALUES (
    p_payment_provider,
    p_payment_intent_id,
    p_payment_status,
    p_user_id,
    p_user_email,
    p_amount,
    p_currency,
    p_cart_snapshot,
    p_shipping_address,
    p_line_items,
    p_metadata,
    'pending'
  )
  ON CONFLICT (payment_provider, payment_intent_id)
  DO UPDATE SET
    payment_status = EXCLUDED.payment_status,
    updated_at = NOW()
  RETURNING id INTO v_recovery_id;

  RETURN v_recovery_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark payment as recovered
CREATE OR REPLACE FUNCTION mark_payment_recovered(
  p_payment_intent_id TEXT,
  p_payment_provider TEXT,
  p_order_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE payment_recovery
  SET
    recovery_status = 'recovered',
    order_id = p_order_id,
    recovered_at = NOW(),
    updated_at = NOW()
  WHERE payment_intent_id = p_payment_intent_id
    AND payment_provider = p_payment_provider
    AND recovery_status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending recoveries for a user
CREATE OR REPLACE FUNCTION get_pending_payment_recoveries(
  p_user_id UUID,
  p_hours_ago INTEGER DEFAULT 24
)
RETURNS TABLE (
  id UUID,
  payment_provider TEXT,
  payment_intent_id TEXT,
  amount DECIMAL,
  currency TEXT,
  cart_snapshot JSONB,
  shipping_address JSONB,
  line_items JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    pr.payment_provider,
    pr.payment_intent_id,
    pr.amount,
    pr.currency,
    pr.cart_snapshot,
    pr.shipping_address,
    pr.line_items,
    pr.created_at
  FROM payment_recovery pr
  WHERE pr.user_id = p_user_id
    AND pr.recovery_status = 'pending'
    AND pr.created_at > NOW() - (p_hours_ago || ' hours')::INTERVAL
  ORDER BY pr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to increment recovery attempts
CREATE OR REPLACE FUNCTION increment_recovery_attempt(
  p_payment_intent_id TEXT,
  p_payment_provider TEXT,
  p_error TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_attempts INTEGER;
BEGIN
  UPDATE payment_recovery
  SET
    recovery_attempts = recovery_attempts + 1,
    last_recovery_attempt = NOW(),
    recovery_error = p_error,
    updated_at = NOW()
  WHERE payment_intent_id = p_payment_intent_id
    AND payment_provider = p_payment_provider
  RETURNING recovery_attempts INTO v_attempts;

  RETURN v_attempts;
END;
$$ LANGUAGE plpgsql;

-- Function to record amount validation failure
CREATE OR REPLACE FUNCTION record_amount_validation_failure(
  p_payment_provider TEXT,
  p_payment_intent_id TEXT,
  p_payment_amount DECIMAL,
  p_payment_currency TEXT,
  p_expected_amount DECIMAL,
  p_user_id UUID,
  p_validation_context JSONB,
  p_error_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_failure_id UUID;
BEGIN
  INSERT INTO amount_validation_failures (
    payment_provider,
    payment_intent_id,
    payment_amount,
    payment_currency,
    expected_amount,
    difference,
    user_id,
    validation_context,
    error_message,
    action_taken
  )
  VALUES (
    p_payment_provider,
    p_payment_intent_id,
    p_payment_amount,
    p_payment_currency,
    p_expected_amount,
    ABS(p_payment_amount - p_expected_amount),
    p_user_id,
    p_validation_context,
    p_error_message,
    'manual_review'
  )
  RETURNING id INTO v_failure_id;

  RETURN v_failure_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_payment_recovery_updated_at
  BEFORE UPDATE ON payment_recovery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Payment recovery functions
GRANT EXECUTE ON FUNCTION record_payment_for_recovery TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_payment_recovered TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_pending_payment_recoveries TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_recovery_attempt TO service_role;
GRANT EXECUTE ON FUNCTION record_amount_validation_failure TO service_role;

-- Table permissions
GRANT SELECT, INSERT ON payment_recovery TO authenticated, service_role;
GRANT UPDATE ON payment_recovery TO service_role;

GRANT SELECT ON amount_validation_failures TO service_role;
GRANT INSERT ON amount_validation_failures TO service_role;

GRANT SELECT ON test_mode_violations TO service_role;
GRANT INSERT ON test_mode_violations TO service_role;

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE payment_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE amount_validation_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_mode_violations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recovery records
DROP POLICY IF EXISTS "Users can view own payment recoveries" ON payment_recovery;
CREATE POLICY "Users can view own payment recoveries"
  ON payment_recovery FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all recovery records
DROP POLICY IF EXISTS "Service role can manage payment recoveries" ON payment_recovery;
CREATE POLICY "Service role can manage payment recoveries"
  ON payment_recovery FOR ALL
  USING (auth.role() = 'service_role');

-- Only service role can access validation failures and violations
DROP POLICY IF EXISTS "Service role can access validation failures" ON amount_validation_failures;
CREATE POLICY "Service role can access validation failures"
  ON amount_validation_failures FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can access test mode violations" ON test_mode_violations;
CREATE POLICY "Service role can access test mode violations"
  ON test_mode_violations FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 8. CLEANUP FUNCTION
-- =====================================================

-- Function to clean up old recovery records (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_payment_recoveries()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM payment_recovery
  WHERE recovery_status IN ('recovered', 'failed', 'cancelled')
    AND updated_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION cleanup_old_payment_recoveries TO service_role;

COMMENT ON FUNCTION cleanup_old_payment_recoveries IS
  'Deletes recovered/failed payment recovery records older than 90 days. Run via cron job.';
