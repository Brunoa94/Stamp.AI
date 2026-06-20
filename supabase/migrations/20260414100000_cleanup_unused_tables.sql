-- Migration: Cleanup unused tables
-- Description: Drops tables that are defined in schema but not actively used in the codebase
-- Tables being dropped:
--   - payment_webhook_events (unused - webhook_events table is used instead)
--   - product_categories (unused - no category filtering implemented)
--   - product_images (unused - images handled via Printify integration)
--   - test_mode_violations (unused - monitoring structure never implemented)
--
-- NOTE: credit_transactions is KEPT - used by stripe-webhook for credit purchases

-- Step 1: Remove foreign key constraint from products to product_categories
-- This allows us to drop product_categories without affecting the products table
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Step 2: Set category_id to NULL since we're removing the categories feature
-- (This is a no-op if category_id is already NULL for all rows)
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;

-- Step 3: Drop the category_id column from products since it's unused
ALTER TABLE products DROP COLUMN IF EXISTS category_id;

-- Step 4: Drop foreign key constraint from payment_webhook_events to orders
ALTER TABLE payment_webhook_events DROP CONSTRAINT IF EXISTS payment_webhook_events_order_id_fkey;

-- Step 5: Drop unused tables (NOT credit_transactions - it's used for credit purchases)
DROP TABLE IF EXISTS payment_webhook_events;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS test_mode_violations;

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Main orders table - payment info stored in payment_transactions table';
COMMENT ON TABLE payment_transactions IS 'Centralized payment records for all providers (Stripe, PayPal, Mollie)';
COMMENT ON TABLE webhook_events IS 'Webhook event tracking for idempotency and debugging';
COMMENT ON TABLE credit_transactions IS 'Credit purchase transaction history - used by stripe-webhook';
