# Apply RLS Policies to TEST Database

## Instructions

1. Open the Supabase SQL Editor: https://supabase.com/dashboard/project/tgccxydchvujhrqyzqao/sql/new

2. Copy the contents of `supabase/migrations/20260620_add_catalog_rls_policies.sql`

3. Execute the SQL

4. Verify policies are active:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN (
  'catalog_products',
  'print_providers',
  'product_provider_availability',
  'product_variants',
  'variant_pricing',
  'user_custom_designs'
);
```

You should see policies allowing anonymous SELECT on catalog tables.
