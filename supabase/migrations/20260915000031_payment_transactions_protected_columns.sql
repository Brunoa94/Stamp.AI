-- =====================================================
-- payment_transactions: scope user updates, protect money/link columns
-- Created: 2026-09-15
-- =====================================================
-- 20260715000000 let users UPDATE their own payment transactions with only a
-- USING clause, so a row could be re-pointed at another user, and any column
-- (amount, status, order_id, provider ids) could be rewritten by the browser.
--
-- Users no longer need to write these rows at all: finalize-order and the
-- webhooks (service role) record the transaction, its status and its order
-- link. The policy keeps a narrow allowance for non-financial fields (payer
-- info) and a BEFORE UPDATE / BEFORE INSERT trigger guards the protected
-- columns, mirroring `enforce_orders_protected_columns` and reusing
-- `is_privileged_writer()` from 20260707000000.

DROP POLICY IF EXISTS "Users can update their own payment transactions" ON payment_transactions;
CREATE POLICY "Users can update their own payment transactions" ON payment_transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION enforce_payment_transactions_protected_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- A browser may only ever register a pending transaction for itself; the
    -- provider webhooks (service role) are the only writers of success states.
    IF COALESCE(NEW.status, 'pending') <> 'pending' OR NEW.order_id IS NOT NULL THEN
      RAISE EXCEPTION 'Payment transactions can only be inserted as pending without an order link'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.amount                   IS DISTINCT FROM OLD.amount
  OR NEW.currency                 IS DISTINCT FROM OLD.currency
  OR NEW.status                   IS DISTINCT FROM OLD.status
  OR NEW.order_id                 IS DISTINCT FROM OLD.order_id
  OR NEW.user_id                  IS DISTINCT FROM OLD.user_id
  OR NEW.payment_provider         IS DISTINCT FROM OLD.payment_provider
  OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
  OR NEW.stripe_charge_id         IS DISTINCT FROM OLD.stripe_charge_id
  OR NEW.stripe_customer_id       IS DISTINCT FROM OLD.stripe_customer_id
  OR NEW.paypal_order_id          IS DISTINCT FROM OLD.paypal_order_id
  OR NEW.paypal_capture_id        IS DISTINCT FROM OLD.paypal_capture_id
  OR NEW.mollie_payment_id        IS DISTINCT FROM OLD.mollie_payment_id
  OR NEW.captured_at              IS DISTINCT FROM OLD.captured_at
  THEN
    RAISE EXCEPTION 'Not allowed to modify protected payment transaction columns'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_transactions_protected_columns ON payment_transactions;
CREATE TRIGGER trg_payment_transactions_protected_columns
  BEFORE INSERT OR UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_payment_transactions_protected_columns();

COMMENT ON FUNCTION enforce_payment_transactions_protected_columns() IS
  'Blocks non-privileged writes to payment_transactions money, status, ownership and provider-reference columns; server-side code (service role) is exempt.';
