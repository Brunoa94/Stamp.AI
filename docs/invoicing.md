# Invoicing

Provider-agnostic invoice generation for paid orders. Works identically for
Stripe, PayPal and Mollie because invoices hang off the `orders` record, not
any payment provider.

## How it works

1. **Issuance** — the `create_invoice_for_order` Postgres RPC (service role
   only) issues an invoice for a paid order: it assigns a **gapless
   sequential number** (`INV-2026-00001`, per-year series via the
   `invoice_counters` table) and snapshots the order's amounts, addresses and
   line items into the `invoices` table. Invoices are immutable; corrections
   are modeled as credit notes (`type = 'credit_note'`, `CN-…` series).
2. **PDF** — `_shared/invoicePdf.ts` renders an A4 PDF with pdf-lib and
   stores it in the **private `invoices` storage bucket** under
   `{user_id}/{invoice_number}.pdf`.
3. **Email** — if `RESEND_API_KEY` is configured, the invoice is emailed to
   the customer (HTML body from `_shared/invoiceTemplate.ts`, PDF attached).
   Sent at most once (`emailed_at`). Skipped silently when not configured.
4. **Triggers** — invoice generation runs best-effort (never fails the
   payment flow) from every place an order is marked paid:
   `stripe-webhook`, `paypal-webhook`, `mollie-webhook`,
   `capture-paypal-order`, `verify-mollie-payment`.
5. **On demand** — the `generate-invoice` edge function lets the order's
   owner generate/fetch the invoice and returns a signed download URL. The
   whole pipeline is idempotent, so webhook and on-demand generation can
   race safely.

## Frontend

- `InvoiceService` (`src/services/invoiceService.ts`) — fetch invoice, call
  `generate-invoice`, create signed download URLs.
- `useOrderInvoice` / `useGenerateInvoice` (`src/queries/invoiceQueries.ts`).
- **Download Invoice** button in the order details modal
  (`OrdersDetailsModalInvoice.tsx`), shown for paid orders.

## Setup (not yet applied)

1. Apply the migration (creates tables, RPC, bucket, RLS policies):

   ```bash
   npm run supabase:migrate   # applies supabase/migrations/20260709000000_add_invoices.sql
   npm run supabase:types     # regenerate database types (then invoice types can switch to Database[...])
   ```

2. Deploy the edge functions:

   ```bash
   supabase functions deploy generate-invoice stripe-webhook paypal-webhook mollie-webhook capture-paypal-order verify-mollie-payment --no-verify-jwt
   ```

3. Configure edge function secrets (all optional — sensible defaults exist,
   email is disabled without `RESEND_API_KEY`):

   | Secret | Purpose |
   | --- | --- |
   | `INVOICE_SELLER_NAME` | Company name on the invoice (default `Stamp.AI`) |
   | `INVOICE_SELLER_ADDRESS` | Newline-separated address lines |
   | `INVOICE_SELLER_EMAIL` | Billing contact shown on the invoice |
   | `INVOICE_SELLER_VAT_ID` | VAT/tax registration number |
   | `RESEND_API_KEY` | Enables emailing invoices via Resend |
   | `INVOICE_FROM_EMAIL` | Sender, e.g. `Stamp.AI <invoices@stamp.ai>` |

## Known caveats

- `OrderServiceMapper.calculateOrderTotals` still hardcodes tax and shipping
  to 0, so invoices show `Tax: 0.00` (the template prints a "No tax has been
  charged" note). Real VAT/shipping calculation should land before invoices
  are used for accounting in tax-registered jurisdictions.
- `order_items.unit_price`/`total_price` have a dollars-vs-cents history
  (migration `20260627130000` re-typed them as cents, while the app writes
  dollars). Invoices snapshot the values as stored; reconcile the units
  before relying on line-item amounts.
