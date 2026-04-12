-- =====================================================
-- Atomicity Implementation Test Suite
-- Run this after applying the migration to verify all fixes
-- =====================================================

-- Clean up any existing test data
DELETE FROM payment_transactions WHERE order_id::text LIKE 'test-%';
DELETE FROM orders WHERE id::text LIKE 'test-%';
DELETE FROM webhook_events WHERE event_id LIKE 'test-%';

-- =====================================================
-- TEST 1: Atomic Refund Operation
-- =====================================================
\echo '========================================='
\echo 'TEST 1: Atomic Refund Operation'
\echo '========================================='

-- Create test order
INSERT INTO orders (id, user_id, order_number, payment_status, status, subtotal, total_amount, currency)
VALUES (
  'test-order-refund-1'::uuid,
  'test-user-1'::uuid,
  'ORD-TEST-REFUND-001',
  'paid',
  'confirmed',
  100.00,
  100.00,
  'USD'
);

-- Create test payment transaction
INSERT INTO payment_transactions (
  order_id,
  payment_provider,
  amount,
  currency,
  status,
  stripe_payment_intent_id
)
VALUES (
  'test-order-refund-1'::uuid,
  'stripe',
  100.00,
  'usd',
  'succeeded',
  'pi_test_12345'
);

\echo 'Before refund:'
SELECT
  o.id,
  o.payment_status as order_payment_status,
  pt.status as transaction_status
FROM orders o
JOIN payment_transactions pt ON pt.order_id = o.id
WHERE o.id = 'test-order-refund-1'::uuid;

-- Execute atomic refund
SELECT process_refund_atomic(
  'test-order-refund-1',
  'refund_test_12345',
  'Test refund operation',
  'stripe'
);

\echo 'After refund (both should be "refunded"):'
SELECT
  o.id,
  o.payment_status as order_payment_status,
  pt.status as transaction_status
FROM orders o
JOIN payment_transactions pt ON pt.order_id = o.id
WHERE o.id = 'test-order-refund-1'::uuid;

\echo 'Expected: Both payment_status and transaction_status = "refunded"'
\echo ''

-- =====================================================
-- TEST 2: Temp Order Refund (No Order Exists)
-- =====================================================
\echo '========================================='
\echo 'TEST 2: Temp Order Refund'
\echo '========================================='

-- Create payment transaction without order
INSERT INTO payment_transactions (
  payment_provider,
  amount,
  currency,
  status,
  stripe_payment_intent_id
)
VALUES (
  'stripe',
  50.00,
  'usd',
  'succeeded',
  'pi_test_temp_67890'
);

-- Execute atomic refund with temp order_id
SELECT process_refund_atomic(
  'temp_stripe_pi_test_temp_67890',
  'refund_temp_67890',
  'Refund for failed order creation',
  'stripe'
);

\echo 'Transaction should be refunded (order update skipped for temp orders):'
SELECT status
FROM payment_transactions
WHERE stripe_payment_intent_id = 'pi_test_temp_67890';

\echo 'Expected: status = "refunded"'
\echo ''

-- =====================================================
-- TEST 3: Webhook Idempotency
-- =====================================================
\echo '========================================='
\echo 'TEST 3: Webhook Idempotency'
\echo '========================================='

-- First webhook
SELECT record_webhook_event(
  'paypal',
  'test-event-123',
  'PAYMENT.CAPTURE.COMPLETED',
  '{"test": "data"}'::jsonb
);

\echo 'First webhook recorded:'
SELECT event_id, processing_status FROM webhook_events WHERE event_id = 'test-event-123';

-- Check if processed
SELECT is_webhook_processed('paypal', 'test-event-123') as already_processed;

\echo 'Expected: already_processed = true'

-- Duplicate webhook
SELECT record_webhook_event(
  'paypal',
  'test-event-123',
  'PAYMENT.CAPTURE.COMPLETED',
  '{"test": "data"}'::jsonb
);

\echo 'After duplicate webhook:'
SELECT event_id, processing_status FROM webhook_events WHERE event_id = 'test-event-123';

\echo 'Expected: processing_status = "duplicate"'
\echo ''

-- =====================================================
-- TEST 4: Atomic Order Status Update
-- =====================================================
\echo '========================================='
\echo 'TEST 4: Atomic Order Status Update'
\echo '========================================='

-- Create test order
INSERT INTO orders (id, user_id, order_number, payment_status, status, subtotal, total_amount, currency)
VALUES (
  'test-order-status-1'::uuid,
  'test-user-1'::uuid,
  'ORD-TEST-STATUS-001',
  'pending',
  'pending',
  75.00,
  75.00,
  'USD'
);

\echo 'Before update:'
SELECT id, payment_status, status FROM orders WHERE id = 'test-order-status-1'::uuid;

-- Execute atomic status update
SELECT update_order_payment_status_atomic(
  'test-order-status-1'::uuid,
  'paid',
  'confirmed',
  'paypal'
);

\echo 'After update (should be paid/confirmed):'
SELECT id, payment_status, status, payment_method FROM orders WHERE id = 'test-order-status-1'::uuid;

\echo 'Expected: payment_status=paid, status=confirmed, payment_method=paypal'
\echo ''

-- =====================================================
-- TEST 5: Check Constraint Validation
-- =====================================================
\echo '========================================='
\echo 'TEST 5: Check Constraint Validation'
\echo '========================================='

\echo 'Testing invalid payment_status (should fail):'
-- This should fail
DO $$
BEGIN
  UPDATE orders SET payment_status = 'invalid_status' WHERE id = 'test-order-status-1'::uuid;
  RAISE EXCEPTION 'CONSTRAINT FAILED: Invalid status was allowed!';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE '✅ Constraint working: Invalid payment_status rejected';
END $$;

\echo 'Testing invalid order status (should fail):'
-- This should fail
DO $$
BEGIN
  UPDATE orders SET status = 'invalid_status' WHERE id = 'test-order-status-1'::uuid;
  RAISE EXCEPTION 'CONSTRAINT FAILED: Invalid status was allowed!';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE '✅ Constraint working: Invalid order status rejected';
END $$;

\echo ''

-- =====================================================
-- TEST 6: Foreign Key Constraint
-- =====================================================
\echo '========================================='
\echo 'TEST 6: Foreign Key Constraint'
\echo '========================================='

\echo 'Testing orphaned transaction prevention (should fail):'
-- This should fail
DO $$
BEGIN
  INSERT INTO payment_transactions (order_id, payment_provider, amount, status)
  VALUES ('99999999-9999-9999-9999-999999999999'::uuid, 'stripe', 50.00, 'succeeded');
  RAISE EXCEPTION 'CONSTRAINT FAILED: Orphaned transaction was allowed!';
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE NOTICE '✅ Foreign key working: Orphaned transaction prevented';
END $$;

\echo 'Testing cascade behavior on order deletion:'
-- Create order with transaction
INSERT INTO orders (id, user_id, order_number, payment_status, status, subtotal, total_amount, currency)
VALUES (
  'test-order-cascade-1'::uuid,
  'test-user-1'::uuid,
  'ORD-TEST-CASCADE-001',
  'paid',
  'confirmed',
  25.00,
  25.00,
  'USD'
);

INSERT INTO payment_transactions (order_id, payment_provider, amount, status)
VALUES ('test-order-cascade-1'::uuid, 'stripe', 25.00, 'succeeded');

-- Delete the order
DELETE FROM orders WHERE id = 'test-order-cascade-1'::uuid;

-- Check if transaction order_id was set to NULL
SELECT
  CASE
    WHEN order_id IS NULL THEN '✅ Cascade working: order_id set to NULL'
    ELSE '❌ Cascade failed: order_id still set'
  END as cascade_result
FROM payment_transactions
WHERE amount = 25.00 AND payment_provider = 'stripe'
LIMIT 1;

\echo ''

-- =====================================================
-- TEST 7: Status Alignment Trigger
-- =====================================================
\echo '========================================='
\echo 'TEST 7: Status Alignment Trigger'
\echo '========================================='

-- Create order with misaligned status (older than 5 minutes)
INSERT INTO orders (
  id,
  user_id,
  order_number,
  payment_status,
  status,
  subtotal,
  total_amount,
  currency,
  created_at
)
VALUES (
  'test-order-alignment-1'::uuid,
  'test-user-1'::uuid,
  'ORD-TEST-ALIGN-001',
  'paid',
  'pending',
  50.00,
  50.00,
  'USD',
  NOW() - INTERVAL '10 minutes'
);

\echo 'Testing status alignment trigger (should show warning in logs):'
-- This should trigger a warning
UPDATE orders
SET updated_at = NOW()
WHERE id = 'test-order-alignment-1'::uuid;

\echo 'Check PostgreSQL logs for WARNING message about misaligned status'
\echo ''

-- =====================================================
-- CLEANUP
-- =====================================================
\echo '========================================='
\echo 'Cleanup Test Data'
\echo '========================================='

DELETE FROM payment_transactions WHERE order_id::text LIKE 'test-%' OR order_id IS NULL;
DELETE FROM orders WHERE id::text LIKE 'test-%';
DELETE FROM webhook_events WHERE event_id LIKE 'test-%';

\echo '✅ All test data cleaned up'
\echo ''

-- =====================================================
-- SUMMARY
-- =====================================================
\echo '========================================='
\echo 'Test Summary'
\echo '========================================='
\echo '✅ TEST 1: Atomic refund operation'
\echo '✅ TEST 2: Temp order refund handling'
\echo '✅ TEST 3: Webhook idempotency'
\echo '✅ TEST 4: Atomic order status update'
\echo '✅ TEST 5: Check constraint validation'
\echo '✅ TEST 6: Foreign key constraint'
\echo '✅ TEST 7: Status alignment trigger'
\echo ''
\echo 'All atomicity tests completed!'
\echo 'Review output above for any failures.'
