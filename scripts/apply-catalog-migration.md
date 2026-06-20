# Apply Catalog Migration to Test Database

## 🚨 CRITICAL: Test Database Only!

**TEST DATABASE:**
- URL: https://tgccxydchvujhrqyzqao.supabase.co
- Project ID: tgccxydchvujhrqyzqao

**DO NOT APPLY TO PRODUCTION** (`https://timbqoxngnhoetbofdiq.supabase.co`)

---

## Steps to Apply Migration

### 1. Open Test Database SQL Editor

Navigate to: https://supabase.com/dashboard/project/tgccxydchvujhrqyzqao/sql/new

### 2. Copy Migration SQL

Open the migration file:
```
supabase/migrations/20260620_create_catalog_schema.sql
```

### 3. Execute Migration

1. Paste the entire migration SQL into the Supabase SQL Editor
2. Click "Run" to execute
3. Verify all tables were created successfully

### 4. Verify Migration

Run this query to verify all tables exist:

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

Expected output: 6 tables

### 5. Verify RPC Functions

Run this query to verify RPC functions exist:

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

Expected output: 3 functions

---

## Next Steps

After migration is applied successfully:
1. Proceed to create catalog sync service
2. Populate test data
3. Test queries
