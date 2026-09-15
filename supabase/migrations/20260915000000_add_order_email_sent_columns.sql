-- Customer order emails: idempotency markers
--
-- The order confirmation email is sent from every code path where an order
-- becomes paid (Stripe/PayPal/Mollie webhooks, capture/verify endpoints),
-- and the shipping notification from the sync-printify-orders cron. These
-- columns are claimed atomically (UPDATE ... WHERE <column> IS NULL) by
-- supabase/functions/_shared/orderEmails.ts so each email is sent once.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.confirmation_email_sent_at IS 'When the order confirmation email was sent (null = not yet). Claimed atomically by _shared/orderEmails.ts';
COMMENT ON COLUMN orders.shipping_email_sent_at IS 'When the shipping notification email was sent (null = not yet). Claimed atomically by _shared/orderEmails.ts';
