-- =====================================================
-- Create Products Provider Cache Table
-- Created: 2026-04-11
-- Description: Caches cheapest blueprint data from Printify API
--              to reduce API calls and improve performance
-- =====================================================

-- =====================================================
-- PRODUCTS_PROVIDER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products_provider (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Location & Provider Info
    country_code TEXT NOT NULL,
    blueprint_id INTEGER NOT NULL,
    print_provider_id INTEGER NOT NULL,

    -- Product Details
    title TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    model TEXT,
    images JSONB,
    print_areas JSONB,

    -- Pricing (in cents)
    min_price INTEGER NOT NULL,
    provider_name TEXT,
    shipping_cost INTEGER NOT NULL,
    total_cost INTEGER NOT NULL,

    -- Cache Management
    rank INTEGER NOT NULL, -- 1-4 for top cheapest options
    expires_at TIMESTAMPTZ NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique combination per country
    CONSTRAINT unique_country_blueprint_provider UNIQUE (country_code, blueprint_id, print_provider_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for country-specific queries
CREATE INDEX IF NOT EXISTS idx_products_provider_country ON products_provider(country_code);

-- Index for expiration checks (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_products_provider_expires ON products_provider(expires_at);

-- Index for ranking within country
CREATE INDEX IF NOT EXISTS idx_products_provider_rank ON products_provider(rank);

-- Composite index for the most common query: valid cache for a country
CREATE INDEX IF NOT EXISTS idx_products_provider_country_expires ON products_provider(country_code, expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE products_provider ENABLE ROW LEVEL SECURITY;

-- Public read access for non-expired records
DROP POLICY IF EXISTS "Anyone can view non-expired provider products" ON products_provider;
CREATE POLICY "Anyone can view non-expired provider products"
    ON products_provider
    FOR SELECT
    USING (expires_at > NOW());

-- Service role can manage all records
DROP POLICY IF EXISTS "Service role can manage all provider products" ON products_provider;
CREATE POLICY "Service role can manage all provider products"
    ON products_provider
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS update_products_provider_updated_at ON products_provider;
CREATE TRIGGER update_products_provider_updated_at
    BEFORE UPDATE ON products_provider
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE products_provider IS 'Caches the cheapest blueprint/provider combinations from Printify API with 24-hour expiration';
COMMENT ON COLUMN products_provider.country_code IS 'ISO country code (e.g., NL, US, GB)';
COMMENT ON COLUMN products_provider.blueprint_id IS 'Printify blueprint ID';
COMMENT ON COLUMN products_provider.print_provider_id IS 'Printify print provider ID';
COMMENT ON COLUMN products_provider.rank IS 'Ranking by total cost (1 = cheapest, 4 = 4th cheapest)';
COMMENT ON COLUMN products_provider.expires_at IS 'Cache expiration timestamp (typically NOW() + 24 hours)';
COMMENT ON COLUMN products_provider.min_price IS 'Base product price in cents';
COMMENT ON COLUMN products_provider.shipping_cost IS 'Shipping cost to country in cents';
COMMENT ON COLUMN products_provider.total_cost IS 'Total cost (min_price + shipping_cost) in cents';

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- To rollback this migration, create a new file with:
-- DROP TABLE IF EXISTS products_provider CASCADE;
