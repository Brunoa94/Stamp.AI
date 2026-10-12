ALTER TABLE public.catalog_products
  ADD COLUMN promotional_price integer;

COMMENT ON COLUMN public.catalog_products.promotional_price IS
  'Optional promotional unit price in EUR cents. Takes priority over selling_price_cents.';

ALTER TABLE public.catalog_products
  ADD CONSTRAINT catalog_products_promotional_price_check CHECK (
    promotional_price IS NULL OR (
      promotional_price > 0 AND selling_price_cents IS NOT NULL
      AND promotional_price < selling_price_cents
    )
  );
