-- Live Order Status: Printify sync columns
--
-- Adds storage for the raw Printify order status alongside the constrained
-- application-level orders.status. The sync job (sync-printify-orders edge
-- function) maps Printify statuses onto the existing status vocabulary and
-- records the raw value here for the granular status badge in the UI.

-- Raw status returned by the Printify API (e.g. 'in-production', 'fulfilled').
-- Intentionally unconstrained: Printify may introduce new statuses at any time
-- and the sync must never fail on an unknown value.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_status TEXT;

-- Last time the sync job checked this order against Printify.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.printify_status IS 'Raw order status from the Printify API, e.g. in-production, fulfilled';
COMMENT ON COLUMN orders.printify_synced_at IS 'Last time sync-printify-orders checked this order against Printify';

-- Partial index matching the sync job query: non-terminal orders that have a
-- Printify order id, ordered by least-recently-synced first.
CREATE INDEX IF NOT EXISTS idx_orders_pending_printify_sync
  ON orders (printify_synced_at ASC NULLS FIRST)
  WHERE printify_order_id IS NOT NULL
    AND status IN ('waiting_confirmation', 'confirmed', 'processing', 'shipped');
