-- =====================================================
-- Order confirmation / shipping notification emails
-- =====================================================
-- Each column is claimed atomically before the email is sent
-- (UPDATE ... WHERE <column> IS NULL), so concurrent webhooks and sync runs
-- send an email at most once; a failed send clears the claim again.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipping_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.confirmation_email_sent_at IS 'When the order confirmation email was sent (claimed) to the customer';
COMMENT ON COLUMN orders.shipping_email_sent_at IS 'When the shipping notification email was sent (claimed) to the customer';

-- Orders that already shipped before this release must not get a late email.
UPDATE orders SET shipping_email_sent_at = COALESCE(shipped_at, NOW())
 WHERE tracking_number IS NOT NULL AND shipping_email_sent_at IS NULL;
UPDATE orders SET confirmation_email_sent_at = COALESCE(created_at, NOW())
 WHERE payment_status = 'paid' AND confirmation_email_sent_at IS NULL;
