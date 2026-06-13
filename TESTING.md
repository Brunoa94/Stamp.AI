# Testing Guide - Custom Products Performance Refactoring

## ✅ Completed

1. **Migration Applied** - Blueprint metadata columns added to Sandcastle database
2. **Code Implemented** - All 5 phases completed in feature branch
3. **Branch Pushed** - `feature/custom-products-performance-refactor`

## 🧪 Manual Testing Required

### Prerequisites

Ensure you're using the Sandcastle environment:
```bash
# Verify environment variables in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tgccxydchvujhrqyzqao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sandcastle-anon-key>
```

### Test 1: Populate Catalog Data

Call the `fetch-provider-catalog` Edge Function to populate the provider_catalog table:

```bash
curl -X POST https://tgccxydchvujhrqyzqao.supabase.co/functions/v1/fetch-provider-catalog \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Result:**
- Status 200
- Response includes `success: true`
- Summary shows blueprints processed: 5
- Database `provider_catalog` table now has entries with blueprint metadata

**Verify in Database:**
```sql
SELECT
  blueprint_id,
  provider_id,
  blueprint_title,
  blueprint_brand,
  blueprint_model,
  array_length(blueprint_images, 1) as image_count,
  expires_at
FROM provider_catalog
ORDER BY blueprint_id, provider_id
LIMIT 10;
```

### Test 2: ProviderCatalogService - Netherlands (NL)

Test fetching catalog for Netherlands:

```typescript
import { ProviderCatalogService } from '@/services/providerCatalogService';

const products = await ProviderCatalogService.getCachedCatalog('NL');
console.log('NL Products:', products);
```

**Expected Result:**
- Returns 4 products (top 4 cheapest for NL)
- Each product has:
  - `id`, `name`, `description`, `price`
  - `blueprint_id`, `print_provider_id`
  - `brand`, `model`, `images`, `features`
- Prices include shipping costs for Netherlands

### Test 3: ProviderCatalogService - United States (US)

Test fetching catalog for United States:

```typescript
const productsUS = await ProviderCatalogService.getCachedCatalog('US');
console.log('US Products:', productsUS);
```

**Expected Result:**
- Returns 4 products (top 4 cheapest for US)
- Prices are DIFFERENT from NL (different shipping costs)
- Same blueprints but potentially different providers (cheapest for US)

### Test 4: ProviderCatalogService - United Kingdom (GB)

Test fetching catalog for United Kingdom:

```typescript
const productsGB = await ProviderCatalogService.getCachedCatalog('GB');
console.log('GB Products:', productsGB);
```

**Expected Result:**
- Returns 4 products (top 4 cheapest for GB)
- Prices reflect UK shipping costs

### Test 5: PrintifyService Fallback Logic

Test the 3-tier fallback waterfall:

**Test 5a: Normal Flow (provider_catalog exists)**
```typescript
import { PrintifyService } from '@/services/printifyService';

const products = await PrintifyService.getTshirtProducts('NL');
console.log('Should use provider_catalog:', products);
```

**Expected Console Output:**
```
✅ Using provider_catalog for country: NL
```

**Test 5b: Fallback to Legacy (simulate provider_catalog failure)**

Temporarily break provider_catalog (e.g., delete all rows):
```sql
DELETE FROM provider_catalog;
```

```typescript
const products = await PrintifyService.getTshirtProducts('NL');
console.log('Should fallback to legacy:', products);
```

**Expected Console Output:**
```
⚠️ Provider catalog fetch failed, falling back to legacy system
✅ Using legacy cached blueprints (products_provider)
```

**Test 5c: Final Fallback (both caches empty)**

```typescript
// With both tables empty
const products = await PrintifyService.getTshirtProducts('NL');
console.log('Should call Edge Function:', products);
```

**Expected Console Output:**
```
⚠️ Provider catalog fetch failed, falling back to legacy system
❌ Cache miss - fetching from edge function
```

### Test 6: React Query Integration

Test the updated hooks:

```typescript
import { useTshirtProducts } from '@/queries/productQueries';

// In a React component
const { data, isLoading, error } = useTshirtProducts('NL');

// Verify queryKey includes country
// queryKey: ["products", "tshirts", "NL"]
```

**Expected Result:**
- Hook returns products for NL
- Cache key includes country code
- Changing country code triggers new query
- staleTime is 30 minutes (not 5 minutes)

### Test 7: Multi-Country Pricing Comparison

Compare prices across countries:

```typescript
const nlProducts = await ProviderCatalogService.getCachedCatalog('NL');
const usProducts = await ProviderCatalogService.getCachedCatalog('US');
const gbProducts = await ProviderCatalogService.getCachedCatalog('GB');

console.log('NL Price for Blueprint 12:', nlProducts[0].price);
console.log('US Price for Blueprint 12:', usProducts[0].price);
console.log('GB Price for Blueprint 12:', gbProducts[0].price);
```

**Expected Result:**
- Prices are different for each country
- Reflects actual shipping costs per country
- Blueprint order may differ (cheapest provider varies by country)

### Test 8: Cache Refresh

Test manual catalog refresh:

```typescript
import { ProviderCatalogService } from '@/services/providerCatalogService';

await ProviderCatalogService.refreshCatalog();
console.log('Catalog refreshed');
```

**Expected Result:**
- Triggers `fetch-provider-catalog` Edge Function
- Updates all entries in provider_catalog table
- New `expires_at` is 36 hours from now
- Returns success summary

### Test 9: Cache Validation

Test cache validity check:

```typescript
const isValid = await ProviderCatalogService.hasCachedCatalog();
console.log('Cache is valid:', isValid);
```

**Expected Result:**
- Returns `true` if cache not expired
- Returns `false` if cache expired or missing

### Test 10: Error Handling

Test error scenarios:

**10a: Invalid Country Code**
```typescript
const products = await PrintifyService.getTshirtProducts('XX');
// Should throw error or fallback gracefully
```

**10b: No Catalog Data**
```sql
DELETE FROM provider_catalog;
```
```typescript
const products = await ProviderCatalogService.getCachedCatalog('NL');
// Should return [] (empty array) and log cache miss
```

## Performance Verification

### Metrics to Check

1. **API Call Reduction**
   - Before: ~5-10 Printify API calls per page load
   - After: 0-1 calls (only on cache miss)

2. **Response Time**
   - Cache hit: <200ms
   - Cache miss: <5s

3. **Cache Hit Rate**
   - Target: >95%
   - Monitor logs for cache source

## Rollback Plan

If issues are found:

1. **Immediate**: Set feature flag (if implemented)
2. **Code**: Revert PR merge
3. **Data**: No rollback needed (backwards compatible)

## Success Criteria

- [ ] All 10 tests pass
- [ ] Multi-country pricing works correctly
- [ ] Fallback logic functions as expected
- [ ] No errors in console
- [ ] Cache hit rate >90%
- [ ] Response times meet targets
- [ ] No breaking changes to existing features

## Notes

- Testing performed against **Sandcastle database only** (tgccxydchvujhrqyzqao)
- Production database untouched
- Migration is backwards compatible
- Rollback available at any time
