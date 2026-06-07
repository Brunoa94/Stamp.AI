-- =====================================================
-- PROVIDER CATALOG TABLE
-- =====================================================
-- Migration: Create provider catalog cache for Printify providers, blueprints, variants, and shipping
-- Purpose: Store comprehensive provider catalog data with 36-hour TTL for fast lookups
-- Author: Generated via Claude Code
-- Date: 2026-06-08

CREATE TABLE IF NOT EXISTS provider_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Blueprint & Provider Identifiers
    blueprint_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    provider_name TEXT NOT NULL,
    provider_location TEXT,

    -- Variants Data (JSONB array of variant objects)
    -- Structure: [{ id, title, price, is_enabled, options: { color, size } }]
    variants_data JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Shipping Profiles (JSONB array of shipping profile objects)
    -- Structure: [{ variant_ids, first_item: { cost }, additional_items: { cost }, countries: [{ code, first_item: { cost }, additional_items: { cost } }] }]
    shipping_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Cache Metadata (pre-computed aggregates for fast queries)
    -- Structure: { variants_count, colors_available, sizes_available, min_price, max_price }
    cache_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Cache Management
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one entry per blueprint-provider combination
    CONSTRAINT unique_blueprint_provider UNIQUE (blueprint_id, provider_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for blueprint queries (most common access pattern)
CREATE INDEX IF NOT EXISTS idx_provider_catalog_blueprint
ON provider_catalog(blueprint_id);

-- Index for provider queries
CREATE INDEX IF NOT EXISTS idx_provider_catalog_provider
ON provider_catalog(provider_id);

-- Index for cache expiration checks
-- Note: Removed WHERE clause because NOW() is not IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_provider_catalog_expires
ON provider_catalog(expires_at);

-- Composite index for valid cache queries by blueprint
-- Note: Removed WHERE clause because NOW() is not IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_provider_catalog_blueprint_valid
ON provider_catalog(blueprint_id, expires_at);

-- GIN index for JSONB metadata queries (for advanced filtering)
CREATE INDEX IF NOT EXISTS idx_provider_catalog_metadata
ON provider_catalog USING GIN (cache_metadata);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE provider_catalog ENABLE ROW LEVEL SECURITY;

-- Public read access for non-expired records
DROP POLICY IF EXISTS "Anyone can view non-expired catalog entries" ON provider_catalog;
CREATE POLICY "Anyone can view non-expired catalog entries"
    ON provider_catalog
    FOR SELECT
    USING (expires_at > NOW());

-- Service role can manage all records
DROP POLICY IF EXISTS "Service role can manage catalog" ON provider_catalog;
CREATE POLICY "Service role can manage catalog"
    ON provider_catalog
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get providers for a blueprint with summary info
CREATE OR REPLACE FUNCTION get_providers_for_blueprint(
    p_blueprint_id INTEGER
)
RETURNS TABLE (
    provider_id INTEGER,
    provider_name TEXT,
    variants_count INTEGER,
    min_price INTEGER,
    colors_available TEXT[],
    sizes_available TEXT[]
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pc.provider_id,
        pc.provider_name,
        (pc.cache_metadata->>'variants_count')::INTEGER as variants_count,
        (pc.cache_metadata->>'min_price')::INTEGER as min_price,
        ARRAY(SELECT jsonb_array_elements_text(pc.cache_metadata->'colors_available')) as colors_available,
        ARRAY(SELECT jsonb_array_elements_text(pc.cache_metadata->'sizes_available')) as sizes_available
    FROM provider_catalog pc
    WHERE pc.blueprint_id = p_blueprint_id
      AND pc.expires_at > NOW()
    ORDER BY (pc.cache_metadata->>'min_price')::INTEGER ASC;
END;
$$;

-- Function to check if cache is valid for specific blueprints
CREATE OR REPLACE FUNCTION has_valid_catalog_cache(
    p_blueprint_ids INTEGER[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT blueprint_id)
    INTO missing_count
    FROM unnest(p_blueprint_ids) AS blueprint_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM provider_catalog pc
        WHERE pc.blueprint_id = blueprint_id
          AND pc.expires_at > NOW()
    );

    RETURN missing_count = 0;
END;
$$;

-- Function to find best provider for a blueprint + country combination
CREATE OR REPLACE FUNCTION get_best_provider_for_country(
    p_blueprint_id INTEGER,
    p_country_code TEXT
)
RETURNS TABLE (
    provider_id INTEGER,
    provider_name TEXT,
    total_cost INTEGER,
    product_price INTEGER,
    shipping_cost INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH provider_costs AS (
        SELECT
            pc.provider_id,
            pc.provider_name,
            (pc.cache_metadata->>'min_price')::INTEGER as min_product_price,
            -- Extract shipping cost for the specific country from shipping_profiles
            -- Real structure: profiles[{countries:["US","NL"], first_item:{cost:449}}]
            (
                SELECT MIN((profile->'first_item'->>'cost')::INTEGER)
                FROM jsonb_array_elements(pc.shipping_profiles) AS profile
                WHERE p_country_code = ANY(
                    ARRAY(SELECT jsonb_array_elements_text(profile->'countries'))
                )
            ) as country_shipping_cost
        FROM provider_catalog pc
        WHERE pc.blueprint_id = p_blueprint_id
          AND pc.expires_at > NOW()
    )
    SELECT
        pc.provider_id,
        pc.provider_name,
        (pc.min_product_price + COALESCE(pc.country_shipping_cost, 0)) as total_cost,
        pc.min_product_price as product_price,
        COALESCE(pc.country_shipping_cost, 0) as shipping_cost
    FROM provider_costs pc
    WHERE pc.country_shipping_cost IS NOT NULL
    ORDER BY total_cost ASC
    LIMIT 1;
END;
$$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE provider_catalog IS 'Caches provider catalog data for blueprints with 36-hour TTL';
COMMENT ON COLUMN provider_catalog.blueprint_id IS 'Printify blueprint ID (product type)';
COMMENT ON COLUMN provider_catalog.provider_id IS 'Printify print provider ID';
COMMENT ON COLUMN provider_catalog.variants_data IS 'JSONB array of variant objects with pricing, sizes, colors, and availability';
COMMENT ON COLUMN provider_catalog.shipping_profiles IS 'JSONB array of shipping profiles with country-specific costs in cents';
COMMENT ON COLUMN provider_catalog.cache_metadata IS 'Pre-computed aggregates (min/max price, available colors/sizes) for fast filtering';
COMMENT ON COLUMN provider_catalog.expires_at IS 'Cache expiration timestamp (36 hours from fetched_at)';
COMMENT ON COLUMN provider_catalog.fetched_at IS 'When this data was fetched from Printify API';

COMMENT ON FUNCTION get_providers_for_blueprint(INTEGER) IS 'Get all providers for a blueprint with summary info, sorted by price';
COMMENT ON FUNCTION has_valid_catalog_cache(INTEGER[]) IS 'Check if cache is valid (not expired) for given blueprint IDs';
COMMENT ON FUNCTION get_best_provider_for_country(INTEGER, TEXT) IS 'Find the best provider (lowest total cost) for a blueprint and country';
