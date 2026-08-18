-- Live Order Status: cron job polling Printify
--
-- Schedules the sync-printify-orders edge function every 5 minutes. The
-- function fetches all orders that are not yet delivered/cancelled and still
-- have a printify_order_id, reads their current status from the Printify API,
-- and updates orders.status / orders.printify_status plus tracking fields.
--
-- ONE-TIME MANUAL SETUP (run in SQL Editor before applying this migration):
--
--   SELECT vault.create_secret('https://timbqoxngnhoetbofdiq.supabase.co', 'supabase_url');
--   SELECT vault.create_secret('<service-role-key>', 'service_role_key');
--
-- Verify cron runs with:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing cron job if it exists
SELECT cron.unschedule('sync-printify-orders') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-printify-orders'
);

-- Schedule the Printify order status sync to run every 5 minutes
-- Uses Vault secrets for URL and service role key
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

-- Log the cron job creation
DO $$
BEGIN
  RAISE NOTICE 'Printify order status sync cron job scheduled to run every 5 minutes';
END $$;
