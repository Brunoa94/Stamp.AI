/**
 * E2E Tests for Data Integrity & Idempotency Fixes
 *
 * Tests all critical fixes with real database operations
 * Run against test database to verify integrity
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for testing (service role)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper to generate test UUIDs
const generateTestId = () => crypto.randomUUID();

// Clean up test data after each test
test.afterEach(async () => {
  // Clean up test orders, payments, cart items created during tests
  await supabaseAdmin.from('cart_items').delete().like('cart_id', 'test-%');
  await supabaseAdmin.from('carts').delete().like('id', 'test-%');
  await supabaseAdmin.from('payment_transactions').delete().like('stripe_payment_intent_id', 'pi_test%');
  await supabaseAdmin.from('payment_transactions').delete().like('paypal_order_id', 'paypal_test%');
  await supabaseAdmin.from('orders').delete().like('idempotency_key', 'test_%');
});

test.describe('Database Constraints', () => {

  test('should prevent duplicate Stripe payment intents', async () => {
    const testUserId = generateTestId();
    const testPaymentIntentId = 'pi_test_duplicate_' + Date.now();

    // Insert first payment
    const { data: first, error: firstError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: testUserId,
        payment_provider: 'stripe',
        stripe_payment_intent_id: testPaymentIntentId,
        amount: 100,
        currency: 'usd',
        status: 'processing',
        payment_method_type: 'card',
      })
      .select()
      .single();

    expect(firstError).toBeNull();
    expect(first).toBeTruthy();

    // Try to insert duplicate
    const { data: duplicate, error: duplicateError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: testUserId,
        payment_provider: 'stripe',
        stripe_payment_intent_id: testPaymentIntentId,
        amount: 200,
        currency: 'usd',
        status: 'processing',
        payment_method_type: 'card',
      })
      .select()
      .single();

    // Should fail with unique constraint violation
    expect(duplicateError).toBeTruthy();
    expect(duplicateError?.code).toBe('23505'); // PostgreSQL unique violation
    expect(duplicate).toBeNull();

    console.log('✅ Stripe duplicate prevention working');
  });

  test('should prevent duplicate PayPal orders', async () => {
    const testUserId = generateTestId();
    const testPayPalOrderId = 'paypal_test_duplicate_' + Date.now();

    // Insert first payment
    const { error: firstError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: testUserId,
        payment_provider: 'paypal',
        paypal_order_id: testPayPalOrderId,
        amount: 100,
        currency: 'usd',
        status: 'processing',
        payment_method_type: 'paypal',
      });

    expect(firstError).toBeNull();

    // Try to insert duplicate
    const { error: duplicateError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        user_id: testUserId,
        payment_provider: 'paypal',
        paypal_order_id: testPayPalOrderId,
        amount: 200,
        currency: 'usd',
        status: 'processing',
        payment_method_type: 'paypal',
      });

    // Should fail with unique constraint violation
    expect(duplicateError).toBeTruthy();
    expect(duplicateError?.code).toBe('23505');

    console.log('✅ PayPal duplicate prevention working');
  });

  test('should prevent duplicate order idempotency keys', async () => {
    const testUserId = generateTestId();
    const testIdempotencyKey = 'test_idempotency_' + Date.now();

    // Insert first order
    const { error: firstError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: testUserId,
        order_number: 'ORD-TEST-001',
        idempotency_key: testIdempotencyKey,
        subtotal: 100,
        total: 100,
        payment_status: 'pending',
        status: 'pending',
      });

    expect(firstError).toBeNull();

    // Try to insert duplicate
    const { error: duplicateError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: testUserId,
        order_number: 'ORD-TEST-002',
        idempotency_key: testIdempotencyKey,
        subtotal: 200,
        total: 200,
        payment_status: 'pending',
        status: 'pending',
      });

    // Should fail with unique constraint violation
    expect(duplicateError).toBeTruthy();
    expect(duplicateError?.code).toBe('23505');

    console.log('✅ Order idempotency key duplicate prevention working');
  });
});

test.describe('Atomic Payment Capture', () => {

  test('should atomically update payment and order for PayPal', async () => {
    const testUserId = generateTestId();
    const testOrderId = generateTestId();
    const testPayPalOrderId = 'paypal_test_atomic_' + Date.now();

    // Create order
    await supabaseAdmin.from('orders').insert({
      id: testOrderId,
      user_id: testUserId,
      order_number: 'ORD-ATOMIC-001',
      subtotal: 100,
      total: 100,
      payment_status: 'pending',
      order_status: 'pending',
    });

    // Create payment transaction
    await supabaseAdmin.from('payment_transactions').insert({
      user_id: testUserId,
      order_id: testOrderId,
      payment_provider: 'paypal',
      paypal_order_id: testPayPalOrderId,
      amount: 100,
      currency: 'usd',
      status: 'pending',
    });

    // Call atomic capture function
    const { data: result, error } = await supabaseAdmin.rpc(
      'atomic_paypal_payment_capture',
      {
        p_paypal_order_id: testPayPalOrderId,
        p_paypal_capture_id: 'CAPTURE-123',
        p_amount: 100,
        p_currency: 'USD',
      }
    );

    expect(error).toBeNull();
    expect(result).toBeTruthy();
    expect(result.success).toBe(true);

    // Verify payment transaction updated
    const { data: payment } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('paypal_order_id', testPayPalOrderId)
      .single();

    expect(payment?.status).toBe('succeeded');
    expect(payment?.paypal_capture_id).toBe('CAPTURE-123');

    // Verify order updated
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', testOrderId)
      .single();

    expect(order?.payment_status).toBe('paid');

    console.log('✅ Atomic PayPal payment capture working');
  });

  test('should rollback on payment capture failure', async () => {
    const testUserId = generateTestId();
    const invalidOrderId = 'invalid_order_that_does_not_exist';

    // Try to capture non-existent payment
    const { data: result, error } = await supabaseAdmin.rpc(
      'atomic_paypal_payment_capture',
      {
        p_paypal_order_id: invalidOrderId,
        p_paypal_capture_id: 'CAPTURE-456',
        p_amount: 100,
        p_currency: 'USD',
      }
    );

    // Should fail
    expect(error).toBeTruthy();
    expect(result).toBeNull();

    // Verify no partial updates occurred
    const { data: payment } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('paypal_order_id', invalidOrderId)
      .single();

    expect(payment).toBeNull();

    console.log('✅ Atomic rollback on failure working');
  });
});

test.describe('Webhook UPSERT Functions', () => {

  test('should upsert Stripe payment transaction', async () => {
    const testUserId = generateTestId();
    const testPaymentIntentId = 'pi_test_upsert_' + Date.now();

    // First UPSERT (INSERT)
    const { data: first, error: firstError } = await supabaseAdmin.rpc(
      'upsert_stripe_payment_transaction',
      {
        p_stripe_payment_intent_id: testPaymentIntentId,
        p_user_id: testUserId,
        p_stripe_customer_id: 'cus_test',
        p_amount: 100,
        p_currency: 'usd',
        p_status: 'pending',
        p_payment_method_type: 'card',
        p_metadata: { test: true },
      }
    );

    expect(firstError).toBeNull();
    expect(first).toBeTruthy();
    expect(first.status).toBe('pending');

    // Second UPSERT (UPDATE)
    const { data: second, error: secondError } = await supabaseAdmin.rpc(
      'upsert_stripe_payment_transaction',
      {
        p_stripe_payment_intent_id: testPaymentIntentId,
        p_user_id: testUserId,
        p_stripe_customer_id: 'cus_test',
        p_amount: 100,
        p_currency: 'usd',
        p_status: 'succeeded',
        p_payment_method_type: 'card',
        p_metadata: { test: true, updated: true },
      }
    );

    expect(secondError).toBeNull();
    expect(second).toBeTruthy();
    expect(second.status).toBe('succeeded');
    expect(second.id).toBe(first.id); // Same record

    // Verify only one record exists
    const { data: records, count } = await supabaseAdmin
      .from('payment_transactions')
      .select('*', { count: 'exact' })
      .eq('stripe_payment_intent_id', testPaymentIntentId);

    expect(count).toBe(1);
    expect(records?.[0].status).toBe('succeeded');

    console.log('✅ Stripe webhook UPSERT working');
  });

  test('should handle concurrent webhook UPSERTs', async () => {
    const testUserId = generateTestId();
    const testPaymentIntentId = 'pi_test_concurrent_' + Date.now();

    // Simulate concurrent webhooks
    const results = await Promise.all([
      supabaseAdmin.rpc('upsert_stripe_payment_transaction', {
        p_stripe_payment_intent_id: testPaymentIntentId,
        p_user_id: testUserId,
        p_stripe_customer_id: 'cus_test',
        p_amount: 100,
        p_currency: 'usd',
        p_status: 'pending',
        p_payment_method_type: 'card',
        p_metadata: {},
      }),
      supabaseAdmin.rpc('upsert_stripe_payment_transaction', {
        p_stripe_payment_intent_id: testPaymentIntentId,
        p_user_id: testUserId,
        p_stripe_customer_id: 'cus_test',
        p_amount: 100,
        p_currency: 'usd',
        p_status: 'succeeded',
        p_payment_method_type: 'card',
        p_metadata: {},
      }),
    ]);

    // Both should succeed
    expect(results[0].error).toBeNull();
    expect(results[1].error).toBeNull();

    // Verify only one record exists
    const { count } = await supabaseAdmin
      .from('payment_transactions')
      .select('*', { count: 'exact' })
      .eq('stripe_payment_intent_id', testPaymentIntentId);

    expect(count).toBe(1);

    console.log('✅ Concurrent webhook UPSERT handling working');
  });
});

test.describe('Cart Item UPSERT', () => {

  test('should upsert cart item and increment quantity', async () => {
    const testCartId = 'test-cart-' + Date.now();
    const testProductId = generateTestId();
    const testVariantId = generateTestId();

    // Create cart
    await supabaseAdmin.from('carts').insert({
      id: testCartId,
      session_id: 'test-session',
    });

    // First add (INSERT)
    const { data: first, error: firstError } = await supabaseAdmin.rpc(
      'upsert_cart_item',
      {
        p_cart_id: testCartId,
        p_product_id: testProductId,
        p_variant_id: testVariantId,
        p_quantity: 2,
        p_custom_image_url: null,
        p_selling_price: 50,
      }
    );

    expect(firstError).toBeNull();
    expect(first).toBeTruthy();
    expect(first.quantity).toBe(2);

    // Second add (UPDATE - increment quantity)
    const { data: second, error: secondError } = await supabaseAdmin.rpc(
      'upsert_cart_item',
      {
        p_cart_id: testCartId,
        p_product_id: testProductId,
        p_variant_id: testVariantId,
        p_quantity: 3,
        p_custom_image_url: null,
        p_selling_price: 50,
      }
    );

    expect(secondError).toBeNull();
    expect(second).toBeTruthy();
    expect(second.quantity).toBe(5); // 2 + 3
    expect(second.id).toBe(first.id); // Same record

    // Verify only one cart item exists
    const { count } = await supabaseAdmin
      .from('cart_items')
      .select('*', { count: 'exact' })
      .eq('cart_id', testCartId);

    expect(count).toBe(1);

    console.log('✅ Cart item UPSERT with quantity increment working');
  });

  test('should handle concurrent cart item additions', async () => {
    const testCartId = 'test-cart-concurrent-' + Date.now();
    const testProductId = generateTestId();
    const testVariantId = generateTestId();

    // Create cart
    await supabaseAdmin.from('carts').insert({
      id: testCartId,
      session_id: 'test-session',
    });

    // Simulate rapid clicking "Add to Cart"
    const results = await Promise.all([
      supabaseAdmin.rpc('upsert_cart_item', {
        p_cart_id: testCartId,
        p_product_id: testProductId,
        p_variant_id: testVariantId,
        p_quantity: 1,
        p_custom_image_url: null,
        p_selling_price: 50,
      }),
      supabaseAdmin.rpc('upsert_cart_item', {
        p_cart_id: testCartId,
        p_product_id: testProductId,
        p_variant_id: testVariantId,
        p_quantity: 1,
        p_custom_image_url: null,
        p_selling_price: 50,
      }),
      supabaseAdmin.rpc('upsert_cart_item', {
        p_cart_id: testCartId,
        p_product_id: testProductId,
        p_variant_id: testVariantId,
        p_quantity: 1,
        p_custom_image_url: null,
        p_selling_price: 50,
      }),
    ]);

    // All should succeed
    results.forEach((result) => {
      expect(result.error).toBeNull();
    });

    // Verify only one cart item with quantity = 3
    const { data: items, count } = await supabaseAdmin
      .from('cart_items')
      .select('*', { count: 'exact' })
      .eq('cart_id', testCartId);

    expect(count).toBe(1);
    expect(items?.[0].quantity).toBe(3);

    console.log('✅ Concurrent cart item additions working');
  });
});

test.describe('Atomic Webhook Event Recording', () => {

  test('should record webhook event atomically', async () => {
    const testEventId = 'evt_test_' + Date.now();

    // First recording
    const { data: first, error: firstError } = await supabaseAdmin.rpc(
      'record_webhook_event_atomic',
      {
        p_provider: 'stripe',
        p_event_id: testEventId,
        p_event_type: 'payment_intent.succeeded',
        p_payload: { test: true },
      }
    );

    expect(firstError).toBeNull();
    expect(first).toBeTruthy();
    expect(first.event_id).toBe(testEventId);

    const firstCreatedAt = new Date(first.created_at);

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to record same event again
    const { data: second, error: secondError } = await supabaseAdmin.rpc(
      'record_webhook_event_atomic',
      {
        p_provider: 'stripe',
        p_event_id: testEventId,
        p_event_type: 'payment_intent.succeeded',
        p_payload: { test: true, attempt: 2 },
      }
    );

    expect(secondError).toBeNull();
    expect(second).toBeTruthy();
    expect(second.event_id).toBe(testEventId);
    expect(second.id).toBe(first.id); // Same record

    // created_at should be the same (not updated)
    const secondCreatedAt = new Date(second.created_at);
    expect(secondCreatedAt.getTime()).toBe(firstCreatedAt.getTime());

    // Verify only one event exists
    const { count } = await supabaseAdmin
      .from('webhook_events')
      .select('*', { count: 'exact' })
      .eq('event_id', testEventId);

    expect(count).toBe(1);

    console.log('✅ Atomic webhook event recording working');
  });
});

test.describe('Atomic Order Cancellation', () => {

  test('should atomically cancel order and create refund', async () => {
    const testUserId = generateTestId();
    const testOrderId = generateTestId();

    // Create order with successful payment
    await supabaseAdmin.from('orders').insert({
      id: testOrderId,
      user_id: testUserId,
      order_number: 'ORD-CANCEL-001',
      subtotal: 100,
      total: 100,
      payment_status: 'paid',
      status: 'confirmed',
    });

    // Create successful payment
    await supabaseAdmin.from('payment_transactions').insert({
      user_id: testUserId,
      order_id: testOrderId,
      payment_provider: 'stripe',
      stripe_payment_intent_id: 'pi_test_cancel_' + Date.now(),
      amount: 100,
      currency: 'usd',
      status: 'succeeded',
    });

    // Cancel order with refund
    const { data: result, error } = await supabaseAdmin.rpc(
      'cancel_order_with_refund_atomic',
      {
        p_order_id: testOrderId,
        p_refund_amount: 100,
        p_refund_provider: 'stripe',
        p_refund_external_id: 're_test_123',
        p_cancellation_reason: 'customer_request',
      }
    );

    expect(error).toBeNull();
    expect(result).toBeTruthy();
    expect(result.success).toBe(true);
    expect(result.status).toBe('cancelled');
    expect(result.payment_status).toBe('refunded');

    // Verify order cancelled
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', testOrderId)
      .single();

    expect(order?.status).toBe('cancelled');
    expect(order?.payment_status).toBe('refunded');

    // Verify refund record created
    const { data: refund } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('order_id', testOrderId)
      .eq('payment_method_type', 'refund')
      .single();

    expect(refund).toBeTruthy();
    expect(refund?.amount).toBe(-100); // Negative for refund
    expect(refund?.status).toBe('refund_pending');

    console.log('✅ Atomic order cancellation with refund working');
  });

  test('should rollback if order cannot be cancelled', async () => {
    const testUserId = generateTestId();
    const testOrderId = generateTestId();

    // Create order that's already cancelled
    await supabaseAdmin.from('orders').insert({
      id: testOrderId,
      user_id: testUserId,
      order_number: 'ORD-ALREADY-CANCELLED',
      subtotal: 100,
      total: 100,
      payment_status: 'refunded',
      status: 'cancelled',
    });

    // Try to cancel again
    const { data: result, error } = await supabaseAdmin.rpc(
      'cancel_order_with_refund_atomic',
      {
        p_order_id: testOrderId,
        p_refund_amount: 100,
        p_refund_provider: 'stripe',
        p_refund_external_id: 're_test_456',
      }
    );

    // Should fail
    expect(error).toBeTruthy();
    expect(error?.message).toContain('already cancelled');
    expect(result).toBeNull();

    // Verify no refund record created
    const { count } = await supabaseAdmin
      .from('payment_transactions')
      .select('*', { count: 'exact' })
      .eq('order_id', testOrderId)
      .eq('payment_method_type', 'refund');

    expect(count).toBe(0);

    console.log('✅ Atomic rollback on invalid cancellation working');
  });
});

console.log('\n🎉 All data integrity E2E tests completed!\n');
