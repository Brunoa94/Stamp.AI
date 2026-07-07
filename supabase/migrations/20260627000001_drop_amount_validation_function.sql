-- Drop the record_amount_validation_failure function with correct signature
-- This was missed in the previous migration due to incorrect parameter types

DROP FUNCTION IF EXISTS record_amount_validation_failure(
  TEXT, TEXT, NUMERIC, TEXT, NUMERIC, UUID, JSONB, TEXT
) CASCADE;
