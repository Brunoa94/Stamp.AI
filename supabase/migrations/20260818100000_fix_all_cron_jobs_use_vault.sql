-- Fix All Cron Jobs: Use Vault Secrets Instead of app.settings
-- =====================================================
-- The app.settings approach requires superuser privileges that are not
-- available on Supabase hosted projects. This migration updates all cron
-- jobs to use Supabase Vault for secrets storage.
--
-- PREREQUISITE: Enable extensions via Dashboard (Database → Extensions):
--   1. pg_net (for net.http_post)
--   2. http (for http_request type)
--
-- PREREQUISITE: Add secrets to Vault (run in SQL Editor):
--   SELECT vault.create_secret('https://timbqoxngnhoetbofdiq.supabase.co', 'supabase_url');
--   SELECT vault.create_secret('<service-role-key>', 'service_role_key');
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
    url:=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/process-catalog-queue',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
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
    url:=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/daily-price-refresh',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
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
    url:=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/stock-availability-check',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 4. Fix daily-catalog-sync cron job (uses trigger_catalog_sync function)
-- =============================================================================
-- First, update the trigger_catalog_sync function to use Vault and net.http_post
CREATE OR REPLACE FUNCTION public.trigger_catalog_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the sync-catalog Edge Function via HTTP using pg_net
  PERFORM net.http_post(
    url:=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/sync-catalog',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body:='{"countries": ["NL"], "blueprintIds": [12, 6, 145, 553], "forceUpdate": true}'::jsonb
  );

  RAISE NOTICE 'Catalog sync triggered via Edge Function';
END;
$$;

-- =============================================================================
-- 5. Fix sync-printify-orders cron job
-- =============================================================================
SELECT cron.unschedule('sync-printify-orders') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-printify-orders'
);

SELECT cron.schedule(
  'sync-printify-orders',
  '0 */4 * * *',  -- Every 4 hours
  $$
  SELECT net.http_post(
    url:=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/sync-printify-orders',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- =============================================================================
-- 6. Log the changes
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE 'All cron jobs updated to use Vault secrets:';
  RAISE NOTICE '  - process-catalog-queue: Fixed';
  RAISE NOTICE '  - daily-price-refresh: Fixed';
  RAISE NOTICE '  - stock-availability-check: Fixed';
  RAISE NOTICE '  - daily-catalog-sync (trigger_catalog_sync): Fixed';
  RAISE NOTICE '  - sync-printify-orders: Fixed';
END $$;
