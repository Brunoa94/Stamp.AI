-- =====================================================
-- Orders are minted server-side only
-- Created: 2026-09-15
-- =====================================================
-- Paid orders are created by the `finalize-order` edge function (service role)
-- after the payment has been verified with the provider and every item has
-- been repriced from the catalog. Browser clients keep their INSERT policy
-- (`auth.uid() = user_id`) but can no longer insert an order that claims to be
-- paid or already progressed: RLS cannot restrict column values, so a
-- BEFORE INSERT trigger enforces it, mirroring
-- `enforce_orders_protected_columns` (BEFORE UPDATE) and reusing its
-- privileged-writer check.

CREATE OR REPLACE FUNCTION enforce_orders_insert_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_privileged_writer() THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.payment_status, 'pending') <> 'pending'
  OR COALESCE(NEW.status, 'pending') <> 'pending'
  THEN
    RAISE EXCEPTION 'Orders can only be inserted as pending; paid orders are finalized server-side'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_insert_pending ON orders;
CREATE TRIGGER trg_orders_insert_pending
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION enforce_orders_insert_pending();

COMMENT ON FUNCTION enforce_orders_insert_pending() IS
  'Non-privileged inserts into orders must leave payment_status and status at pending; finalize-order (service role) mints paid orders.';

-- One order per provider payment. The partial unique index already exists from
-- 20260412000000; re-assert it so finalize-order can rely on the 23505 conflict
-- to resolve concurrent finalizations (browser return page vs. webhook).
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN orders.idempotency_key IS
  'Provider payment reference `${provider}_${paymentId}` (see _shared/paymentReference.ts); unique per paid order.';
