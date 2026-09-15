# Invoicing

Provider-agnostic invoice generation for paid orders. Works identically for
Stripe and PayPal because invoices hang off the `orders` record, not any
payment provider.

## How it works

1. **Issuance** — the `create_invoice_for_order` Postgres RPC (service role
   only) issues an invoice for a paid order: it assigns a **gapless
   sequential number** (`INV-2026-00001`, per-year series via the
   `invoice_counters` table) and snapshots the order's amounts, addresses and
   line items into the `invoices` table. Invoices are immutable; corrections
   are modeled as credit notes (`type = 'credit_note'`, `CN-…` series).
2. **PDF** — `_shared/invoicePdf.ts` renders an A4 PDF with pdf-lib and
   stores it in the **private `invoices` storage bucket** under
   `{user_id}/{invoice_number}.pdf`. The Stamp.ai wordmark
   (`public/assets/logo-stamp.png`) is inlined as base64 in
   `_shared/invoiceAssets.ts`, and Inter (latin subset) is embedded from
   `_shared/invoiceFonts.ts` — non-embedded standard fonts render the euro
   sign with a broken advance width in macOS Preview/Quick Look.
3. **Email** — if Brevo is configured, the invoice is emailed to the customer
   (HTML body from `_shared/invoiceTemplate.ts`, PDF attached).
   The email header logo is loaded from `{SITE_URL}/assets/logo-stamp.png`,
   so the `SITE_URL` secret (already used by the payment functions) must
   point at the deployed site for the image to resolve.
   Sent at most once (`emailed_at`). Skipped silently when not configured.
4. **Triggers** — invoice generation runs best-effort (never fails the
   payment flow) from every place an order is marked paid:
   `finalize-order` (the only path that mints a paid order), `stripe-webhook`,
   `paypal-webhook`, `mollie-webhook`, `capture-paypal-order` and
   `process-payment-recovery`.
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
   supabase functions deploy generate-invoice stripe-webhook paypal-webhook capture-paypal-order --no-verify-jwt
   ```

3. Configure edge function secrets (all optional — sensible defaults exist,
   email is disabled without an email provider API key):

   **Invoice Details:**
   | Secret | Purpose |
   | --- | --- |
   | `INVOICE_SELLER_NAME` | Company name on the invoice (default `Stamp.AI`) |
   | `INVOICE_SELLER_ADDRESS` | Newline-separated address lines |
   | `INVOICE_SELLER_EMAIL` | Billing contact shown on the invoice |
   | `INVOICE_SELLER_VAT_ID` | VAT/tax registration number |
   | `INVOICE_FROM_EMAIL` | Sender email (used by both providers) |

   **Email Provider - Brevo:**
   | Secret | Purpose |
   | --- | --- |
   | `BREVO_API_KEY` | Brevo API key (get from https://app.brevo.com/settings/keys/api) |
   | `BREVO_FROM_EMAIL` | Sender email (falls back to `INVOICE_FROM_EMAIL`) |
   | `BREVO_FROM_NAME` | Sender name (falls back to `INVOICE_SELLER_NAME`) |

   **Configuring Supabase secrets:**
   ```bash
   # Brevo (preferred)
   supabase secrets set BREVO_API_KEY=xsmtpsib-your-api-key
   supabase secrets set BREVO_FROM_EMAIL=invoices@yourdomain.com
   supabase secrets set BREVO_FROM_NAME="Your Company"

   # Invoice details
   supabase secrets set INVOICE_SELLER_NAME="Your Company"
   supabase secrets set INVOICE_SELLER_ADDRESS="Your Address"
   supabase secrets set INVOICE_SELLER_EMAIL=billing@yourdomain.com
   supabase secrets set INVOICE_SELLER_VAT_ID=PT123456789
   ```

## Amounts and units

Orders are minted server-side by the `finalize-order` edge function
(`_shared/finalizePaidOrder.ts`): every line item is repriced from
`product_variants.price_cents`, the promo discount comes from the `promocodes`
table and shipping/VAT from `_shared/orderTotals.ts`, and the total must equal
the amount the provider actually charged. The browser never writes order
amounts.

- All `orders.*` money columns and `order_items.unit_price`/`total_price` hold
  **integer cents**, as the `order_items` column types (`INTEGER`, migration
  `20260627130000`) dictate. `payment_transactions.amount` is the provider
  amount in major units (`DECIMAL(10,2)`).
- VAT is **tax-inclusive**: `orders.tax_amount` (and the invoice `tax_amount`)
  is the VAT portion contained in the total, never added on top. The rate
  defaults to 21 % and is configured with `ORDER_VAT_RATE_BPS` (basis points),
  shipping with `ORDER_SHIPPING_COST_CENTS` / `ORDER_FREE_SHIPPING_THRESHOLD_CENTS`,
  and the store currency with `ORDER_CURRENCY` (default `EUR`). The same
  variables are read by the Next.js API routes (`process.env`).

## Known caveats

- Orders created before `finalize-order` shipped were written by the browser;
  their `order_items` amounts follow whatever the client sent at the time
  (the app has written cents since `20260627130000`, earlier rows may be
  dollars or NULL). Invoices snapshot the values as stored, so reconcile
  historical rows before relying on their line-item amounts.
- The invoice template prints a "No tax has been charged" note whenever
  `tax_amount` is 0, which is only correct with `ORDER_VAT_RATE_BPS=0`.
