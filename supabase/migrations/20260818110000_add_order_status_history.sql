-- Order Status History Table
-- Stores all status transitions for orders to display a timeline in the UI

CREATE TABLE order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    printify_status TEXT,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE order_status_history IS 'Tracks all status changes for orders to display a tracking timeline';
COMMENT ON COLUMN order_status_history.status IS 'The application-level order status (confirmed, processing, shipped, etc.)';
COMMENT ON COLUMN order_status_history.printify_status IS 'Raw Printify status if this change came from a Printify sync';
COMMENT ON COLUMN order_status_history.source IS 'What triggered this status change: printify_sync, order_creation, cancellation, backfill';

-- Index for efficient order lookups (primary use case: fetch history for a single order)
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Composite index for fetching history in chronological order
CREATE INDEX idx_order_status_history_order_created ON order_status_history(order_id, created_at ASC);

-- Enable RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view history for their own orders
CREATE POLICY "Users can view their order status history"
  ON order_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()
  ));

-- Service role can manage all history records
CREATE POLICY "Service role can manage order status history"
  ON order_status_history FOR ALL
  USING (auth.role() = 'service_role');

-- Backfill existing orders with their current status
-- This ensures all existing orders have at least one history entry
INSERT INTO order_status_history (order_id, status, source, created_at)
SELECT id, status, 'backfill', created_at
FROM orders
WHERE status IS NOT NULL AND status != '';
