-- Cron Job to Process Catalog Sync Queue
-- Runs every 5 minutes to process pending sync jobs

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing cron job if it exists
SELECT cron.unschedule('process-catalog-queue') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-catalog-queue'
);

-- Schedule the queue processor to run every 5 minutes
SELECT cron.schedule(
  'process-catalog-queue',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://tgccxydchvujhrqyzqao.supabase.co/functions/v1/process-catalog-queue',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body:='{"maxJobs": 10}'::jsonb
  ) as request_id;
  $$
);

COMMENT ON EXTENSION pg_cron IS 'Cron-based job scheduler for PostgreSQL';

-- Log the cron job creation
DO $$
BEGIN
  RAISE NOTICE 'Catalog queue processor cron job scheduled to run every 5 minutes';
END $$;
