-- Enable pg_net extension for HTTP requests from cron jobs
-- =====================================================
-- This extension is required for cron jobs to call Edge Functions via HTTP.
-- It must be enabled before any migrations that use net.http_post().
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role (used by cron)
GRANT USAGE ON SCHEMA net TO postgres;

DO $$
BEGIN
  RAISE NOTICE 'pg_net extension enabled - cron jobs can now make HTTP requests';
END $$;
