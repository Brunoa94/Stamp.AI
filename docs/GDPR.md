# GDPR: data export, account deletion, consent

Backend implementation of the rights promised in the FAQ and Privacy Policy.
The profile buttons and the cookie banner are **not built yet** — see
[Pending UI work](#pending-ui-work).

## Data export (Art. 15 / 20)

| Piece | Location |
|---|---|
| RPC | `public.export_own_data()` — `supabase/migrations/20260915000020_account_data_export.sql` |
| Route | `POST /api/account/export` — `src/app/api/account/export/route.ts` |
| Rate limit | 5 / hour per user, 20 / hour per IP (`src/lib/security/accountActionProtection.ts`) |

`export_own_data()` is `SECURITY DEFINER`, takes **no parameters** and is
always scoped to `auth.uid()`; execution is revoked from `anon`. It returns one
JSON document (`schema_version: 1`) with: `account` (auth.users basics and
metadata), `profile`, `addresses` (distinct shipping/billing addresses from
orders), `orders` (+ `items`, `status_history`, `refunds`), `payments`
(`payment_transactions`), `payment_recovery`, `invoices` (metadata only, PDF
paths excluded — PDFs are downloadable from the orders page), `carts`
(+ items), `credits` (balance + `credit_transactions`), `custom_products`
(`products` rows owned by the user), `uploads` and `ai_generations`.

The route runs the RPC on the **user's own session** (cookie client), so RLS
and `auth.uid()` apply, and responds with
`Content-Disposition: attachment; filename="stamp-ai-data-export-YYYY-MM-DD.json"`.

## Account deletion (Art. 17)

| Piece | Location |
|---|---|
| RPC | `public.delete_own_account(p_reason text default null)` — `supabase/migrations/20260915000021_account_deletion.sql` |
| Audit | `public.account_deletions` (sha256 of the user id, timestamp, reason, counts) |
| Route | `POST /api/account/delete` — `src/app/api/account/delete/route.ts` |
| Confirmation rules | `src/lib/account/deletionConfirmation.ts` |
| Storage cleanup | `src/lib/account/invoiceStorageCleanup.ts` |
| Rate limit | 3 / hour per user, 10 / hour per IP; `/api/account/*` also uses the strict `auth` bucket in `src/middleware.ts` |

### Request contract

```json
{ "confirmation": "DELETE MY ACCOUNT", "password": "…", "reason": "optional, ≤500 chars" }
```

* `confirmation` must equal `ACCOUNT_DELETION_CONFIRMATION_PHRASE`
  (`src/schemas/account.ts`) — always required.
* `password` is required when the account has an email/password identity
  (`app_metadata.providers` contains `"email"`); it is verified with
  `signInWithPassword`. Social-only accounts delete with the phrase alone.

Responses: `401 UNAUTHORIZED`, `400 INVALID_REQUEST_BODY |
CONFIRMATION_PHRASE_MISMATCH | PASSWORD_REQUIRED`, `403 INVALID_PASSWORD`,
`429`, `409 OPEN_ORDERS` (see below), `500 ACCOUNT_DELETE_FAILED`,
`200 { success: true, retained: { orders, invoices, payments } }`.

### Sequence

1. Route authenticates the user, validates body, rate limits, checks the
   confirmation/password.
2. `delete_own_account()` runs on the **user's session**:
   * **Refuses** with `{ ok:false, reason:"OPEN_ORDERS", open_orders, pending_payment_recoveries, unresolved_refunds }`
     while anything is in flight (route → `409`).
   * Otherwise anonymises the tax-retained rows, deletes everything else,
     writes the audit row and returns
     `{ ok:true, invoice_pdfs:[{bucket,path}], …counts }`.
3. Route, with the **service role**: removes the invoice PDFs
   (`invoices` bucket, reported paths + a sweep of the `{user_id}/` folder),
   clears `pdf_path/pdf_bucket` on the retained invoice rows, then
   `auth.admin.deleteUser(user.id)`, then signs the session out.

Why the auth row is deleted from the route and not from SQL: this codebase
only *reads* `auth.users` from SQL and performs all auth mutations through
GoTrue (`auth.admin.updateUserById`, `generateLink`). `auth.admin.deleteUser`
also cleans identities, sessions and refresh tokens; a raw `DELETE FROM
auth.users` would not.

### "Non-final" orders that block deletion

An order blocks deletion when

```
status IN ('waiting_confirmation','confirmed','processing','shipped')
OR (payment_status = 'paid' AND status NOT IN ('delivered','cancelled'))
```

i.e. fulfilment is running, or the customer has paid and has neither received
the goods nor been refunded (`pending`/`unsuccessful_confirmation` with
`payment_status = 'paid'` are awaiting refund). Deletion is also blocked by
`payment_recovery.recovery_status = 'pending'` (money captured, order not yet
created) and by unresolved `refund_failures` on the user's orders (money owed).
Users must wait for delivery/refund or contact support first.

### Retention & anonymisation rules

Dutch bookkeeping duty (Algemene wet inzake rijksbelastingen art. 52: 7 years)
requires the sales administration to be kept. We therefore **retain** but
**anonymise** the following rows instead of deleting them:

| Table | Kept | Scrubbed |
|---|---|---|
| `orders` | order_number, dates, amounts, currency, status, payment_status/method/provider, promo, printify ids, idempotency_key | `user_id → NULL`, `customer_email → deleted-user@anonymised.invalid`, customer_name, customer_phone, shipping_address, billing_address, tracking_number, tracking_url → NULL |
| `order_items` | product_name, variant, quantity, prices | `custom_image_url → 'removed:account-deleted'`, `design_config → NULL` |
| `invoices` | invoice_number, order_number, issued_at, amounts, line_items, payment snapshot | `user_id → NULL`, `customer_email → tombstone`, customer_name, billing_address, shipping_address → NULL; PDF object removed from storage and `pdf_path/pdf_bucket → NULL` |
| `payment_transactions` | amounts, currency, status, provider ids (Stripe/PayPal/Mollie), captured_at | `user_id → NULL`, paypal_payer_email, paypal_payer_id, stripe_customer_id, payment_method_details, metadata → NULL |
| `payment_recovery` | amount, currency, provider, payment_intent_id, recovery status | `user_id → NULL`, `user_email → tombstone`, session_id, shipping_address, cart_snapshot, line_items, metadata → NULL |
| `refunds` | everything financial | `metadata → NULL` |
| `order_status_history`, `order_status_reconciliation`, `refund_failures` | untouched (no personal data, linked by order id) | — |

**Deleted outright** (no retention duty): `carts` + `cart_items`,
`credit_transactions`, `user_credits`, `products` owned by the user (custom
designs; `order_items.product_id`/`cart_items.product_id` are `ON DELETE SET
NULL`), `ai_generations`, `user_uploads`, `profiles`, and finally
`auth.users`.

Foreign keys were changed so that deleting `auth.users` can never destroy
retained data: `payment_transactions.user_id` and `payment_recovery.user_id`
were `ON DELETE CASCADE` and are now `ON DELETE SET NULL` (orders, invoices,
products already were).

The FAQ answer ("within 30 days … order and transaction records are kept for
seven years") stays truthful: deletion is immediate, which is within 30 days.

### Needs legal input

* Whether the customer **name/address may be scrubbed from issued invoices**
  and the **PDF deleted**. Dutch VAT rules (Wet OB art. 35a) list name and
  address as invoice contents; tax retention vs. GDPR erasure is a
  documented tension. If legal decides the original invoice must survive
  verbatim, keep the PDF (skip `removeUserInvoicePdfs`) and keep
  `customer_name`/`billing_address` on `invoices` only — the migration is a
  single `UPDATE` to adjust.
* Retention period for the `account_deletions` audit rows (currently
  indefinite; contains only a hash).
* Data held by third parties is **not** touched: Printify (custom products
  and orders — `products.printify_product_id`, `orders.printify_order_id`),
  Stripe/PayPal/Mollie customer records, Brevo contacts, the AI image
  provider. Processor deletion requests are a follow-up.

## Consent Mode v2 (analytics)

`src/features/analytics/lib/consent.ts` holds the typed consent state
(`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`), the
cookie (`stamp_consent`, 180 days, `v1.key:value,…`), `parse/serialize`,
`buildConsentCookieString`, and the `gtag('consent','default'|'update')`
builders.

`GoogleAnalytics.tsx` now:

1. always queues `consent default` with **everything denied** *before*
   `config` (via a local queue function — `window.gtag` is not exposed so
   `AnalyticsService` cannot send events yet);
2. loads `gtag.js` and defines `window.gtag` **only** when the cookie grants
   `analytics_storage`;
3. re-reads the cookie when `window` receives `CONSENT_UPDATED_EVENT`
   (`stamp:consent-updated`), pushes `consent update`, and loads gtag.js
   without a reload. Events tracked before consent stay in
   `AnalyticsService`'s in-memory queue (max 50) and flush on load.

## Pending UI work

Profile (`/profile`):

* "Download my data" → `POST /api/account/export`, save the response as a
  file (it is already an attachment).
* "Delete my account" → modal that asks for the phrase `DELETE MY ACCOUNT`,
  the password when `user.app_metadata.providers` includes `"email"`, and an
  optional reason; `POST /api/account/delete`; on `409` list
  `openOrders`/`pendingPaymentRecoveries`/`unresolvedRefunds` and link to the
  orders page / support; on `200` redirect to `/` (the session is already
  signed out).
* i18n keys for the new error codes.

Cookie banner:

* Show when `readConsentFromCookieHeader(document.cookie)` is `null`.
* Offer at least *Accept all* / *Reject all* / granular toggles for the four
  signals; write the choice with `document.cookie =
  buildConsentCookieString(state)`; then
  `window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT))`.
* Provide a "Cookie settings" re-entry point (footer / cookie policy page)
  that reopens the banner with the stored state.
* Cookie policy text must list `stamp_consent` (functional) and the GA
  cookies (analytics, only after consent).
