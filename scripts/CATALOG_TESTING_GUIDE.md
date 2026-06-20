# Catalog System Testing Guide

## 🚨 CRITICAL: Test Database Only!

**TEST DATABASE:**
- URL: https://tgccxydchvujhrqyzqao.supabase.co
- Project ID: tgccxydchvujhrqyzqao

**PRODUCTION DATABASE (DO NOT TOUCH):**
- URL: https://timbqoxngnhoetbofdiq.supabase.co

---

## Phase 1: Verify Database Schema

### Step 1: Check Tables Exist

Run in Supabase SQL Editor (TEST database):

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'catalog_products',
    'print_providers',
    'product_provider_availability',
    'product_variants',
    'variant_pricing',
    'user_custom_designs'
  )
ORDER BY table_name;
```

**Expected:** 6 tables

### Step 2: Verify RPC Functions

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_providers_for_product',
    'get_variant_price',
    'get_cheapest_provider'
  )
ORDER BY routine_name;
```

**Expected:** 3 functions

---

## Phase 2: Deploy Edge Function

### Option A: Deploy to Supabase

```bash
# Make sure you're targeting the TEST project
supabase link --project-ref tgccxydchvujhrqyzqao

# Deploy the Edge Function
supabase functions deploy sync-catalog
```

### Option B: Run Locally (Recommended for testing)

```bash
# Start Supabase locally
supabase start

# Serve the function locally
supabase functions serve sync-catalog
```

---

## Phase 3: Test Catalog Sync

### Method 1: Using the Test Script

```bash
cd scripts
./test-catalog-sync.sh
```

### Method 2: Manual curl Command

```bash
curl -X POST \
  "https://tgccxydchvujhrqyzqao.supabase.co/functions/v1/sync-catalog" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnY2N4eWRjaHZ1amhycXl6cWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTQ0ODMsImV4cCI6MjA5Njg3MDQ4M30.52GltDCy4oO6DH9Rw4MmqM_e_Z5tfmnyC9bgRGjbQMY" \
  -H "Content-Type: application/json" \
  -d '{
    "countries": ["US", "GB", "FR", "DE"],
    "blueprintIds": [12],
    "forceUpdate": true
  }'
```

### Expected Response

```json
{
  "success": true,
  "productsCreated": 1,
  "variantsCreated": 24,
  "pricingRecordsCreated": 96,
  "errors": []
}
```

---

## Phase 4: Verify Sync Results

### Check Products

```sql
SELECT
  id,
  blueprint_id,
  name,
  is_active,
  created_at
FROM catalog_products;
```

**Expected:** 1 product (Bella+Canvas 3001)

### Check Variants

```sql
SELECT
  pv.id,
  pv.printify_variant_id,
  pv.color,
  pv.size,
  pv.title,
  cp.name as product_name
FROM product_variants pv
JOIN catalog_products cp ON cp.id = pv.product_id
ORDER BY pv.color, pv.size
LIMIT 10;
```

**Expected:** Multiple variants with different colors/sizes

### Check Provider Availability

```sql
SELECT
  ppa.country_code,
  pp.name as provider_name,
  ppa.base_price_cents,
  ppa.currency_code,
  ppa.shipping_cost_cents,
  cp.name as product_name
FROM product_provider_availability ppa
JOIN print_providers pp ON pp.id = ppa.print_provider_id
JOIN catalog_products cp ON cp.id = ppa.product_id
ORDER BY ppa.country_code, ppa.base_price_cents;
```

**Expected:** Provider availability for US, GB, FR, DE

### Check Variant Pricing

```sql
SELECT
  vp.country_code,
  pp.name as provider_name,
  pv.color,
  pv.size,
  vp.price_cents,
  vp.currency_code
FROM variant_pricing vp
JOIN print_providers pp ON pp.id = vp.print_provider_id
JOIN product_variants pv ON pv.id = vp.variant_id
ORDER BY vp.country_code, pv.color, pv.size
LIMIT 20;
```

**Expected:** Pricing records for each variant × provider × country

---

## Phase 5: Test RPC Functions

### Test 1: Get Providers for Product

```sql
-- Get the product ID first
SELECT id FROM catalog_products WHERE blueprint_id = 12;

-- Use that ID in the RPC call
SELECT * FROM get_providers_for_product(
  '<product_id_from_above>',
  'US'
);
```

**Expected:** List of providers available in US with prices

### Test 2: Get Variant Price

```sql
-- Get product ID and find a variant
SELECT
  p.id as product_id,
  v.color,
  v.size
FROM catalog_products p
JOIN product_variants v ON v.product_id = p.id
WHERE p.blueprint_id = 12
LIMIT 1;

-- Use those values
SELECT * FROM get_variant_price(
  '<product_id>',
  '<color>',
  '<size>',
  <provider_id>,
  'US'
);
```

**Expected:** Price details for that specific variant

### Test 3: Get Cheapest Provider

```sql
SELECT * FROM get_cheapest_provider(
  '<product_id>',
  'Black',
  'M',
  'US'
);
```

**Expected:** Cheapest provider for Black/M tee in US

---

## Phase 6: Test Query Service

Create a test file: `src/test-catalog-queries.ts`

```typescript
import { CatalogQueryService } from "@/services/catalogQueryService";

async function testQueries() {
  console.log("Testing Catalog Query Service...");

  // Test 1: Get all products
  const products = await CatalogQueryService.getProducts();
  console.log(`✅ Found ${products.length} products`);

  if (products.length > 0) {
    const product = products[0];
    console.log(`\nProduct: ${product.name} (Blueprint ${product.blueprint_id})`);

    // Test 2: Get providers for US
    const providers = await CatalogQueryService.getProvidersForProduct(
      product.id,
      "US"
    );
    console.log(`✅ Found ${providers.length} providers for US`);
    console.log("Providers:", providers);

    // Test 3: Get available colors
    const colors = await CatalogQueryService.getProductColors(product.id);
    console.log(`✅ Found ${colors.length} colors:`, colors);

    // Test 4: Get sizes for first color
    if (colors.length > 0) {
      const sizes = await CatalogQueryService.getProductSizes(
        product.id,
        colors[0]
      );
      console.log(`✅ Found ${sizes.length} sizes for ${colors[0]}:`, sizes);

      // Test 5: Get variant price
      if (sizes.length > 0 && providers.length > 0) {
        const price = await CatalogQueryService.getVariantPrice(
          product.id,
          colors[0],
          sizes[0],
          providers[0].id,
          "US"
        );
        console.log("✅ Variant price:", price);
      }
    }

    // Test 6: Get cheapest provider
    if (colors.length > 0 && sizes[0]) {
      const cheapest = await CatalogQueryService.getCheapestProvider(
        product.id,
        colors[0],
        sizes[0],
        "US"
      );
      console.log("✅ Cheapest provider:", cheapest);
    }
  }

  console.log("\n✅ All tests completed!");
}

testQueries().catch(console.error);
```

Run with:

```bash
npx tsx src/test-catalog-queries.ts
```

---

## Phase 7: Test React Hooks

Create a test component: `src/components/TestCatalogHooks.tsx`

```typescript
import { useCatalogProducts, useProductProviders, useVariantPrice } from "@/queries/catalogQueries";

export function TestCatalogHooks() {
  const { data: products, isLoading } = useCatalogProducts();
  const product = products?.[0];

  const { data: providers } = useProductProviders(product?.id, "US");

  const { data: price } = useVariantPrice(
    product?.id,
    "Black",
    "M",
    providers?.[0]?.id,
    "US"
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1>Catalog Test</h1>

      <h2>Products: {products?.length}</h2>
      {product && (
        <div>
          <h3>{product.name}</h3>
          <p>Blueprint: {product.blueprint_id}</p>
        </div>
      )}

      <h2>Providers (US): {providers?.length}</h2>
      <ul>
        {providers?.map(p => (
          <li key={p.id}>
            {p.name}: ${(p.basePriceCents / 100).toFixed(2)} {p.currencyCode}
          </li>
        ))}
      </ul>

      <h2>Price (Black/M)</h2>
      {price && (
        <div>
          ${(price.priceCents / 100).toFixed(2)} {price.currencyCode}
        </div>
      )}
    </div>
  );
}
```

---

## Expected Results Summary

After successful sync and testing:

✅ **Database:**
- 1 catalog product
- ~24 variants (colors × sizes)
- Multiple providers in print_providers
- Provider availability for 4 countries (US, GB, FR, DE)
- Variant pricing for each variant × provider × country

✅ **Queries:**
- Immediate price lookups (no Printify API calls)
- Provider list by country
- Color/size filtering
- Cheapest provider calculations

✅ **Performance:**
- All queries < 50ms
- No external API calls during browsing
- Data cached in React Query

---

## Troubleshooting

### Issue: Edge Function times out

**Solution:** Reduce blueprintIds to sync one at a time:

```json
{
  "countries": ["US"],
  "blueprintIds": [12]
}
```

### Issue: No providers found

**Check:** Printify API might not have providers for that blueprint

```bash
curl -H "Authorization: Bearer $PRINTIFY_TOKEN" \
  https://api.printify.com/v1/catalog/blueprints/12/print_providers.json
```

### Issue: Variant pricing empty

**Check:** Shipping profiles in Printify API:

```bash
curl -H "Authorization: Bearer $PRINTIFY_TOKEN" \
  https://api.printify.com/v1/catalog/blueprints/12/print_providers/<provider_id>/shipping.json
```

---

## Next Steps

After successful testing:

1. ✅ Sync more blueprints (add more IDs to sync request)
2. ✅ Set up cron job for weekly sync
3. ✅ Integrate catalog hooks into stamp flow UI
4. ✅ Replace current product creation with catalog selection
5. ✅ Implement lazy Printify product creation at checkout

---

## Monitoring

### Check sync status

```sql
SELECT
  cp.name,
  cp.blueprint_id,
  COUNT(DISTINCT pv.id) as variant_count,
  COUNT(DISTINCT ppa.id) as provider_availability_count,
  COUNT(DISTINCT vp.id) as pricing_records_count,
  MAX(ppa.last_synced_at) as last_sync
FROM catalog_products cp
LEFT JOIN product_variants pv ON pv.product_id = cp.id
LEFT JOIN product_provider_availability ppa ON ppa.product_id = cp.id
LEFT JOIN variant_pricing vp ON vp.variant_id = pv.id
GROUP BY cp.id, cp.name, cp.blueprint_id
ORDER BY last_sync DESC;
```

### Find missing pricing

```sql
-- Variants without pricing
SELECT
  cp.name,
  pv.color,
  pv.size,
  COUNT(vp.id) as pricing_count
FROM catalog_products cp
JOIN product_variants pv ON pv.product_id = cp.id
LEFT JOIN variant_pricing vp ON vp.variant_id = pv.id
GROUP BY cp.id, cp.name, pv.id, pv.color, pv.size
HAVING COUNT(vp.id) = 0;
```
