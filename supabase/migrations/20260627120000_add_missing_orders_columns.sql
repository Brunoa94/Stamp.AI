-- Add missing columns to orders table
-- Created: 2026-06-27
-- Description: Adds billing_address, shipping_address, customer info, and pricing breakdown columns

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN orders.billing_address IS 'Billing address in JSON format';
COMMENT ON COLUMN orders.shipping_address IS 'Shipping address in JSON format';
COMMENT ON COLUMN orders.customer_name IS 'Full name of the customer';
COMMENT ON COLUMN orders.customer_phone IS 'Customer phone number';
COMMENT ON COLUMN orders.subtotal IS 'Subtotal before tax and shipping';
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost';
COMMENT ON COLUMN orders.tax_amount IS 'Tax amount';
COMMENT ON COLUMN orders.discount_amount IS 'Discount amount applied';
COMMENT ON COLUMN orders.payment_provider IS 'Payment provider used (stripe, paypal, mollie)';
COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when order was shipped';
COMMENT ON COLUMN orders.delivered_at IS 'Timestamp when order was delivered';
