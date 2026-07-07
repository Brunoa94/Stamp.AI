-- =====================================================
-- ADD DAILY CATALOG SYNC CRON JOB
-- =====================================================
-- Date: 2026-06-21
-- Description: Creates a daily cron job to sync catalog prices from Printify
--              Runs at 3 AM UTC to keep prices up-to-date
-- =====================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to trigger the catalog sync Edge Function
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
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{"countries": ["NL"], "blueprintIds": [12, 6, 145, 553], "forceUpdate": true}'
  )::http_request);

  -- Log the result
  RAISE NOTICE 'Catalog sync completed: %', sync_result;
END;
$$;

-- Schedule the cron job to run daily at 3 AM UTC
SELECT cron.schedule(
  'daily-catalog-sync',           -- Job name
  '0 3 * * *',                    -- Cron expression (3 AM UTC daily)
  $$SELECT public.trigger_catalog_sync()$$
);

-- Add comment
COMMENT ON FUNCTION public.trigger_catalog_sync() IS
  'Triggers the sync-catalog Edge Function to update product pricing daily.
   Called by pg_cron job at 3 AM UTC.';
