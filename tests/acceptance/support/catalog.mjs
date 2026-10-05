import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Production snapshot of catalog_products and product_variants. The test project
// must mirror it; scripts/acceptance/sync-catalog.mjs applies it.
export const CATALOG_SNAPSHOT = resolve(import.meta.dirname, '../catalog-snapshot.json');
export const loadCatalogSnapshot = (path = CATALOG_SNAPSHOT) => JSON.parse(readFileSync(path, 'utf8'));
export const activeCatalogProducts = () => loadCatalogSnapshot().catalog_products.filter(product => product.is_active);
