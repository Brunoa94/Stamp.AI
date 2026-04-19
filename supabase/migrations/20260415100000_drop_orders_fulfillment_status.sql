-- Drop fulfillment_status column from orders table
--
-- Rationale: The `status` column already tracks the order lifecycle
-- (pending -> confirmed -> processing -> shipped -> delivered -> cancelled/fulfillment_failed)
-- and the `payment_status` column tracks payment state (pending, paid, failed, refunded).
--
-- The `fulfillment_status` on orders was redundant since:
-- 1. Nothing in the codebase was writing to it (always null)
-- 2. The `status` field already captures these states
-- 3. Item-level fulfillment tracking remains on `order_items.fulfillment_status`
--
-- This consolidates from 3 status fields to 2:
-- - status (order lifecycle)
-- - payment_status (payment state)

ALTER TABLE public.orders DROP COLUMN IF EXISTS fulfillment_status;
