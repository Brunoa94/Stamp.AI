-- =====================================================
-- FIX: Sort providers by total cost (base + shipping)
-- =====================================================
-- Date: 2026-06-21
-- Description: Updates get_providers_for_product RPC to sort by total cost
--              instead of just base price, ensuring cheapest provider includes shipping
-- =====================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_providers_for_product(uuid, text);

-- Recreate with total_cost_cents column and proper sorting
CREATE OR REPLACE FUNCTION public.get_providers_for_product(
  p_product_id uuid,
  p_country_code text
)
RETURNS TABLE(
  provider_id integer,
  provider_name text,
  base_price_cents integer,
  currency_code text,
  shipping_cost_cents integer,
  production_time_days integer,
  total_cost_cents integer  -- NEW: Total cost for easier sorting
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.id AS provider_id,
    pp.name AS provider_name,
    ppa.base_price_cents,
    ppa.currency_code,
    ppa.shipping_cost_cents,
    ppa.production_time_days,
    (ppa.base_price_cents + COALESCE(ppa.shipping_cost_cents, 0)) AS total_cost_cents
  FROM product_provider_availability ppa
  JOIN print_providers pp ON pp.id = ppa.print_provider_id
  WHERE ppa.product_id = p_product_id
    AND ppa.country_code = p_country_code
    AND ppa.is_available = true
  ORDER BY (ppa.base_price_cents + COALESCE(ppa.shipping_cost_cents, 0)) ASC;  -- Sort by TOTAL cost
END;
$$;

-- Verify function works
COMMENT ON FUNCTION public.get_providers_for_product(uuid, text) IS
  'Returns available providers for a product in a specific country, sorted by total cost (base + shipping)';
