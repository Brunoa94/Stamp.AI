-- Remove the legacy 4-argument overload of process_refund_atomic.
--
-- 20260620000000 dropped it, but databases that were provisioned from an
-- earlier snapshot (e.g. the test project) still carry it next to the current
-- 6-argument version. PostgREST then cannot resolve calls that omit the
-- optional p_amount / p_currency arguments:
--   PGRST203 "Could not choose the best candidate function"
-- Idempotent: a no-op where the overload is already gone.
DROP FUNCTION IF EXISTS public.process_refund_atomic(text, text, text, text);
