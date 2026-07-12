import { createClient } from '@supabase/supabase-js';

// Using anon key (same as frontend)
const supabaseUrl = 'https://tgccxydchvujhrqyzqao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnY2N4eWRjaHZ1amhycXl6cWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTQ0ODMsImV4cCI6MjA5Njg3MDQ4M30.52GltDCy4oO6DH9Rw4MmqM_e_Z5tfmnyC9bgRGjbQMY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFrontendQueries() {
  console.log('=== VERIFYING FRONTEND QUERIES ===\n');

  // 1. Homepage query (getCachedProductsWithPricing pattern)
  console.log('1. Homepage Products Query:');
  const { data: products, error: productsError } = await supabase
    .from('catalog_products')
    .select('*')
    .eq('is_active', true)
    .order('display_title');

  if (productsError) {
    console.log('   ERROR:', productsError.message);
  } else {
    console.log('   Found ' + products.length + ' active products');
    products.slice(0, 6).forEach((p: any) => {
      const price = p.selling_price_cents || (p.min_price_cents + p.shipping_cents);
      console.log('   - [' + p.blueprint_id + '] ' + p.display_title + ' - €' + (price/100).toFixed(2));
    });
  }

  // 2. Stamp page query (useCatalogProducts pattern)
  console.log('\n2. Stamp Page Products Query (same as above):');
  const { data: stampProducts, error: stampError } = await supabase
    .from('catalog_products')
    .select('*')
    .eq('is_active', true)
    .order('display_title');

  if (stampError) {
    console.log('   ERROR:', stampError.message);
  } else {
    console.log('   Found ' + stampProducts.length + ' products for stamp page');
  }

  // 3. Variants query (for product selection)
  if (products && products.length > 0) {
    const testBlueprint = products[0].blueprint_id;
    console.log('\n3. Variants Query (blueprint ' + testBlueprint + '):');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('blueprint_id', testBlueprint)
      .eq('is_available', true);

    if (variantsError) {
      console.log('   ERROR:', variantsError.message);
    } else {
      console.log('   Found ' + variants.length + ' variants');
      const colors = [...new Set(variants.map((v: any) => v.color).filter(Boolean))];
      const sizes = [...new Set(variants.map((v: any) => v.size).filter(Boolean))];
      console.log('   Colors: ' + colors.slice(0, 5).join(', ') + (colors.length > 5 ? '...' : ''));
      console.log('   Sizes: ' + sizes.join(', '));
    }
  }

  // 4. Verify price calculation works
  console.log('\n4. Price Calculation Verification:');
  if (products) {
    const withSelling = products.filter((p: any) => p.selling_price_cents);
    const withoutSelling = products.filter((p: any) => !p.selling_price_cents);
    console.log('   Products with selling_price override: ' + withSelling.length);
    console.log('   Products using min_price + shipping: ' + withoutSelling.length);

    if (withSelling.length > 0) {
      const p = withSelling[0];
      console.log('   Example override: ' + p.display_title + ' = €' + (p.selling_price_cents/100).toFixed(2));
    }
    if (withoutSelling.length > 0) {
      const p = withoutSelling[0];
      const total = p.min_price_cents + p.shipping_cents;
      console.log('   Example calculated: ' + p.display_title + ' = €' + (total/100).toFixed(2) + ' (' + p.min_price_cents + ' + ' + p.shipping_cents + ')');
    }
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verifyFrontendQueries().catch(console.error);
