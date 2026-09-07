-- Add the "fixed_total" promo code type: value is the final
-- all-inclusive order total in euros (shipping included), and seed the
-- REDUCE_TOTAL code that reduces any order to 0.50.

ALTER TABLE promocodes DROP CONSTRAINT IF EXISTS promocodes_type_check;
ALTER TABLE promocodes
  ADD CONSTRAINT promocodes_type_check
  CHECK (type IN ('percentage', 'numeric', 'fixed_total'));

INSERT INTO promocodes (code, type, value)
VALUES ('REDUCE_TOTAL', 'fixed_total', 0.50)
ON CONFLICT (code) DO UPDATE
  SET type = EXCLUDED.type,
      value = EXCLUDED.value;
