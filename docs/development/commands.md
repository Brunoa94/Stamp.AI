# Development Commands

This document contains all available development commands for the Imaginary Builder AI project.

## **Frontend Commands**
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on frontend code
- `npm run lint:fix` - Run ESLint with auto-fix on frontend code

## **Supabase Commands**
- `npm run supabase:setup` - Link and setup Supabase project
- `npm run supabase:types` - Generate TypeScript types from database schema
- `npm run supabase:lint` - Run Deno lint on Supabase functions
- `npm run supabase:format` - Format Supabase functions with Deno fmt
- `npm run supabase:check` - Type check Supabase functions

## **Database Type Generation**

The `supabase:types` command generates TypeScript types from your Supabase database schema:

```bash
npm run supabase:types
```

This will:
- Connect to your linked Supabase project
- Generate TypeScript types for all database tables
- Save the types to `src/types/database.types.ts`

**When to run:**
- After creating or modifying database tables
- After changing column types or constraints
- When collaborating and pulling database schema changes

**Usage Example:**

```typescript
// src/types/cart.ts
import { Database } from "./database.types";

// Generate types from database schema
export type CartT = Database['public']['Tables']['carts']['Row'];
export type CreateCartT = Database['public']['Tables']['carts']['Insert'];
export type UpdateCartT = Database['public']['Tables']['carts']['Update'];

// Extend with custom types
export interface CartWithItems extends CartT {
  cart_items: CartItem[];
}
```

**Type Helpers:**
- `Row` - Full row type with all columns (for queries)
- `Insert` - Type for inserting new rows (optional fields allowed)
- `Update` - Type for updating rows (all fields optional)

## Environment Configuration

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Supabase Edge Functions

Located in `supabase/functions/`:

- `connect-supabase/` - Supabase connection handling
- `stripe-webhook/` - Stripe webhook processing
- `create-printify-order/` - Printify order creation

Each function has its own `deno.json` configuration file.