# Development Commands

This document contains all available development commands for the Imaginary Builder AI project.

## **Frontend Commands**
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on frontend code
- `npm run lint:fix` - Run ESLint with auto-fix on frontend code

## **Supabase Functions Commands**
- `npm run supabase:lint` - Run Deno lint on Supabase functions
- `npm run supabase:format` - Format Supabase functions with Deno fmt
- `npm run supabase:check` - Type check Supabase functions
- `npm run supabase:setup` - Link and setup Supabase project

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