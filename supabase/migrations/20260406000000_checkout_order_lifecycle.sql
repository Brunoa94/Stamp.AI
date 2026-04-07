-- Checkout & Order Lifecycle hardening
-- Date: 2026-04-06

-- -----------------------------------------------------
-- Orders table lifecycle fields
-- -----------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS payment_failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS refund_failed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS manual_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refund_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_refund_error TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE orders
SET expires_at = COALESCE(expires_at, created_at + INTERVAL '24 hours')
WHERE expires_at IS NULL;

ALTER TABLE orders
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '24 hours');

CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_refund_failed ON orders(refund_failed);
CREATE INDEX IF NOT EXISTS idx_orders_manual_review_required ON orders(manual_review_required);

-- -----------------------------------------------------
-- Payment transaction support columns
-- -----------------------------------------------------
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_payer_email TEXT,
  ADD COLUMN IF NOT EXISTS mollie_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS mollie_status TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payment_transactions_payment_provider_check'
  ) THEN
    ALTER TABLE payment_transactions
      ADD CONSTRAINT payment_transactions_payment_provider_check
      CHECK (payment_provider IN ('stripe', 'paypal', 'mollie'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_paypal_order
  ON payment_transactions(paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_mollie_payment
  ON payment_transactions(mollie_payment_id)
  WHERE mollie_payment_id IS NOT NULL;

-- -----------------------------------------------------
-- Webhook idempotency log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'mollie')),
  event_id TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_order_id ON payment_webhook_events(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_created_at ON payment_webhook_events(created_at DESC);

ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage payment webhook events" ON payment_webhook_events;
CREATE POLICY "Service role can manage payment webhook events"
  ON payment_webhook_events FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------
-- Email queue for async + retry
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dedupe_key TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  last_error TEXT,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_pending ON email_jobs(status, next_attempt_at);

ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage email jobs" ON email_jobs;
CREATE POLICY "Service role can manage email jobs"
  ON email_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------
-- Waiting payment expiry function (for pg_cron)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION expire_waiting_payment_orders()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE orders
    SET
      status = 'cancelled',
      cancellation_reason = 'expired',
      expired_at = NOW(),
      cancelled_at = NOW(),
      updated_at = NOW()
    WHERE status = 'waiting_payment'
      AND created_at <= NOW() - INTERVAL '24 hours'
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_count FROM expired;

  RETURN affected_count;
END;
$$;

-- Optional scheduling (safe no-op if pg_cron unavailable)
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore extension errors on hosted environments that pre-manage extensions
    NULL;
  END;

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-waiting-payment-orders-hourly') THEN
      PERFORM cron.schedule(
        'expire-waiting-payment-orders-hourly',
        '0 * * * *',
        'SELECT expire_waiting_payment_orders();'
      );
    END IF;
  END IF;
END $$;
