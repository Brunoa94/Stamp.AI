# Database Migrations

This folder contains SQL migration files that define your database schema.

## Migration Files

### Current Migrations

1. **`20260101015400_create_payment_transactions.sql`**
   - Creates `payment_transactions` table
   - Adds indexes for performance
   - Sets up RLS policies

2. **`20260115000000_create_core_tables.sql`**
   - Creates all core application tables
   - Defines relationships and foreign keys
   - Sets up indexes for performance
   - Configures Row Level Security (RLS)
   - Adds triggers for automatic timestamp updates

## Tables Included

### User Management
- `profiles` - User profile information
- `user_credits` - User credit balances
- `credit_transactions` - Credit transaction history

### Content
- `user_uploads` - Original uploaded images
- `ai_generations` - AI-generated images
- `user_designs` - Finalized user designs

### Products
- `product_categories` - Product category catalog
- `products` - Product templates/catalog
- `product_images` - Product mockup images

### Shopping
- `carts` - Shopping carts
- `cart_items` - Items in shopping carts
- `orders` - Customer orders
- `order_items` - Line items in orders
- `payment_transactions` - Payment records

## Making Schema Changes

### Option 1: Create a New Migration File

For new changes, create a new migration file:

```bash
# Create new migration file with timestamp
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_migration_name.sql
```

Example:
```sql
-- Add a new column to orders table
ALTER TABLE orders ADD COLUMN external_order_id TEXT;

-- Create an index on the new column
CREATE INDEX IF NOT EXISTS idx_orders_external_order_id ON orders(external_order_id);
```

### Option 2: Modify Existing Migration (Development Only)

⚠️ **Only do this if the migration hasn't been applied to production yet!**

Edit the relevant migration file directly:
- `20260115000000_create_core_tables.sql` for core table changes
- `20260101015400_create_payment_transactions.sql` for payment table changes

### Common Schema Change Examples

#### Add a Column
```sql
ALTER TABLE orders ADD COLUMN printify_order_id TEXT;
```

#### Change Column Type
```sql
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(12,2);
```

#### Add an Index
```sql
CREATE INDEX IF NOT EXISTS idx_orders_printify_id ON orders(printify_order_id);
```

#### Modify RLS Policy
```sql
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR customer_email = auth.email());
```

## Applying Migrations

### Using Supabase CLI (Local Development)

```bash
# Apply all pending migrations
npx supabase db push

# Reset database and reapply all migrations
npx supabase db reset
```

### Using Supabase Dashboard (Production)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of your migration file
4. Execute the SQL
5. Verify the changes in the Table Editor

## Generating TypeScript Types

After making schema changes, update your TypeScript types:

```bash
# Generate types from your database
npx supabase gen types typescript --local > database.types.ts

# Or for remote database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > database.types.ts
```

## Best Practices

1. **Always create new migrations for production changes** - Never modify existing migrations that have been applied to production
2. **Test migrations locally first** - Use `npx supabase db reset` to test the full migration sequence
3. **Add comments** - Document why changes are being made
4. **Include rollback instructions** - Add comments showing how to undo changes
5. **Keep migrations focused** - One logical change per migration file
6. **Version control** - Commit migration files to git

## Rollback Example

If you need to undo a migration, create a new migration file that reverses the changes:

```sql
-- Rollback: Remove external_order_id column
-- This reverses migration 20260115120000_add_external_order_id.sql

ALTER TABLE orders DROP COLUMN IF EXISTS external_order_id;
DROP INDEX IF EXISTS idx_orders_external_order_id;
```

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/database
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Migration Guide: https://supabase.com/docs/guides/getting-started/local-development
