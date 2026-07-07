/**
 * Data Integrity & Idempotency Constraints Migration
 *
 * Adds critical unique constraints to prevent:
 * - Duplicate payments
 * - Duplicate cart items
 * - Duplicate orders
 * - Duplicate webhook processing
 */

-- ============================================================================
-- 1. PAYMENT TRANSACTIONS - Prevent duplicate payments
-- ============================================================================

-- Add unique constraint for Stripe payment intents
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_stripe_unique
ON payment_transactions(stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;

-- Add unique constraint for PayPal orders
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_paypal_unique
ON payment_transactions(paypal_order_id)
WHERE paypal_order_id IS NOT NULL;

-- Add unique constraint for Mollie payments
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_mollie_unique
ON payment_transactions(mollie_payment_id)
WHERE mollie_payment_id IS NOT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_status
ON payment_transactions(payment_provider, status);

-- ============================================================================
-- 2. ORDERS - Prevent duplicate order creation
-- ============================================================================

-- Add unique constraint for idempotency keys
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key_unique
ON orders(idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- Add index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_created
ON orders(user_id, created_at DESC);

-- ============================================================================
-- 3. CART ITEMS - Prevent duplicate cart items
-- ============================================================================

-- Add unique constraint for standard products
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_product_unique
ON cart_items(cart_id, product_id, variant_id)
WHERE product_id IS NOT NULL
  AND variant_id IS NOT NULL
  AND custom_image_url IS NULL;

-- Add unique constraint for custom products (with custom image)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_custom_unique
ON cart_items(cart_id, product_id, variant_id, custom_image_url)
WHERE product_id IS NOT NULL
  AND variant_id IS NOT NULL
  AND custom_image_url IS NOT NULL;

-- Add unique constraint for fully custom products (no product_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_fully_custom_unique
ON cart_items(cart_id, custom_image_url, variant_id)
WHERE product_id IS NULL
  AND custom_image_url IS NOT NULL
  AND variant_id IS NOT NULL;

-- ============================================================================
-- 4. WEBHOOK EVENTS - Prevent duplicate webhook processing
-- ============================================================================

-- Add unique constraint for webhook events
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_provider_event_unique
ON webhook_events(provider, event_id);

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_created
ON webhook_events(provider, created_at DESC);

-- ============================================================================
-- 5. CATALOG PRODUCTS - Prevent orphaned products (OPTIONAL)
-- ============================================================================

-- Add index for blueprint_id lookups (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalog_products') THEN
    CREATE INDEX IF NOT EXISTS idx_catalog_products_blueprint
    ON catalog_products(blueprint_id)
    WHERE is_active = true;
  END IF;
END $$;

-- ============================================================================
-- 6. PRODUCT VARIANTS - Ensure data integrity (OPTIONAL)
-- ============================================================================

-- Add index for variant lookups (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') THEN
    CREATE INDEX IF NOT EXISTS idx_product_variants_product_printify
    ON product_variants(product_id, printify_variant_id);
  END IF;
END $$;

-- ============================================================================
-- 7. PROVIDER AVAILABILITY - Prevent duplicate pricing entries (OPTIONAL)
-- ============================================================================

-- Add unique constraint for provider availability (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'provider_availability') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_availability_unique
    ON provider_availability(variant_id, print_provider_id);

    -- Add index for fastest provider lookups
    CREATE INDEX IF NOT EXISTS idx_provider_availability_variant_cost
    ON provider_availability(variant_id, total_cost ASC)
    WHERE is_available = true;
  END IF;
END $$;

-- ============================================================================
-- 8. Comments for documentation
-- ============================================================================








-- ============================================================================
-- 9. Verify constraints are working (for testing)
-- ============================================================================

-- You can test these constraints work by attempting duplicate inserts:
-- Example: INSERT INTO payment_transactions (stripe_payment_intent_id, ...) VALUES ('pi_test', ...);
-- Second insert with same stripe_payment_intent_id should fail with unique constraint violation
