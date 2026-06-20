#!/usr/bin/env node
/**
 * Script to refresh the provider catalog
 *
 * Usage: node scripts/refresh-catalog.mjs
 */

async function refreshCatalog() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
    process.exit(1);
  }

  const functionUrl = `${supabaseUrl}/functions/v1/fetch-provider-catalog`;

  console.log('🔄 Starting catalog refresh...');
  console.log('📍 Calling:', functionUrl);
  console.log('');

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Catalog refresh failed');
    }

    console.log('✅ Catalog refresh completed successfully!\n');
    console.log('📊 Summary:');
    if (data.summary) {
      console.log('   - Blueprints processed:', data.summary.blueprints_processed);
      console.log('   - Providers found:', data.summary.providers_found);
      console.log('   - Entries cached:', data.summary.entries_cached);
      console.log('   - Cache duration:', data.summary.cache_duration_hours, 'hours');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Catalog refresh failed:');
    console.error('   Error:', error.message);
    process.exit(1);
  }
}

refreshCatalog();
