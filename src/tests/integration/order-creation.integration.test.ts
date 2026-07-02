/**
 * Integration test for order creation
 * Tests the actual database flow with real Supabase connection
 */

import { getAuthenticatedClient } from './setup-auth';
import { OrderService } from '@/services/orderService';
import type { UserI } from '@/types/auth';
import type { ShippingAddressT } from '@/schemas/checkout';

describe('Order Creation Integration Tests', () => {
  let supabase: any;
  let testUserId: string;
  let testCartId: string;
  let createdOrderId: string | null = null;

  // Use actual test user from .env
  const testUser: UserI = {
    id: '', // Will be set in beforeAll
    email: 'bruno.afonso94@hotmail.com',
    user_metadata: {
      full_name: 'Bruno Afonso',
    },
  };

  // Mock addresses
  const shippingAddress: ShippingAddressT = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+1 555-0123',
    address1: '123 Shipping St',
    address2: 'Apt 4',
    city: 'Shipping City',
    state: 'NY',
    zip: '10001',
    country: 'US',
  };

  const billingAddress: ShippingAddressT = {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    phone: '+1 555-0456',
    address1: '456 Billing Ave',
    city: 'Billing City',
    state: 'CA',
    zip: '90001',
    country: 'US',
  };

  beforeAll(async () => {
    // Get authenticated client with JWT token
    const auth = await getAuthenticatedClient();
    supabase = auth.supabase;
    testUserId = auth.userId;
    testUser.id = testUserId;

    // Get or create test cart (user can only have one cart due to unique constraint)
    const { data: existingCart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', testUserId)
      .maybeSingle();

    if (existingCart) {
      testCartId = existingCart.id;
      // Clear existing cart items
      await supabase.from('cart_items').delete().eq('cart_id', testCartId);
    } else {
      // Create new cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .insert({
          user_id: testUserId,
        })
        .select()
        .single();

      if (cartError) throw cartError;
      testCartId = cart.id;
    }

    // Add cart items
    await supabase.from('cart_items').insert([
      {
        cart_id: testCartId,
        product_id: 'test-product-1',
        product_name: 'Test T-Shirt',
        variant_id: '123',
        variant_name: 'M / Black',
        quantity: 2,
        unit_price: 2500, // $25.00 in cents
        printify_blueprint_id: 456,
        printify_print_provider_id: 789,
      },
      {
        cart_id: testCartId,
        product_id: 'test-product-2',
        product_name: 'Test Mug',
        variant_id: '124',
        variant_name: 'White',
        quantity: 1,
        unit_price: 1500, // $15.00 in cents
        printify_blueprint_id: 457,
        printify_print_provider_id: 789,
      },
    ]);
  });

  afterAll(async () => {
    // Cleanup: Delete test order
    if (createdOrderId) {
      await supabase.from('order_items').delete().eq('order_id', createdOrderId);
      await supabase.from('orders').delete().eq('id', createdOrderId);
    }

    // Delete test cart
    if (testCartId) {
      await supabase.from('cart_items').delete().eq('cart_id', testCartId);
      await supabase.from('carts').delete().eq('id', testCartId);
    }
  });

  test('should create order with separate billing and shipping addresses', async () => {
    // Get cart with items directly from database
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items (*)
      `)
      .eq('id', testCartId)
      .single();

    if (cartError) {
      console.error('Failed to get cart:', cartError);
      throw cartError;
    }

    expect(cart).toBeDefined();
    expect(cart.cart_items).toHaveLength(2);

    // Create order
    createdOrderId = await OrderService.createOrderFromCart({
      user: testUser,
      cart,
      paymentStatus: 'paid',
      shippingAddress,
      billingAddress,
      idempotencyKey: `integration-test-${Date.now()}`,
      orderStatus: 'confirmed',
    });

    expect(createdOrderId).toBeDefined();
    expect(createdOrderId).not.toBeNull();

    // Verify order in database
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', createdOrderId!)
      .single();

    expect(error).toBeNull();
    expect(order).toBeDefined();

    // Verify billing address is stored correctly
    expect(order.billing_address).toBeDefined();
    expect(order.billing_address.first_name).toBe('Jane');
    expect(order.billing_address.last_name).toBe('Doe');
    expect(order.billing_address.address1).toBe('456 Billing Ave');
    expect(order.billing_address.city).toBe('Billing City');
    expect(order.billing_address.state).toBe('CA');

    // Verify shipping address is stored correctly
    expect(order.shipping_address).toBeDefined();
    expect(order.shipping_address.first_name).toBe('John');
    expect(order.shipping_address.last_name).toBe('Doe');
    expect(order.shipping_address.address1).toBe('123 Shipping St');
    expect(order.shipping_address.city).toBe('Shipping City');
    expect(order.shipping_address.state).toBe('NY');

    // Verify customer info
    expect(order.customer_name).toBe('John Doe');
    expect(order.customer_email).toBe('john@example.com');
    expect(order.customer_phone).toBe('+1 555-0123');

    // Verify pricing breakdown
    expect(order.subtotal).toBeDefined();
    expect(order.shipping_cost).toBeDefined();
    expect(order.tax_amount).toBeDefined();
    expect(order.total_amount).toBeDefined();

    // Verify payment status
    expect(order.payment_status).toBe('paid');
    expect(order.status).toBe('confirmed');
  });

  test('should use shipping address as billing when no billing address provided', async () => {
    // Get cart directly from database
    const { data: cart } = await supabase
      .from('carts')
      .select(`*, cart_items (*)`)
      .eq('id', testCartId)
      .single();

    // Create order without billing address
    const orderId = await OrderService.createOrderFromCart({
      user: testUser,
      cart,
      paymentStatus: 'paid',
      shippingAddress,
      // No billingAddress provided
      idempotencyKey: `integration-test-no-billing-${Date.now()}`,
      orderStatus: 'confirmed',
    });

    expect(orderId).toBeDefined();

    // Verify order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId!)
      .single();

    // Billing address should match shipping address
    expect(order.billing_address).toBeDefined();
    expect(order.billing_address.first_name).toBe(shippingAddress.first_name);
    expect(order.billing_address.address1).toBe(shippingAddress.address1);
    expect(order.billing_address.city).toBe(shippingAddress.city);
    expect(order.billing_address.state).toBe(shippingAddress.state);

    // Cleanup
    await supabase.from('order_items').delete().eq('order_id', orderId!);
    await supabase.from('orders').delete().eq('id', orderId!);
  });

  test('should verify all required columns exist and are populated', async () => {
    // Get cart directly from database
    const { data: cart } = await supabase
      .from('carts')
      .select(`*, cart_items (*)`)
      .eq('id', testCartId)
      .single();

    const orderId = await OrderService.createOrderFromCart({
      user: testUser,
      cart,
      paymentStatus: 'paid',
      shippingAddress,
      billingAddress,
      idempotencyKey: `integration-test-columns-${Date.now()}`,
      orderStatus: 'confirmed',
    });

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId!)
      .single();

    // Verify all new columns exist and are accessible
    const requiredColumns = [
      'billing_address',
      'shipping_address',
      'customer_name',
      'customer_phone',
      'subtotal',
      'shipping_cost',
      'tax_amount',
      'discount_amount',
    ];

    requiredColumns.forEach((column) => {
      expect(order).toHaveProperty(column);
      expect(order[column]).toBeDefined();
    });

    // Cleanup
    await supabase.from('order_items').delete().eq('order_id', orderId!);
    await supabase.from('orders').delete().eq('id', orderId!);
  });
});
