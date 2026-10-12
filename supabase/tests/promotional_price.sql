-- Run only against a disposable PostgreSQL database:
-- psql "$PROMOTIONS_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/promotional_price.sql
BEGIN;
CREATE TABLE public.catalog_products (blueprint_id integer PRIMARY KEY, selling_price_cents integer);
\ir ../migrations/20261012120000_add_promotional_price.sql
INSERT INTO public.catalog_products VALUES (6, 3000, NULL);
UPDATE public.catalog_products SET promotional_price = 2000 WHERE blueprint_id = 6;
DO $$
DECLARE bad integer;
BEGIN
  FOREACH bad IN ARRAY ARRAY[0, -1, 3000, 3001] LOOP
    BEGIN
      UPDATE public.catalog_products SET promotional_price = bad WHERE blueprint_id = 6;
      RAISE EXCEPTION 'Accepted invalid promotion %', bad;
    EXCEPTION WHEN check_violation THEN NULL;
    END;
  END LOOP;
  BEGIN
    UPDATE public.catalog_products SET selling_price_cents = NULL WHERE blueprint_id = 6;
    RAISE EXCEPTION 'Accepted promotion without regular price';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    UPDATE public.catalog_products SET selling_price_cents = 1999 WHERE blueprint_id = 6;
    RAISE EXCEPTION 'Accepted regular price below active promotion';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
UPDATE public.catalog_products SET promotional_price = NULL WHERE blueprint_id = 6;
UPDATE public.catalog_products SET selling_price_cents = NULL WHERE blueprint_id = 6;
ROLLBACK;
