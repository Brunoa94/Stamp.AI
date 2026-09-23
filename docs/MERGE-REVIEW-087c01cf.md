# Merge review: 087c01cf

Compared merge `087c01cf8964c6bb76fb5c1259d380c3ab14ba6e` with its first parent,
pre-merge main `74e69d2d3f226eb263669d52a16ffd62fe27027a`, and checked the reported
placement and invoice code against current main `69aa498c` as well.

## Findings

**Confirmed deployment mismatch:** a read-only download from Supabase project
`timbqoxngnhoetbofdiq` shows older deployed placement and invoice code. The newer
main code survived the merge but is not what these deployed functions run.
See the deployment comparison below. This confirms the invoice mismatch and
a pillow placement regression; it does not yet explain the reported scaling
problem on every product.

The merge has the same tree as its dev parent `2924a6b9`. Pre-merge main is
already an ancestor of that parent through `a772f2a7`. This establishes that
the final merge did not introduce its own conflict-resolution edits; it does
not, by itself, prove that earlier merges preserved every behavior.

The comparison contains 354 changed/moved files. It includes 51 exact-content
renames and many import-path/formatting changes from the move into `src/shared`.
Replacing all affected files with pre-merge main would undo newer auth,
server-side pricing, coin charging, and partial-checkout/recovery changes.

## Image positioning

These files are byte-for-byte unchanged between pre-merge main and current main:

- `src/lib/printPlacement/config.ts`
- `src/lib/printPlacement/geometricCheck.ts`
- `src/features/stamp/lib/config/printAreaConfig.ts`
- `src/features/stamp/lib/hooks/useDesignAdjustment.ts`
- The tracked files under `src/features/stamp/ui/components/PlacementPreview/`
  and `src/features/stamp/ui/components/PlacementAdjuster/`
- `supabase/functions/_shared/printPlacement.ts`

The September 7 pillow fix (`6869a6ff`) and subsequent placement updates in
`6f8acc7` remain. The product-creation Edge Function's diff adds auth/CORS;
its placement calculations are retained, including the forced pillow scale
of 0.35 and the tote centering calculation. The client service still passes
selected placements and uploaded image dimensions, with the same fallback
print-area selection. Its substantive change is authenticated requests.

The existing print-area service tests had not been updated for the new session
requirement: five failed before reaching their placement assertions. This review
adds a mocked authenticated session to that suite. The focused configuration,
geometry, placement state, preview, adjuster, and payload suites then pass:
**7 files, 115 tests**. This validates local unit behavior, not live Printify output.

## Invoice appearance

The following files are byte-for-byte unchanged from pre-merge main to current main:

- `supabase/functions/_shared/invoiceTemplate.ts`
- `supabase/functions/_shared/invoicePdf.ts`
- `supabase/functions/_shared/invoiceAssets.ts`
- `supabase/functions/_shared/invoiceFonts.ts`
- `supabase/functions/_shared/invoice.ts`

The August 30 logo update (`8a42dfbc`) remains. `generate-invoice/index.ts`
changes CORS handling, not rendering. The client invoice service changes imports
and formatting. A real delivery change in `e6764b8` removes the Resend fallback
and keeps Brevo; this is separate from the template's appearance.

Existing stored PDFs are reused: `ensureInvoiceForOrder` renders and uploads a
PDF only if `pdf_path` is absent. Consequently an old stored invoice can retain
an old design even with current source. The deployed template mismatch was
subsequently confirmed below. No individual stored invoice was inspected.

## Deployed source comparison (September 23)

Downloaded deployed source into an isolated temporary directory, without changing
the repository's function files or deploying anything. Exact byte comparisons
against historical Git versions establish:

| Deployed source | Exact historical match | Newer main changes absent from deployment |
| --- | --- | --- |
| `create-custom-product/index.ts`, version 119 | `d6f67147`, August 13 | September 7 pillow front-panel placement/scale correction; subsequent auth/CORS changes |
| Its bundled `_shared/printPlacement.ts` | `254cf5b4`, August 13 | Pillow `scaleOnly` handling and safe-zone update |
| `_shared/invoiceTemplate.ts` in all five invoice-generating functions | `28553906`, July 9 | Brand redesign, updated logo, cents-to-currency conversion, deduplicated billing name |
| `_shared/invoicePdf.ts` in the same five functions | `28553906`, July 9 | Redesigned PDF, embedded Inter/font and logo changes |

The five invoice-generating functions checked are `generate-invoice`,
`stripe-webhook`, `paypal-webhook`, `capture-paypal-order`, and
`verify-mollie-payment`. Each bundles its own old copies of both renderers;
updating only `generate-invoice` would leave the other paths producing old output.

The Supabase function listing reports September 13, 2026, 09:19:48 UTC as the
update time for these deployments, before the September 18 main merge. Deployment
time therefore does not imply that the deployed source contains the latest Git work.

The production correction should publish reviewed current-main bundles for
`create-custom-product` and all five invoice-generating functions. Current-main
bundles also include newer auth/CORS/payment changes, so their runtime configuration
and dependencies need checking before deployment. Existing stored invoice PDFs and
already-created Printify products will not be rewritten by deploying code.

## Other visible differences to review

| Area | Difference from pre-merge main | Origin |
| --- | --- | --- |
| Header | Separate Sign in / Sign up entries replace Login | `3c8fac2`, August 23 |
| Anchors | Bold heading font replaces body font | `3c8fac2`, August 23 |
| Registration | Name fields become stacked | `3c8fac2`, August 23 |
| Password reset | Shared Input replaces native input | `3c8fac2`, August 23 |
| Mollie return | Spacing and error typography differ | August dev work, including `eadc3a1` |
| Registration flow | Email verification precedes setting a password | September email-confirmation work |
| Documentation | README deleted | `1fcc049`, August 22 |
| Documentation | MISSING_STEPS and provider-catalog manual test files deleted | `db7c9fb`, September 18 |

These changes are not all reversions: the old main lines for the header auth
links, anchor font, and registration name layout predate the August dev edits.
The August 30 Link-based header navigation also remains intact. Restoring whole
files by branch name or last-file-edit date would discard unrelated newer work.

The homepage hero files, size-display mapper, guest-product storage service,
and September 7 Heading fixes in GenerationSection/ProductionSection are
preserved in the merge.

## Remaining diagnosis

No production-code rollback is justified by this comparison. Preserve current
main and correct the stale deployment. To investigate the broader report that
all products lost fit-to-side scaling, compare a concrete request's blueprint,
artwork dimensions, selected placement, and resulting mockup. The deployed/local
placement diff specifically proves a missing pillow fix; general automatic-fit
logic is present in both versions. No deployment, invoice regeneration, external
product creation, or production data changes were performed during this review.
