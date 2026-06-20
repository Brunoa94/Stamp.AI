/**
 * Script to reload the database with custom products
 *
 * This script:
 * 1. Clears existing products (optional with --clear flag)
 * 2. Displays current database state
 *
 * Run with:
 *   npx tsx scripts/reload-products.ts          # Check current products
 *   npx tsx scripts/reload-products.ts --clear  # Clear all products
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

// Valid blueprint IDs from provider_catalog
const VALID_BLUEPRINTS = [
  { id: 6, name: 'Unisex Heavy Cotton Tee (Gildan 5000)', category: 'tshirt' },
  { id: 12, name: 'Unisex Jersey Short Sleeve Tee (Bella+Canvas 3001)', category: 'tshirt' },
  { id: 145, name: 'Unisex Softstyle T-Shirt', category: 'hoodie' },
  { id: 157, name: 'Kids Heavy Cotton™ Tee', category: 'totebag' },
  { id: 553, name: 'Cotton Tote Bag', category: 'mug' },
];

async function clearProducts() {
  console.log('🗑️  Clearing existing products...\n');

  const { error, count } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id', { count: 'exact' });

  if (error) {
    console.error('❌ Failed to clear products:', error.message);
    return false;
  }

  console.log(`✅ Cleared ${count || 0} products from database\n`);
  return true;
}

async function checkDatabase() {
  console.log('📊 Checking products table...\n');

  const { data, error, count } = await supabase
    .from('products')
    .select('id, name, printify_product_id, blueprint_id, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error querying products:', error.message);
    return;
  }

  console.log(`📦 Total products in database: ${count || 0}\n`);

  if (data && data.length > 0) {
    console.log('📋 Products in database:\n');
    data.forEach((product, index) => {
      const date = new Date(product.created_at).toLocaleString();
      console.log(`  ${index + 1}. ${product.name}`);
      console.log(`     Printify ID: ${product.printify_product_id || 'N/A'}`);
      console.log(`     Blueprint: ${product.blueprint_id || 'N/A'}`);
      console.log(`     Created: ${date}\n`);
    });
  } else {
    console.log('⚠️  No products found in database\n');
  }
}

async function main() {
  const shouldClear = process.argv.includes('--clear');

  console.log('🚀 Product Database Management\n');
  console.log('='.repeat(50) + '\n');

  if (shouldClear) {
    const cleared = await clearProducts();
    if (!cleared) {
      console.error('❌ Failed to clear products. Exiting.');
      process.exit(1);
    }
  }

  await checkDatabase();

  console.log('='.repeat(50));
  console.log('\n📝 How to create products:\n');
  console.log('1. Use the stamp feature in the app (/stamp)');
  console.log('2. Upload an image and generate a design');
  console.log('3. Select a product type');
  console.log('4. Customize and add to cart');
  console.log('5. Product will be created in Printify and saved to database\n');

  console.log('✅ Valid Blueprint IDs (updated with correct ones):\n');
  VALID_BLUEPRINTS.forEach(bp => {
    console.log(`   • Blueprint ${bp.id}: ${bp.name}`);
  });

  console.log('\n💡 Note: Products are created on-demand through the stamp flow.');
  console.log('   This ensures they exist in both Printify and the database.\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
