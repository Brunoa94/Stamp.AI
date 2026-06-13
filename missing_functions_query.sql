-- Run this in your SOURCE database SQL Editor to get the missing trigger functions

SELECT pg_get_functiondef(oid) || ';' as definition
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('update_updated_at_column', 'set_order_number');
