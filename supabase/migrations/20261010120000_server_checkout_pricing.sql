-- =====================================================
-- Server-side checkout pricing: transaction integrity and promo redemption
-- =====================================================
-- The payment Edge Functions now price every checkout on the server and store
-- the verified breakdown (promo_code, totals, priced_items) in
-- payment_transactions.metadata. Fulfilment and promo redemption trust that
-- metadata, so end users must no longer be able to write it. Idempotent.
-- =====================================================

-- -----------------------------------------------------
-- 1. Transaction-writing RPCs are server-only
-- -----------------------------------------------------
-- These SECURITY DEFINER functions mark payments succeeded with a caller-given
-- amount. They were executable by anon/authenticated; only webhooks and the
-- PayPal capture route (both using the service role) should call them.
DO $$
DECLARE
  fn regprocedure;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN (
         'atomic_stripe_payment_capture',
         'atomic_paypal_payment_capture',
         'atomic_mollie_payment_capture',
         'upsert_stripe_payment_transaction',
         'upsert_paypal_payment_transaction'
       )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
  END LOOP;
END;
$$;

-- -----------------------------------------------------
-- 2. Users may only link their payment to their own order, once
-- -----------------------------------------------------
-- Payment rows are created server-side; the browser only links the paid
-- transaction to the order it just created (linkPaymentTransactionToOrder).
DROP POLICY IF EXISTS "Users can insert their own payment transactions" ON payment_transactions;

CREATE OR REPLACE FUNCTION enforce_payment_transactions_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF (to_jsonb(NEW) - 'order_id' - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'order_id' - 'updated_at') THEN
    RAISE EXCEPTION 'Not allowed to modify protected payment columns'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- One payment pays for one order: it cannot be moved to a second order.
  IF NEW.order_id IS DISTINCT FROM OLD.order_id AND (
    OLD.order_id IS NOT NULL
    OR NEW.order_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM orders WHERE id = NEW.order_id AND user_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'A payment can only be linked once, to your own order'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_transactions_protected_columns ON payment_transactions;
CREATE TRIGGER trg_payment_transactions_protected_columns
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_payment_transactions_protected_columns();

-- -----------------------------------------------------
-- 3. Redeem the promo code once per successful payment
-- -----------------------------------------------------
-- Payments become 'succeeded' in several places (webhooks, capture RPCs).
-- Redeeming on that transition covers every provider and every retry; the
-- primary key on the transaction makes redelivered events a no-op.
CREATE TABLE IF NOT EXISTS promocode_redemptions (
  payment_transaction_id UUID PRIMARY KEY REFERENCES payment_transactions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE promocode_redemptions IS 'One row per successful payment that used a promo code; drives promocodes.used_count';

ALTER TABLE promocode_redemptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE promocode_redemptions FROM anon, authenticated;

CREATE OR REPLACE FUNCTION redeem_promocode_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT := UPPER(TRIM(NEW.metadata->>'promo_code'));
BEGIN
  IF NEW.status <> 'succeeded' OR v_code IS NULL OR v_code = '' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'succeeded' THEN
    RETURN NEW;
  END IF;

  INSERT INTO promocode_redemptions (payment_transaction_id, code)
  VALUES (NEW.id, v_code)
  ON CONFLICT (payment_transaction_id) DO NOTHING;

  IF FOUND THEN
    UPDATE promocodes SET used_count = used_count + 1 WHERE code = v_code;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION redeem_promocode_on_payment() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_redeem_promocode_on_payment ON payment_transactions;
CREATE TRIGGER trg_redeem_promocode_on_payment
  AFTER INSERT OR UPDATE OF status ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION redeem_promocode_on_payment();
