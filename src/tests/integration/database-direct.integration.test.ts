/**
 * Direct Database Integration Test
 * Tests database operations directly without service layer
 */

import { getAuthenticatedClient } from './setup-auth';

describe('Direct Database Operations', () => {
  let supabase: any;
  let testUserId: string;
  let testCartId: string;
  let testOrderId: string | null = null;

  beforeAll(async () => {
    // Get authenticated client with JWT token
    const auth = await getAuthenticatedClient();
    supabase = auth.supabase;
    testUserId = auth.userId;

    // Get or create cart
    const { data: existingCart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', testUserId)
      .maybeSingle();

    if (existingCart) {
      testCartId = existingCart.id;
      await supabase.from('cart_items').delete().eq('cart_id', testCartId);
    } else {
      const { data: cart } = await supabase
        .from('carts')
        .insert({ user_id: testUserId })
        .select()
        .single();
      testCartId = cart!.id;
    }

    // Add cart items with all new columns
    await supabase.from('cart_items').insert([
      {
        cart_id: testCartId,
        product_id: 'test-product-1',
        product_name: 'Test T-Shirt',
        variant_id: '123',
        variant_name: 'M / Black',
        quantity: 2,
        unit_price: 2500,
        printify_blueprint_id: 456,
        printify_print_provider_id: 789,
      },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    if (testOrderId) {
      await supabase.from('order_items').delete().eq('order_id', testOrderId);
      await supabase.from('orders').delete().eq('id', testOrderId);
    }
    if (testCartId) {
      await supabase.from('cart_items').delete().eq('cart_id', testCartId);
    }
  });

  test('should create order with all required columns', async () => {
    // Create order directly
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: testUserId,
        order_number: `TEST-${Date.now()}`,
        customer_email: 'bruno.afonso94@hotmail.com',
        customer_name: 'Bruno Afonso',
        customer_phone: '+1 555-0123',
        billing_address: {
          first_name: 'Bruno',
          last_name: 'Afonso',
          address1: '456 Billing Ave',
          city: 'Billing City',
          state: 'CA',
          zip: '90001',
          country: 'US',
        },
        shipping_address: {
          first_name: 'Bruno',
          last_name: 'Afonso',
          address1: '123 Shipping St',
          city: 'Shipping City',
          state: 'NY',
          zip: '10001',
          country: 'US',
        },
        status: 'confirmed',
        payment_status: 'paid',
        subtotal: 2500,
        shipping_cost: 0,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 2500,
        currency: 'USD',
        payment_provider: 'stripe',
      })
      .select()
      .single();

    expect(orderError).toBeNull();
    expect(order).toBeDefined();

    testOrderId = order!.id;

    // Verify all columns exist
    expect(order!.billing_address).toBeDefined();
    expect(order!.billing_address.first_name).toBe('Bruno');
    expect(order!.billing_address.city).toBe('Billing City');

    expect(order!.shipping_address).toBeDefined();
    expect(order!.shipping_address.city).toBe('Shipping City');

    expect(order!.customer_name).toBe('Bruno Afonso');
    expect(order!.customer_phone).toBe('+1 555-0123');
    expect(order!.subtotal).toBe(2500);
    expect(order!.payment_provider).toBe('stripe');

    console.log('✅ Order created with all required columns');
  });

  test('should create order item with all required columns', async () => {
    // Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', testCartId);

    expect(cartItems).toHaveLength(1);
    const cartItem = cartItems![0];

    // Verify cart item has new columns
    expect(cartItem.variant_name).toBe('M / Black');
    expect(cartItem.printify_blueprint_id).toBe(456);
    expect(cartItem.printify_print_provider_id).toBe(789);

    console.log('✅ Cart item has all required columns');

    // Create order item
    if (!testOrderId) {
      throw new Error('No test order created');
    }

    const { data: orderItem, error: orderItemError } = await supabase
      .from('order_items')
      .insert({
        order_id: testOrderId,
        product_id: cartItem.product_id,
        product_name: cartItem.product_name,
        variant_id: cartItem.variant_id,
        variant_name: cartItem.variant_name,
        quantity: cartItem.quantity,
        unit_price: cartItem.unit_price,
        total_price: cartItem.unit_price * cartItem.quantity,
      })
      .select()
      .single();

    expect(orderItemError).toBeNull();
    expect(orderItem).toBeDefined();

    // Verify order item columns
    expect(orderItem!.variant_id).toBe('123');
    expect(orderItem!.variant_name).toBe('M / Black');
    expect(orderItem!.unit_price).toBe(2500);
    expect(orderItem!.total_price).toBe(5000);

    console.log('✅ Order item created with all required columns');
  });

  test('should query cart with status column', async () => {
    const { data: cart, error } = await supabase
      .from('carts')
      .select('id, user_id, status, created_at')
      .eq('id', testCartId)
      .single();

    expect(error).toBeNull();
    expect(cart).toBeDefined();
    expect(cart!.status).toBe('active'); // Default value

    console.log('✅ Cart has status column with default value');
  });
});
