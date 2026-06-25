-- Auto-Sync System for Catalog Products
-- Automatically syncs product data when blueprint_id is added to catalog_products
-- This eliminates the need to manually call sync-catalog Edge Function

-- =============================================================================
-- 1. Create a queue table for products that need syncing
-- =============================================================================

CREATE TABLE IF NOT EXISTS catalog_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id integer NOT NULL,
  product_id uuid REFERENCES catalog_products(id) ON DELETE CASCADE,
  countries_to_sync text[] DEFAULT ARRAY['NL', 'US', 'GB', 'DE', 'FR'],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  UNIQUE(blueprint_id, product_id)
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_catalog_sync_queue_status ON catalog_sync_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_catalog_sync_queue_blueprint ON catalog_sync_queue(blueprint_id);

COMMENT ON TABLE catalog_sync_queue IS 'Queue of products that need to be synced from Printify';
COMMENT ON COLUMN catalog_sync_queue.status IS 'pending: waiting to sync, processing: currently syncing, completed: done, failed: error occurred';

-- =============================================================================
-- 2. Function to queue a product for syncing
-- =============================================================================

CREATE OR REPLACE FUNCTION queue_product_for_sync()
RETURNS trigger AS $$
BEGIN
  -- Only queue if it's a new product or if blueprint_id changed
  IF (TG_OP = 'INSERT') OR
     (TG_OP = 'UPDATE' AND OLD.blueprint_id IS DISTINCT FROM NEW.blueprint_id) THEN

    -- Insert into sync queue (on conflict, update to pending status)
    INSERT INTO catalog_sync_queue (blueprint_id, product_id, status)
    VALUES (NEW.blueprint_id, NEW.id, 'pending')
    ON CONFLICT (blueprint_id, product_id)
    DO UPDATE SET
      status = 'pending',
      retry_count = 0,
      error_message = NULL,
      created_at = now(),
      processed_at = NULL;

    -- Log the queue action
    RAISE NOTICE 'Queued blueprint % (product %) for sync', NEW.blueprint_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION queue_product_for_sync IS 'Automatically queues products for syncing when added or blueprint_id changes';

-- =============================================================================
-- 3. Create trigger on catalog_products
-- =============================================================================

DROP TRIGGER IF EXISTS trigger_queue_product_sync ON catalog_products;

CREATE TRIGGER trigger_queue_product_sync
  AFTER INSERT OR UPDATE OF blueprint_id ON catalog_products
  FOR EACH ROW
  EXECUTE FUNCTION queue_product_for_sync();

COMMENT ON TRIGGER trigger_queue_product_sync ON catalog_products IS 'Triggers auto-sync when product is added or blueprint_id changes';

-- =============================================================================
-- 4. Function to get next queued product for syncing
-- =============================================================================

CREATE OR REPLACE FUNCTION get_next_product_to_sync()
RETURNS TABLE (
  queue_id uuid,
  blueprint_id integer,
  product_id uuid,
  countries text[]
) AS $$
DECLARE
  v_queue_id uuid;
  v_blueprint_id integer;
  v_product_id uuid;
  v_countries text[];
BEGIN
  -- Lock and get the next pending item
  SELECT
    csq.id,
    csq.blueprint_id,
    csq.product_id,
    csq.countries_to_sync
  INTO
    v_queue_id,
    v_blueprint_id,
    v_product_id,
    v_countries
  FROM catalog_sync_queue csq
  WHERE csq.status = 'pending'
    AND csq.retry_count < 3  -- Max 3 retries
  ORDER BY csq.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;  -- Skip if already locked

  IF FOUND THEN
    -- Mark as processing
    UPDATE catalog_sync_queue
    SET
      status = 'processing',
      processed_at = now()
    WHERE id = v_queue_id;

    -- Return the item
    queue_id := v_queue_id;
    blueprint_id := v_blueprint_id;
    product_id := v_product_id;
    countries := v_countries;

    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_product_to_sync IS 'Gets next product from sync queue and marks it as processing';

-- =============================================================================
-- 5. Function to mark sync as completed or failed
-- =============================================================================

CREATE OR REPLACE FUNCTION update_sync_queue_status(
  p_queue_id uuid,
  p_status text,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE catalog_sync_queue
  SET
    status = p_status,
    error_message = p_error_message,
    processed_at = now(),
    retry_count = CASE
      WHEN p_status = 'failed' THEN retry_count + 1
      ELSE retry_count
    END
  WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_sync_queue_status IS 'Updates the status of a queued sync job';

-- =============================================================================
-- 6. Function to manually trigger sync for a blueprint
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_product_sync(
  p_blueprint_id integer,
  p_countries text[] DEFAULT ARRAY['NL', 'US', 'GB', 'DE', 'FR']
)
RETURNS uuid AS $$
DECLARE
  v_product_id uuid;
  v_queue_id uuid;
BEGIN
  -- Get the product_id for this blueprint
  SELECT id INTO v_product_id
  FROM catalog_products
  WHERE blueprint_id = p_blueprint_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Blueprint % not found in catalog_products', p_blueprint_id;
  END IF;

  -- Insert into queue
  INSERT INTO catalog_sync_queue (blueprint_id, product_id, countries_to_sync, status)
  VALUES (p_blueprint_id, v_product_id, p_countries, 'pending')
  ON CONFLICT (blueprint_id, product_id)
  DO UPDATE SET
    status = 'pending',
    countries_to_sync = p_countries,
    retry_count = 0,
    error_message = NULL,
    created_at = now(),
    processed_at = NULL
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trigger_product_sync IS 'Manually queue a blueprint for syncing with custom countries';

-- =============================================================================
-- 7. Function to clean up old completed/failed syncs
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_sync_queue()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
  failed_count integer;
BEGIN
  -- Delete completed syncs older than 7 days
  DELETE FROM catalog_sync_queue
  WHERE status = 'completed'
    AND processed_at < now() - interval '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Delete failed syncs older than 30 days (keep for debugging)
  DELETE FROM catalog_sync_queue
  WHERE status = 'failed'
    AND processed_at < now() - interval '30 days';

  GET DIAGNOSTICS failed_count = ROW_COUNT;

  deleted_count := deleted_count + failed_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_sync_queue IS 'Removes old completed/failed sync records';

-- =============================================================================
-- 8. View for monitoring sync queue
-- =============================================================================

CREATE OR REPLACE VIEW catalog_sync_status AS
SELECT
  csq.id as queue_id,
  csq.blueprint_id,
  cp.name as product_name,
  csq.countries_to_sync,
  csq.status,
  csq.error_message,
  csq.retry_count,
  csq.created_at as queued_at,
  csq.processed_at,
  CASE
    WHEN csq.status = 'processing' THEN
      EXTRACT(EPOCH FROM (now() - csq.processed_at))::integer
    ELSE NULL
  END as processing_seconds
FROM catalog_sync_queue csq
LEFT JOIN catalog_products cp ON csq.product_id = cp.id
ORDER BY csq.created_at DESC;

COMMENT ON VIEW catalog_sync_status IS 'Monitor the status of catalog sync jobs';

-- =============================================================================
-- 9. Grant permissions
-- =============================================================================

-- Allow service role to manage the queue
GRANT ALL ON catalog_sync_queue TO service_role;
GRANT EXECUTE ON FUNCTION get_next_product_to_sync() TO service_role;
GRANT EXECUTE ON FUNCTION update_sync_queue_status(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_sync_queue() TO service_role;

-- Allow authenticated users to view queue status and trigger syncs
GRANT SELECT ON catalog_sync_status TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_product_sync(integer, text[]) TO authenticated;

-- =============================================================================
-- 10. Example usage documentation
-- =============================================================================

COMMENT ON TABLE catalog_sync_queue IS
'Queue system for automatic catalog syncing.

AUTOMATIC USAGE:
When you INSERT or UPDATE a product in catalog_products, it automatically queues for sync:

  INSERT INTO catalog_products (blueprint_id, name, brand)
  VALUES (1389, ''Tote Bag (AOP)'', ''Generic brand'');
  -- Automatically queued for sync!

MANUAL TRIGGER:
  SELECT trigger_product_sync(1389); -- Sync blueprint 1389
  SELECT trigger_product_sync(1389, ARRAY[''NL'', ''DE'']); -- Custom countries

MONITOR SYNC STATUS:
  SELECT * FROM catalog_sync_status WHERE status = ''pending'';
  SELECT * FROM catalog_sync_status WHERE status = ''failed'';

WORKER PROCESS (Edge Function):
  SELECT * FROM get_next_product_to_sync(); -- Get next job
  SELECT update_sync_queue_status(queue_id, ''completed''); -- Mark done
  SELECT update_sync_queue_status(queue_id, ''failed'', ''Error message''); -- Mark failed
';

-- =============================================================================
-- 11. Queue existing products for initial sync
-- =============================================================================

-- Queue all active products that don't have pricing data yet
INSERT INTO catalog_sync_queue (blueprint_id, product_id, status)
SELECT
  cp.blueprint_id,
  cp.id,
  'pending'
FROM catalog_products cp
WHERE cp.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM product_provider_availability ppa
    WHERE ppa.product_id = cp.id
    LIMIT 1
  )
ON CONFLICT (blueprint_id, product_id) DO NOTHING;
