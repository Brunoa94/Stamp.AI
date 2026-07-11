-- =====================================================
-- Invoices Migration
-- Created: 2026-07-09
-- Description: Adds invoices with gapless sequential numbering,
--              a private storage bucket for invoice PDFs, and the
--              create_invoice_for_order RPC used by edge functions.
-- NOTE: Not yet applied to the remote database.
-- =====================================================

-- =====================================================
-- INVOICE COUNTERS TABLE
-- One row per series (e.g. "INV-2026", "CN-2026").
-- The row lock taken by the UPDATE serializes issuance, which
-- guarantees sequential, gapless invoice numbers.
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_counters (
    counter_key TEXT PRIMARY KEY,
    last_value BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICES TABLE
-- Immutable snapshot of an order at the moment of issuance.
-- Amounts are DECIMAL dollars, matching the orders table.
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'invoice' CHECK (type IN ('invoice', 'credit_note')),
    status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'void')),
    related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Source order
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    order_number TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Customer snapshot
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    billing_address JSONB,
    shipping_address JSONB,

    -- Amounts snapshot
    currency TEXT NOT NULL DEFAULT 'USD',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Line items snapshot: [{product_name, variant_name, quantity, unit_price, total_price}]
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Payment snapshot
    payment_method TEXT,
    payment_provider TEXT,

    -- Generated PDF (private "invoices" bucket)
    pdf_bucket TEXT,
    pdf_path TEXT,

    -- Delivery
    emailed_at TIMESTAMPTZ,

    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One ISSUED invoice / credit note per order (voided documents may be reissued)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_order_type_issued
ON invoices(order_id, type)
WHERE status = 'issued';

COMMENT ON TABLE invoices IS 'Immutable invoice snapshots. Never update amounts after issuance; corrections are credit notes.';
COMMENT ON COLUMN invoices.invoice_number IS 'Gapless sequential number, e.g. INV-2026-00042';
COMMENT ON COLUMN invoices.line_items IS 'Snapshot of order_items at issuance time';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at DESC);

-- updated_at trigger (function created in core tables migration)
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can manage all invoices" ON invoices;
CREATE POLICY "Service role can manage all invoices" ON invoices FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage invoice counters" ON invoice_counters;
CREATE POLICY "Service role can manage invoice counters" ON invoice_counters FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- STORAGE: private bucket for invoice PDFs
-- Path convention: {user_id}/{invoice_number}.pdf
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can read their own invoice PDFs" ON storage.objects;
CREATE POLICY "Users can read their own invoice PDFs" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'invoices' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- FUNCTION: create_invoice_for_order
-- Idempotent: returns the existing invoice if one was already
-- issued for the order. Only callable with the service role
-- (edge functions); execution is revoked from anon/authenticated.
-- =====================================================
CREATE OR REPLACE FUNCTION create_invoice_for_order(
    p_order_id UUID,
    p_type TEXT DEFAULT 'invoice'
)
RETURNS SETOF invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_existing invoices%ROWTYPE;
    v_prefix TEXT;
    v_year TEXT;
    v_counter_key TEXT;
    v_seq BIGINT;
    v_invoice_number TEXT;
    v_line_items JSONB;
BEGIN
    IF p_type NOT IN ('invoice', 'credit_note') THEN
        RAISE EXCEPTION 'Invalid invoice type: %', p_type;
    END IF;

    -- Lock the order row to serialize concurrent issuance for the same order
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;

    -- Idempotency: return the already-issued document
    SELECT * INTO v_existing
    FROM invoices
    WHERE order_id = p_order_id AND type = p_type AND status = 'issued';
    IF FOUND THEN
        RETURN NEXT v_existing;
        RETURN;
    END IF;

    IF p_type = 'invoice' AND COALESCE(v_order.payment_status, '') <> 'paid' THEN
        RAISE EXCEPTION 'Cannot issue invoice for order %: payment_status is %', p_order_id, COALESCE(v_order.payment_status, 'null');
    END IF;

    v_prefix := CASE p_type WHEN 'invoice' THEN 'INV' ELSE 'CN' END;
    v_year := TO_CHAR(NOW(), 'YYYY');
    v_counter_key := v_prefix || '-' || v_year;

    -- Gapless sequential number: the counter row lock serializes issuance
    INSERT INTO invoice_counters (counter_key, last_value)
    VALUES (v_counter_key, 0)
    ON CONFLICT (counter_key) DO NOTHING;

    UPDATE invoice_counters
    SET last_value = last_value + 1, updated_at = NOW()
    WHERE counter_key = v_counter_key
    RETURNING last_value INTO v_seq;

    v_invoice_number := v_counter_key || '-' || LPAD(v_seq::TEXT, 5, '0');

    -- Snapshot line items
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'product_name', oi.product_name,
                'variant_name', oi.variant_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total_price', oi.total_price
            )
            ORDER BY oi.created_at
        ),
        '[]'::jsonb
    )
    INTO v_line_items
    FROM order_items oi
    WHERE oi.order_id = p_order_id;

    RETURN QUERY
    INSERT INTO invoices (
        invoice_number,
        type,
        order_id,
        order_number,
        user_id,
        customer_email,
        customer_name,
        billing_address,
        shipping_address,
        currency,
        subtotal,
        tax_amount,
        discount_amount,
        shipping_cost,
        total_amount,
        line_items,
        payment_method,
        payment_provider
    )
    VALUES (
        v_invoice_number,
        p_type,
        v_order.id,
        v_order.order_number,
        v_order.user_id,
        v_order.customer_email,
        v_order.customer_name,
        v_order.billing_address,
        v_order.shipping_address,
        COALESCE(v_order.currency, 'USD'),
        COALESCE(v_order.subtotal, 0),
        COALESCE(v_order.tax_amount, 0),
        COALESCE(v_order.discount_amount, 0),
        COALESCE(v_order.shipping_cost, 0),
        COALESCE(v_order.total_amount, 0),
        v_line_items,
        v_order.payment_method,
        v_order.payment_provider
    )
    RETURNING *;
END;
$$;

-- Only edge functions (service role) may issue invoices
REVOKE EXECUTE ON FUNCTION create_invoice_for_order(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION create_invoice_for_order(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION create_invoice_for_order(UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION create_invoice_for_order(UUID, TEXT) TO service_role;
