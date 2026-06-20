-- Run this in your SOURCE database to check if generate_order_number exists

SELECT pg_get_functiondef(oid) || ';' as definition
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'generate_order_number';
