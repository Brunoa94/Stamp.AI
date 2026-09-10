-- Fix Cron Jobs: Use Database Settings Instead of Hardcoded URLs
-- =====================================================
-- Date: 2026-08-18
-- Description: Updates all cron jobs to use app.settings.supabase_url instead
--              of hardcoded project URLs. The old migrations hardcoded the wrong
--              project ref (tgccxydchvujhrqyzqao instead of timbqoxngnhoetbofdiq).
--
-- ONE-TIME MANUAL SETUP (run before applying this migration):
--
--   ALTER DATABASE postgres SET app.settings.supabase_url = 'https://timbqoxngnhoetbofdiq.supabase.co';
--   ALTER DATABASE postgres SET app.settings.service_role_key = '<service-role-key>';
--
-- Verify with:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- =====================================================

-- =============================================================================
-- 1. Fix process-catalog-queue cron job
-- =============================================================================
SELECT cron.unschedule('process-catalog-queue') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-catalog-queue'
);

SELECT cron.schedule(
  'process-catalog-queue',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:=current_setting('app.settings.supabase_url') || '/functions/v1/process-catalog-queue',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body:='{"maxJobs": 10}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 2. Fix daily-price-refresh cron job
-- =============================================================================
SELECT cron.unschedule('daily-price-refresh') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-price-refresh'
);

SELECT cron.schedule(
  'daily-price-refresh',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:=current_setting('app.settings.supabase_url') || '/functions/v1/daily-price-refresh',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 3. Fix stock-availability-check cron job
-- =============================================================================
SELECT cron.unschedule('stock-availability-check') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'stock-availability-check'
);

SELECT cron.schedule(
  'stock-availability-check',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:=current_setting('app.settings.supabase_url') || '/functions/v1/stock-availability-check',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 4. Fix the trigger_catalog_sync function (uses wrong setting name)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.trigger_catalog_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sync_result jsonb;
BEGIN
  -- Call the sync-catalog Edge Function via HTTP
  -- This syncs all 4 main blueprints for NL market
  SELECT content::jsonb INTO sync_result
  FROM http((
    'POST',
    current_setting('app.settings.supabase_url') || '/functions/v1/sync-catalog',
    ARRAY[
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{"countries": ["NL"], "blueprintIds": [12, 6, 145, 553], "forceUpdate": true}'
  )::http_request);

  RAISE NOTICE 'Catalog sync completed: %', sync_result;
END;
$$;

-- =============================================================================
-- 5. Log the changes
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE 'All cron jobs updated to use database settings:';
  RAISE NOTICE '  - process-catalog-queue: Now uses app.settings.supabase_url';
  RAISE NOTICE '  - daily-price-refresh: Now uses app.settings.supabase_url';
  RAISE NOTICE '  - stock-availability-check: Now uses app.settings.supabase_url';
  RAISE NOTICE '  - trigger_catalog_sync: Now uses app.settings.service_role_key (was supabase_service_role_key)';
  RAISE NOTICE '  - sync-printify-orders: Already uses app.settings.supabase_url';
END $$;
