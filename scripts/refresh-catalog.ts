#!/usr/bin/env ts-node
/**
 * Script to refresh the provider catalog
 *
 * Usage: npx ts-node scripts/refresh-catalog.ts
 */

import { ProviderCatalogService } from '../src/services/providerCatalogService';

async function main() {
  try {
    console.log('🔄 Starting catalog refresh...\n');

    await ProviderCatalogService.refreshCatalog();

    console.log('\n✅ Catalog refresh completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Catalog refresh failed:', error);
    process.exit(1);
  }
}

main();
