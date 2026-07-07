-- Daily Price Refresh and Stock Check Cron Jobs
-- Job 1: Price refresh at 2:00 AM UTC
-- Job 2: Stock check at 9:00 AM UTC

-- =============================================================================
-- 1. Daily Price Refresh Job (2:00 AM UTC)
-- =============================================================================

-- Unschedule if exists
SELECT cron.unschedule('daily-price-refresh')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-price-refresh'
);

-- Schedule daily price refresh
SELECT cron.schedule(
  'daily-price-refresh',
  '0 2 * * *',  -- 2:00 AM UTC every day
  $$
  SELECT net.http_post(
    url:='https://tgccxydchvujhrqyzqao.supabase.co/functions/v1/daily-price-refresh',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' ||
      current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 2. Stock Availability Check Job (9:00 AM UTC)
-- =============================================================================

-- Unschedule if exists
SELECT cron.unschedule('stock-availability-check')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'stock-availability-check'
);

-- Schedule stock availability check
SELECT cron.schedule(
  'stock-availability-check',
  '0 9 * * *',  -- 9:00 AM UTC every day
  $$
  SELECT net.http_post(
    url:='https://tgccxydchvujhrqyzqao.supabase.co/functions/v1/stock-availability-check',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' ||
      current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 3. Update existing daily-catalog-sync to run at 3:00 AM
-- =============================================================================

-- This ensures we have:
-- 2:00 AM - Price refresh (all active products)
-- 3:00 AM - Legacy full sync (backup/verification)
-- 9:00 AM - Stock availability check

-- The daily-catalog-sync is already scheduled, just documenting here

-- =============================================================================
-- 4. Log cron job creation
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Daily jobs scheduled:';
  RAISE NOTICE '  - Price refresh: 2:00 AM UTC daily';
  RAISE NOTICE '  - Stock check: 9:00 AM UTC daily';
  RAISE NOTICE '  - Full sync (legacy): 3:00 AM UTC daily';
  RAISE NOTICE '  - Queue processor: Every 5 minutes';
END $$;

-- =============================================================================
-- 5. View all scheduled jobs
-- =============================================================================

COMMENT ON EXTENSION pg_cron IS
'Scheduled jobs:
  - process-catalog-queue: */5 * * * * (every 5 min)
  - daily-price-refresh: 0 2 * * * (2 AM daily)
  - daily-catalog-sync: 0 3 * * * (3 AM daily)
  - stock-availability-check: 0 9 * * * (9 AM daily)
';
