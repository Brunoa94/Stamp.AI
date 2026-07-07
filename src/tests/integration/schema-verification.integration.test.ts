/**
 * Schema Verification Integration Test
 * Verifies that all required columns exist in database tables
 * This should catch schema mismatches before they cause runtime errors
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Database Schema Verification', () => {
  async function getTableColumns(tableName: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('information_schema.columns' as any)
      .select('column_name')
      .eq('table_name', tableName);

    if (error) {
      // Fallback: try direct SQL query
      const { data: rawData } = await supabase.rpc('exec_sql', {
        sql: `SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY column_name`,
      });

      if (rawData) {
        return rawData.map((row: any) => row.column_name);
      }

      console.error(`Failed to get columns for ${tableName}:`, error);
      return [];
    }

    return data.map((row: any) => row.column_name);
  }

  test('orders table should have all required columns', async () => {
    const requiredColumns = [
      'id',
      'user_id',
      'order_number',
      'customer_email',
      'customer_name',
      'customer_phone',
      'billing_address',
      'shipping_address',
      'status',
      'payment_status',
      'subtotal',
      'shipping_cost',
      'tax_amount',
      'discount_amount',
      'total_amount',
      'currency',
      'payment_provider',
      'shipped_at',
      'delivered_at',
      'created_at',
      'updated_at',
    ];

    // Query directly via SQL
    const { data, error } = await supabase
      .from('orders' as any)
      .select('*')
      .limit(0);

    if (error) {
      console.error('Failed to query orders table:', error);
      throw error;
    }

    // Get column names from a test query
    const testQuery = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        order_number,
        customer_email,
        customer_name,
        customer_phone,
        billing_address,
        shipping_address,
        status,
        payment_status,
        subtotal,
        shipping_cost,
        tax_amount,
        discount_amount,
        total_amount,
        currency,
        payment_provider,
        shipped_at,
        delivered_at,
        created_at,
        updated_at
      `)
      .limit(1);

    expect(testQuery.error).toBeNull();

    console.log('✅ orders table has all required columns');
  });

  test('carts table schema', async () => {
    // Try to query carts with status column
    const { data, error } = await supabase
      .from('carts')
      .select('id, user_id, session_id, status, created_at, updated_at')
      .limit(1);

    if (error) {
      console.error('Failed to query carts:', error);
      throw error;
    }

    expect(error).toBeNull();
    console.log('✅ carts table has all required columns including status');
  });

  test('cart_items table should have all required columns', async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        cart_id,
        product_id,
        product_name,
        variant_id,
        variant_name,
        quantity,
        unit_price,
        printify_blueprint_id,
        printify_print_provider_id,
        created_at,
        updated_at
      `)
      .limit(1);

    expect(error).toBeNull();
    console.log('✅ cart_items table has all required columns');
  });

  test('order_items table should have all required columns', async () => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        product_name,
        variant_id,
        variant_name,
        quantity,
        unit_price,
        total_price,
        created_at
      `)
      .limit(1);

    expect(error).toBeNull();
    console.log('✅ order_items table has all required columns');
  });

  test('payment_transactions table should have all required columns', async () => {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        id,
        order_id,
        payment_provider,
        stripe_payment_intent_id,
        paypal_order_id,
        mollie_payment_id,
        amount,
        currency,
        status,
        created_at,
        updated_at
      `)
      .limit(1);

    expect(error).toBeNull();
    console.log('✅ payment_transactions table has all required columns');
    console.log('Note: Uses provider-specific columns (stripe_payment_intent_id, paypal_order_id, mollie_payment_id)');
  });
});
