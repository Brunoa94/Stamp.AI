-- Stock Status and Price Tracking System
-- Adds availability status, price history, and stock change logging

-- =============================================================================
-- 1. Add stock status columns to catalog_products
-- =============================================================================

ALTER TABLE catalog_products
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'in_stock'
  CHECK (availability_status IN ('in_stock', 'out_of_stock', 'discontinued', 'temporarily_unavailable')),
ADD COLUMN IF NOT EXISTS last_availability_check TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stock_check_error TEXT,
ADD COLUMN IF NOT EXISTS printify_blueprint_exists BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_catalog_products_availability
  ON catalog_products(availability_status, is_active);

COMMENT ON COLUMN catalog_products.availability_status IS
  'in_stock: Available for purchase
   out_of_stock: Blueprint exists but no providers available
   discontinued: Blueprint removed from Printify catalog
   temporarily_unavailable: Temporary provider/API issues';

COMMENT ON COLUMN catalog_products.last_availability_check IS 'Last time stock availability was checked';
COMMENT ON COLUMN catalog_products.printify_blueprint_exists IS 'Whether the blueprint still exists in Printify catalog';

-- =============================================================================
-- 2. Add stock status to product_provider_availability
-- =============================================================================

ALTER TABLE product_provider_availability
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'available'
  CHECK (stock_status IN ('available', 'low_stock', 'out_of_stock', 'discontinued')),
ADD COLUMN IF NOT EXISTS last_stock_check TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_restock_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_provider_availability_stock
  ON product_provider_availability(is_in_stock, stock_status);

COMMENT ON COLUMN product_provider_availability.is_in_stock IS 'Quick boolean check for stock availability';
COMMENT ON COLUMN product_provider_availability.stock_status IS 'Detailed stock status for this provider/country combo';

-- =============================================================================
-- 3. Create price change history table
-- =============================================================================

CREATE TABLE IF NOT EXISTS catalog_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
  print_provider_id INTEGER NOT NULL,
  country_code TEXT NOT NULL,
  old_price_cents INTEGER,
  new_price_cents INTEGER NOT NULL,
  old_shipping_cents INTEGER,
  new_shipping_cents INTEGER NOT NULL,
  price_change_cents INTEGER,
  price_change_percent NUMERIC(5,2),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT DEFAULT 'daily_sync', -- 'daily_sync', 'manual_update', 'provider_change'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculate price change on insert
CREATE OR REPLACE FUNCTION calculate_price_change()
RETURNS TRIGGER AS $$
BEGIN
  NEW.price_change_cents :=
    (NEW.new_price_cents + NEW.new_shipping_cents) -
    (COALESCE(NEW.old_price_cents, 0) + COALESCE(NEW.old_shipping_cents, 0));

  IF NEW.old_price_cents IS NOT NULL AND (NEW.old_price_cents + NEW.old_shipping_cents) > 0 THEN
    NEW.price_change_percent :=
      (NEW.price_change_cents::NUMERIC / NULLIF(NEW.old_price_cents + NEW.old_shipping_cents, 0)) * 100;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_price_change
  BEFORE INSERT ON catalog_price_history
  FOR EACH ROW
  EXECUTE FUNCTION calculate_price_change();

CREATE INDEX IF NOT EXISTS idx_price_history_product ON catalog_price_history(product_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_changes ON catalog_price_history(price_change_cents)
  WHERE price_change_cents != 0;
CREATE INDEX IF NOT EXISTS idx_price_history_date ON catalog_price_history(changed_at DESC);

COMMENT ON TABLE catalog_price_history IS 'Tracks all price changes for analytics and alerts';
COMMENT ON COLUMN catalog_price_history.price_change_cents IS 'Total price change (base + shipping)';
COMMENT ON COLUMN catalog_price_history.price_change_percent IS 'Percentage change from old to new price';

-- =============================================================================
-- 4. Create stock status change log table
-- =============================================================================

CREATE TABLE IF NOT EXISTS catalog_stock_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT, -- 'blueprint_removed', 'provider_unavailable', 'api_error', 'restored'
  error_message TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_stock_changes_product ON catalog_stock_changes(product_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_changes_status ON catalog_stock_changes(new_status, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_changes_date ON catalog_stock_changes(changed_at DESC);

COMMENT ON TABLE catalog_stock_changes IS 'Audit log of all stock status changes';
COMMENT ON COLUMN catalog_stock_changes.reason IS 'Why the status changed (blueprint_removed, restored, etc)';

-- =============================================================================
-- 5. Function to update product stock status
-- =============================================================================

CREATE OR REPLACE FUNCTION update_product_stock_status(
  p_product_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  -- Get current status
  SELECT availability_status INTO v_old_status
  FROM catalog_products
  WHERE id = p_product_id;

  -- Only update if status actually changed
  IF v_old_status IS DISTINCT FROM p_new_status THEN
    -- Update product status
    UPDATE catalog_products
    SET
      availability_status = p_new_status,
      last_availability_check = NOW(),
      stock_check_error = p_error_message,
      printify_blueprint_exists = CASE
        WHEN p_new_status = 'discontinued' THEN false
        WHEN p_new_status = 'in_stock' THEN true
        ELSE printify_blueprint_exists
      END
    WHERE id = p_product_id;

    -- Log the change
    INSERT INTO catalog_stock_changes (
      product_id,
      old_status,
      new_status,
      reason,
      error_message
    ) VALUES (
      p_product_id,
      v_old_status,
      p_new_status,
      p_reason,
      p_error_message
    );

    RAISE NOTICE 'Product % status changed: % → %', p_product_id, v_old_status, p_new_status;
  ELSE
    -- Still update the check timestamp even if status didn't change
    UPDATE catalog_products
    SET last_availability_check = NOW()
    WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_product_stock_status IS
  'Updates product stock status and logs the change if status changed';

-- =============================================================================
-- 6. Function to record price changes
-- =============================================================================

CREATE OR REPLACE FUNCTION record_price_change(
  p_product_id UUID,
  p_provider_id INTEGER,
  p_country_code TEXT,
  p_new_base_price_cents INTEGER,
  p_new_shipping_cents INTEGER,
  p_change_reason TEXT DEFAULT 'daily_sync'
)
RETURNS VOID AS $$
DECLARE
  v_old_base_price INTEGER;
  v_old_shipping INTEGER;
  v_total_change INTEGER;
  v_change_percent NUMERIC;
BEGIN
  -- Get current prices
  SELECT base_price_cents, shipping_cost_cents
  INTO v_old_base_price, v_old_shipping
  FROM product_provider_availability
  WHERE product_id = p_product_id
    AND print_provider_id = p_provider_id
    AND country_code = p_country_code;

  -- Calculate change
  IF v_old_base_price IS NOT NULL THEN
    v_total_change :=
      (p_new_base_price_cents + p_new_shipping_cents) -
      (v_old_base_price + v_old_shipping);

    -- Only record if price actually changed
    IF v_total_change != 0 THEN
      -- Calculate percentage
      v_change_percent :=
        (v_total_change::NUMERIC / NULLIF(v_old_base_price + v_old_shipping, 0)) * 100;

      -- Insert price history record
      INSERT INTO catalog_price_history (
        product_id,
        print_provider_id,
        country_code,
        old_price_cents,
        new_price_cents,
        old_shipping_cents,
        new_shipping_cents,
        change_reason
      ) VALUES (
        p_product_id,
        p_provider_id,
        p_country_code,
        v_old_base_price,
        p_new_base_price_cents,
        v_old_shipping,
        p_new_shipping_cents,
        p_change_reason
      );

      -- Log significant changes (>10%)
      IF ABS(v_change_percent) > 10 THEN
        RAISE NOTICE 'Significant price change: Product % Provider % Country %: % percent change (% cents)',
          p_product_id, p_provider_id, p_country_code, ROUND(v_change_percent, 2), v_total_change;
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_price_change IS
  'Records price changes in history table for tracking and analytics. Only records if price actually changed.';

-- =============================================================================
-- 7. Function to get products needing price update
-- =============================================================================

CREATE OR REPLACE FUNCTION get_products_for_daily_price_update()
RETURNS TABLE(
  product_id UUID,
  blueprint_id INTEGER,
  name TEXT,
  last_synced TIMESTAMPTZ,
  hours_since_sync NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.blueprint_id,
    cp.name,
    MAX(ppa.last_synced_at) as last_synced,
    EXTRACT(EPOCH FROM (NOW() - MAX(ppa.last_synced_at))) / 3600 as hours_since_sync
  FROM catalog_products cp
  LEFT JOIN product_provider_availability ppa ON ppa.product_id = cp.id
  WHERE cp.is_active = true
    AND cp.availability_status != 'discontinued'
  GROUP BY cp.id, cp.blueprint_id, cp.name
  HAVING MAX(ppa.last_synced_at) IS NULL
    OR MAX(ppa.last_synced_at) < NOW() - INTERVAL '20 hours'
  ORDER BY hours_since_sync DESC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_products_for_daily_price_update IS
  'Returns products that need price updates (not synced in 20+ hours)';

-- =============================================================================
-- 8. Analytics views
-- =============================================================================

-- Price change analytics
CREATE OR REPLACE VIEW price_change_analytics AS
SELECT
  DATE_TRUNC('day', changed_at) as change_date,
  COUNT(*) as total_changes,
  COUNT(*) FILTER (WHERE price_change_cents > 0) as price_increases,
  COUNT(*) FILTER (WHERE price_change_cents < 0) as price_decreases,
  AVG(price_change_cents) as avg_change_cents,
  AVG(price_change_percent) as avg_change_percent,
  MAX(price_change_cents) as max_increase,
  MIN(price_change_cents) as max_decrease
FROM catalog_price_history
WHERE changed_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', changed_at)
ORDER BY change_date DESC;

COMMENT ON VIEW price_change_analytics IS 'Daily price change statistics for last 30 days';

-- Stock health view
CREATE OR REPLACE VIEW catalog_stock_health AS
SELECT
  availability_status,
  COUNT(*) as product_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  MAX(last_availability_check) as last_checked,
  COUNT(*) FILTER (
    WHERE last_availability_check < NOW() - INTERVAL '25 hours'
      OR last_availability_check IS NULL
  ) as stale_checks
FROM catalog_products
GROUP BY availability_status;

COMMENT ON VIEW catalog_stock_health IS 'Overview of stock status across all products';

-- Recent stock changes view
CREATE OR REPLACE VIEW recent_stock_changes AS
SELECT
  csc.id,
  csc.product_id,
  cp.blueprint_id,
  cp.name as product_name,
  csc.old_status,
  csc.new_status,
  csc.reason,
  csc.error_message,
  csc.changed_at
FROM catalog_stock_changes csc
JOIN catalog_products cp ON cp.id = csc.product_id
WHERE csc.changed_at > NOW() - INTERVAL '7 days'
ORDER BY csc.changed_at DESC;

COMMENT ON VIEW recent_stock_changes IS 'Stock status changes from last 7 days';

-- Recent price changes view
CREATE OR REPLACE VIEW recent_price_changes AS
SELECT
  cph.id,
  cph.product_id,
  cp.blueprint_id,
  cp.name as product_name,
  pp.name as provider_name,
  cph.country_code,
  cph.old_price_cents + cph.old_shipping_cents as old_total_cents,
  cph.new_price_cents + cph.new_shipping_cents as new_total_cents,
  cph.price_change_cents,
  cph.price_change_percent,
  cph.changed_at
FROM catalog_price_history cph
JOIN catalog_products cp ON cp.id = cph.product_id
LEFT JOIN print_providers pp ON pp.id = cph.print_provider_id
WHERE cph.changed_at > NOW() - INTERVAL '7 days'
  AND cph.price_change_cents != 0
ORDER BY cph.changed_at DESC;

COMMENT ON VIEW recent_price_changes IS 'Significant price changes from last 7 days';

-- =============================================================================
-- 9. Grant permissions
-- =============================================================================

-- Service role needs full access
GRANT ALL ON catalog_price_history TO service_role;
GRANT ALL ON catalog_stock_changes TO service_role;
GRANT EXECUTE ON FUNCTION update_product_stock_status(UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION record_price_change(UUID, INTEGER, TEXT, INTEGER, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_products_for_daily_price_update() TO service_role;

-- Authenticated users can view analytics
GRANT SELECT ON price_change_analytics TO authenticated;
GRANT SELECT ON catalog_stock_health TO authenticated;
GRANT SELECT ON recent_stock_changes TO authenticated;
GRANT SELECT ON recent_price_changes TO authenticated;
GRANT SELECT ON catalog_price_history TO authenticated;
GRANT SELECT ON catalog_stock_changes TO authenticated;

-- =============================================================================
-- 10. Initialize existing products with default stock status
-- =============================================================================

-- Set all existing active products to 'in_stock' status
UPDATE catalog_products
SET
  availability_status = 'in_stock',
  last_availability_check = NOW(),
  printify_blueprint_exists = true
WHERE is_active = true
  AND availability_status IS NULL;
