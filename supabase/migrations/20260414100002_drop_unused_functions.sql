-- Migration: Drop unused database functions
-- Description: Removes functions that are not being called and have no triggers/cron jobs
--
-- Functions being removed:
--   - record_amount_validation_failure: Never called anywhere in codebase
--   - cleanup_old_webhook_events: References payment_webhook_events table (dropped in previous migration)
--   - cleanup_old_payment_recoveries: No cron job configured, no callers
--
-- Functions being KEPT (have active cron jobs):
--   - expire_waiting_payment_orders (cron job runs hourly)
--   - refill_min_3_coins_daily (cron job runs daily at midnight)
--
-- Functions being KEPT (have triggers):
--   - handle_new_user (trigger: on_auth_user_created)
--   - set_order_number (trigger: set_order_number_trigger)
--   - update_updated_at_column (multiple triggers)

-- Drop unused functions
DROP FUNCTION IF EXISTS record_amount_validation_failure();
DROP FUNCTION IF EXISTS cleanup_old_webhook_events();
DROP FUNCTION IF EXISTS cleanup_old_payment_recoveries();

-- Also drop generate_order_number if it exists (superseded by set_order_number trigger)
DROP FUNCTION IF EXISTS generate_order_number();
