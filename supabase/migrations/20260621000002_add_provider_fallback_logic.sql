-- =====================================================
-- ADD FALLBACK PROVIDER LOGIC
-- =====================================================
-- Date: 2026-06-21
-- Description: When no providers available in NL, fallback to nearby countries
--              with shipping cost <= €6 (or equivalent in USD ~$6.50)
-- Rule: "If there are no providers in NL, find the next cheapest provider
--        outside of Netherlands where the shipping price is lower than €6"
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_providers_for_product_with_fallback(
  p_product_id uuid,
  p_country_code text DEFAULT 'NL',
  p_max_shipping_cents integer DEFAULT 650  -- ~$6.50 USD (equivalent to €6)
)
RETURNS TABLE(
  provider_id integer,
  provider_name text,
  base_price_cents integer,
  currency_code text,
  shipping_cost_cents integer,
  production_time_days integer,
  total_cost_cents integer,
  country_code text,
  is_fallback boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  primary_provider_count integer;
BEGIN
  -- Check if there are any providers for the requested country
  SELECT COUNT(*) INTO primary_provider_count
  FROM product_provider_availability ppa
  WHERE ppa.product_id = p_product_id
    AND ppa.country_code = p_country_code
    AND ppa.is_available = true;

  -- If primary country has providers, return those
  IF primary_provider_count > 0 THEN
    RETURN QUERY
    SELECT
      pp.id AS provider_id,
      pp.name AS provider_name,
      ppa.base_price_cents,
      ppa.currency_code,
      ppa.shipping_cost_cents,
      ppa.production_time_days,
      (ppa.base_price_cents + COALESCE(ppa.shipping_cost_cents, 0)) AS total_cost_cents,
      ppa.country_code,
      false AS is_fallback
    FROM product_provider_availability ppa
    JOIN print_providers pp ON pp.id = ppa.print_provider_id
    WHERE ppa.product_id = p_product_id
      AND ppa.country_code = p_country_code
      AND ppa.is_available = true
    ORDER BY (ppa.base_price_cents + COALESCE(ppa.shipping_cost_cents, 0)) ASC;

  ELSE
    -- FALLBACK: Find cheapest providers from other countries
    -- with reasonable shipping costs
    RETURN QUERY
    SELECT
      pp.id AS provider_id,
      pp.name AS provider_name,
      ppa.base_price_cents,
      ppa.currency_code,
      ppa.shipping_cost_cents,
      ppa.production_time_days,
      (ppa.base_price_cents + COALESCE(ppa.shipping_cost_cents, 0)) AS total_cost_cents,
      ppa.country_code,
      true AS is_fallback
    FROM product_provider_availability ppa
    JOIN print_providers pp ON pp.id = ppa.print_provider_id
    WHERE ppa.product_id = p_product_id
      AND ppa.is_available = true
      AND ppa.country_code != p_country_code  -- Exclude primary country
      AND ppa.shipping_cost_cents <= p_max_shipping_cents  -- Max shipping limit
      -- Prioritize nearby European countries, then US
      AND ppa.country_code IN ('BE', 'DE', 'FR', 'GB', 'ES', 'IT', 'AT', 'DK', 'SE', 'NO', 'US')
    ORDER BY
      -- Priority: Closest neighbors > Other EU > US
      CASE
        WHEN ppa.country_code IN ('BE', 'DE', 'FR') THEN 1
        WHEN ppa.country_code IN ('GB', 'ES', 'IT', 'AT', 'DK', 'SE', 'NO') THEN 2
        ELSE 3
      END,
      (ppa.base_price_cents + COALESCE(ppa.shipping_cost_cents, 0)) ASC
    LIMIT 10;
  END IF;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION public.get_providers_for_product_with_fallback(uuid, text, integer) IS
  'Returns available providers for a product in specified country.
   If no providers available, falls back to nearby countries with shipping <= specified amount (default ~$6.50 USD / €6 EUR).
   Sorted by proximity and total cost.';
