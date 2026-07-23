-- ============================================
-- CATALOG-FIRST ARCHITECTURE
-- ============================================
-- This migration creates a catalog-first product system where:
-- 1. Products are global (not user-owned)
-- 2. Each product has multiple providers per country
-- 3. Prices are immediately available by country + provider
-- 4. Users select from catalog, not create on-demand
-- ============================================

-- ============================================
-- 1. PRODUCT CATALOG (Global Products)
-- ============================================
CREATE TABLE IF NOT EXISTS catalog_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID,
  base_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE catalog_products IS 'Global product catalog - represents Printify blueprint types';
COMMENT ON COLUMN catalog_products.blueprint_id IS 'Printify blueprint ID (e.g., 12 for Bella+Canvas 3001)';

-- ============================================
-- 2. PRINT PROVIDERS (Master List)
-- ============================================
CREATE TABLE IF NOT EXISTS print_providers (
  id INTEGER PRIMARY KEY, -- Printify provider ID
  name TEXT NOT NULL,
  description TEXT,
  supported_countries TEXT[], -- ['US', 'UK', 'FR', 'DE']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE print_providers IS 'Master list of print providers from Printify';

-- ============================================
-- 3. PRODUCT-PROVIDER-COUNTRY AVAILABILITY
-- ============================================
CREATE TABLE IF NOT EXISTS product_provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES catalog_products(id) ON DELETE CASCADE NOT NULL,
  print_provider_id INTEGER REFERENCES print_providers(id) NOT NULL,
  country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2 (US, GB, FR, DE)
  currency_code TEXT NOT NULL, -- ISO 4217 (USD, GBP, EUR)
  base_price_cents INTEGER NOT NULL,
  shipping_cost_cents INTEGER DEFAULT 0,
  production_time_days INTEGER,
  is_available BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, print_provider_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_availability_country_product
  ON product_provider_availability(country_code, product_id);
CREATE INDEX IF NOT EXISTS idx_availability_product_country
  ON product_provider_availability(product_id, country_code);

COMMENT ON TABLE product_provider_availability IS 'Which providers can print which products in which countries, with pricing';

-- ============================================
-- 4. PRODUCT VARIANTS (Catalog-Level)
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES catalog_products(id) ON DELETE CASCADE NOT NULL,
  printify_variant_id INTEGER NOT NULL,
  color TEXT,
  size TEXT,
  sku TEXT,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, printify_variant_id)
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_color_size ON product_variants(product_id, color, size);

COMMENT ON TABLE product_variants IS 'All possible color/size combinations for catalog products';

-- ============================================
-- 5. VARIANT PRICING (Provider-Country Specific)
-- ============================================
CREATE TABLE IF NOT EXISTS variant_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
  print_provider_id INTEGER REFERENCES print_providers(id) NOT NULL,
  country_code TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  cost_cents INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(variant_id, print_provider_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_pricing_lookup
  ON variant_pricing(variant_id, print_provider_id, country_code)
  WHERE is_available = true;

COMMENT ON TABLE variant_pricing IS 'Variant-specific pricing for each provider/country combination';

-- ============================================
-- 6. USER CUSTOM DESIGNS (User-Specific Data)
-- ============================================
CREATE TABLE IF NOT EXISTS user_custom_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id UUID REFERENCES catalog_products(id) NOT NULL,
  variant_id UUID REFERENCES product_variants(id),
  provider_id INTEGER REFERENCES print_providers(id) NOT NULL,
  country_code TEXT NOT NULL,
  design_image_url TEXT NOT NULL, -- User's custom design (stored in Supabase Storage)
  printify_product_id TEXT, -- Created when user orders (lazy creation)
  printify_image_id TEXT, -- Printify's uploaded image ID
  status TEXT DEFAULT 'draft', -- draft, created, ordered, fulfilled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_designs ON user_custom_designs(user_id, status);

COMMENT ON TABLE user_custom_designs IS 'User-specific product customizations (not full products)';

-- ============================================
-- 7. RPC FUNCTIONS FOR COMPLEX QUERIES
-- ============================================

-- Function to get providers for a product in a specific country
CREATE OR REPLACE FUNCTION get_providers_for_product(
  p_product_id UUID,
  p_country_code TEXT
)
RETURNS TABLE (
  provider_id INTEGER,
  provider_name TEXT,
  base_price_cents INTEGER,
  currency_code TEXT,
  shipping_cost_cents INTEGER,
  production_time_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.id AS provider_id,
    pp.name AS provider_name,
    ppa.base_price_cents,
    ppa.currency_code,
    ppa.shipping_cost_cents,
    ppa.production_time_days
  FROM product_provider_availability ppa
  JOIN print_providers pp ON pp.id = ppa.print_provider_id
  WHERE ppa.product_id = p_product_id
    AND ppa.country_code = p_country_code
    AND ppa.is_available = true
  ORDER BY ppa.base_price_cents ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get variant pricing
CREATE OR REPLACE FUNCTION get_variant_price(
  p_product_id UUID,
  p_color TEXT,
  p_size TEXT,
  p_provider_id INTEGER,
  p_country_code TEXT
)
RETURNS TABLE (
  variant_id UUID,
  color TEXT,
  size TEXT,
  title TEXT,
  price_cents INTEGER,
  cost_cents INTEGER,
  currency_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.id AS variant_id,
    pv.color,
    pv.size,
    pv.title,
    vp.price_cents,
    vp.cost_cents,
    vp.currency_code
  FROM product_variants pv
  JOIN variant_pricing vp ON vp.variant_id = pv.id
  WHERE pv.product_id = p_product_id
    AND pv.color = p_color
    AND pv.size = p_size
    AND vp.print_provider_id = p_provider_id
    AND vp.country_code = p_country_code
    AND vp.is_available = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get cheapest provider for a product variant
CREATE OR REPLACE FUNCTION get_cheapest_provider(
  p_product_id UUID,
  p_color TEXT,
  p_size TEXT,
  p_country_code TEXT
)
RETURNS TABLE (
  provider_name TEXT,
  price_cents INTEGER,
  shipping_cost_cents INTEGER,
  total_cents INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.name AS provider_name,
    vp.price_cents,
    ppa.shipping_cost_cents,
    (vp.price_cents + COALESCE(ppa.shipping_cost_cents, 0)) AS total_cents
  FROM product_variants pv
  JOIN variant_pricing vp ON vp.variant_id = pv.id
  JOIN print_providers pp ON pp.id = vp.print_provider_id
  JOIN product_provider_availability ppa
    ON ppa.product_id = pv.product_id
    AND ppa.print_provider_id = vp.print_provider_id
    AND ppa.country_code = vp.country_code
  WHERE pv.product_id = p_product_id
    AND pv.color = p_color
    AND pv.size = p_size
    AND vp.country_code = p_country_code
    AND vp.is_available = true
  ORDER BY total_cents ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
