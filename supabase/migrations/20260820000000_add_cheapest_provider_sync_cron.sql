-- Sync Cheapest Providers: cron job for finding optimal print providers
-- =====================================================================
-- This job runs daily to find the cheapest print provider for each product
-- by comparing total cost (product price + shipping) to Netherlands.
--
-- Updates catalog_products with:
--   - print_provider_id: ID of the cheapest provider
--   - min_price_cents: Minimum variant price from that provider
--   - shipping_cents: Shipping cost to Netherlands
--
-- PREREQUISITE: Vault secrets must be configured (see 20260818100000 migration)
-- =====================================================================

-- Ensure pg_cron and pg_net are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing job if it exists
SELECT cron.unschedule('sync-cheapest-providers') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-cheapest-providers'
);

-- Schedule the cheapest provider sync to run daily at 3 AM
-- This runs after the daily-price-refresh (2 AM) to ensure prices are current
SELECT cron.schedule(
  'sync-cheapest-providers',
  '0 3 * * *',  -- Daily at 3:00 AM
  $$
  SELECT net.http_post(
    url:=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/sync-cheapest-providers',
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
  RAISE NOTICE 'Cheapest provider sync cron job scheduled to run daily at 3 AM';
  RAISE NOTICE 'This job finds the cheapest print provider for each product (product price + shipping to NL)';
END $$;
