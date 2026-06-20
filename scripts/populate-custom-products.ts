/**
 * Script to populate the custom products database with test data
 *
 * This script creates sample custom products in the database for testing purposes.
 * Run with: npx tsx scripts/populate-custom-products.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleProducts = [
  {
    printify_product_id: 'sample-001',
    name: 'Custom T-Shirt Design #1',
    slug: 'custom-tshirt-001',
    description: 'A beautiful custom designed t-shirt',
    base_price: 2499, // $24.99 in cents
    blueprint_id: 3, // T-shirt blueprint
    print_provider_id: 99, // Example provider
    print_areas: { front: 'image-id-001' },
    is_active: true,
    is_featured: false,
    currency: 'USD',
  },
  {
    printify_product_id: 'sample-002',
    name: 'Custom Hoodie Design #2',
    slug: 'custom-hoodie-002',
    description: 'Premium custom hoodie with unique design',
    base_price: 4999, // $49.99 in cents
    blueprint_id: 77, // Hoodie blueprint
    print_provider_id: 99,
    print_areas: { front: 'image-id-002' },
    is_active: true,
    is_featured: true,
    currency: 'USD',
  },
  {
    printify_product_id: 'sample-003',
    name: 'Custom Mug Design #3',
    slug: 'custom-mug-003',
    description: 'Ceramic mug with personalized artwork',
    base_price: 1299, // $12.99 in cents
    blueprint_id: 340, // Mug blueprint
    print_provider_id: 99,
    print_areas: { default: 'image-id-003' },
    is_active: true,
    is_featured: false,
    currency: 'USD',
  },
];

async function populateProducts() {
  console.log('🚀 Starting custom products population...\n');

  for (const product of sampleProducts) {
    try {
      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id, name')
        .eq('printify_product_id', product.printify_product_id)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Product "${product.name}" already exists (ID: ${existing.id})`);
        continue;
      }

      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to insert "${product.name}":`, error.message);
        continue;
      }

      console.log(`✅ Created product "${product.name}" (ID: ${data.id})`);
    } catch (err) {
      console.error(`❌ Error processing "${product.name}":`, err);
    }
  }

  console.log('\n✨ Custom products population complete!');
}

async function checkDatabase() {
  console.log('\n📊 Checking products table...');

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error querying products:', error.message);
    return;
  }

  console.log(`\n📦 Total products in database: ${count}`);

  if (data && data.length > 0) {
    console.log('\n📋 Recent products:');
    data.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.printify_product_id})`);
    });
  } else {
    console.log('\n⚠️  No products found in database');
  }
}

// Run the script
(async () => {
  try {
    await populateProducts();
    await checkDatabase();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})();
