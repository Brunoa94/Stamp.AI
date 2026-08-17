-- Live Order Status: cron job polling Printify
--
-- Schedules the sync-printify-orders edge function every 5 minutes. The
-- function fetches all orders that are not yet delivered/cancelled and still
-- have a printify_order_id, reads their current status from the Printify API,
-- and updates orders.status / orders.printify_status plus tracking fields.
--
-- ONE-TIME MANUAL SETUP (secrets must not live in the repo). Run once on the
-- linked database before this cron fires, otherwise net.http_post errors on
-- every run:
--
--   ALTER DATABASE postgres SET app.settings.supabase_url = 'https://<project-ref>.supabase.co';
--   ALTER DATABASE postgres SET app.settings.service_role_key = '<service-role-key>';
--
-- app.settings.service_role_key is the same setting the former
-- process-catalog-queue cron used, so it may already be set. Verify runs with:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing cron job if it exists
SELECT cron.unschedule('sync-printify-orders') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-printify-orders'
);

-- Schedule the Printify order status sync to run every 5 minutes
SELECT cron.schedule(
  'sync-printify-orders',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url:=current_setting('app.settings.supabase_url') || '/functions/v1/sync-printify-orders',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Log the cron job creation
DO $$
BEGIN
  RAISE NOTICE 'Printify order status sync cron job scheduled to run every 5 minutes';
END $$;
