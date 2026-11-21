# Translated Catalog Product Text (pt, nl)

*   **Author:** bruno.afonso
*   **Status:** Proposed
*   **Date:** 2026-11-20

--------------------------------------------------------------------------------

## Overview

The site's interface is translated into English, Portuguese and Dutch with
next-intl. The visitor's language comes from the `NEXT_LOCALE` cookie, then the
browser's `Accept-Language` header, then English. URLs carry no language.

Product text is not part of that system. The Printify sync
(`supabase/functions/sync-blueprint/index.ts`) writes English product titles,
descriptions, colours and sizes into Supabase, and every page reads them from
there. A Portuguese or Dutch visitor therefore sees translated buttons and
headings around English product names and descriptions.

This design adds Portuguese and Dutch versions of that product text for the
current catalog of about 11 products. The text is machine-translated once, for
free, stored in the repository and keyed by Printify `blueprint_id`. It is
swapped in only at the moment the page renders. Everything the code stores,
compares, caches or sends to analytics stays English.

## The Problem

A visitor who chooses Português or Nederlands in the language switcher still
reads English on every product surface: the catalog listing and product dialog,
the product picker and final review in the customiser (`/stamp`), the homepage
carousel, product cards and Product of the Month, and the cart.

The product is what the visitor is buying, so this is the text that matters
most, and it is the only text the current translation system cannot reach.
next-intl translates strings written in the repository. Product text is
written by a sync job into the database, so it never passes through the
message catalogs.

Three facts make a direct fix unsafe:

1.  **Product text is used as an identifier.** The English title decides the
    product category, whether colours or paper types are offered, and print
    placement. Colour and size strings are price-query filters and swatch
    keys. The title is saved to the cart, copied into orders and sent to
    analytics. Translating these values where they are loaded would break
    behaviour and write Portuguese or Dutch into stored records.
2.  **The message catalogs can't hold it.** next-intl parses messages as ICU
    format, rejects keys containing dots, ships every message to every page,
    and only falls back to English for keys that exist in `en.json`.
3.  **Caches are shared across languages.** The server and client caches for
    catalog data have no language in their keys.

The proposed solution: keep all product data English, and translate only for
display through one shared lookup that returns the stored Portuguese or Dutch
text, or the live English database value when no translation exists.

## Goals

*   On every in-scope surface, a visitor whose locale is `pt` or `nl` sees the
    product title and description in that language for every blueprint that
    has a stored translation:
    *   catalog listing and product dialog (`/catalog`);
    *   customiser product selection and final review (`/stamp`);
    *   homepage carousel, product cards and Product of the Month;
    *   cart and checkout line titles, for both guest and signed-in carts.
*   Colour and paper-type names, and the few size words that are not
    language-neutral ("One Size", "Vertical", "Horizontal"), show translated
    on visible labels.
*   Descriptions show as translated plain text plus a translated list of
    specs, in the same layout the English description uses today.
*   When a translation is missing, for example for a newly synced blueprint,
    the visitor sees the live English value from the database. The page never
    shows a key path, an empty string or an error.
*   English visitors see exactly what they see today.
*   Category detection, colour and paper-type visibility, print placement,
    price lookups, cart and order records, and analytics events behave
    identically in all three languages.
*   No paid service, no translation API called at runtime, and no extra
    database reads per page.
*   A check script reports missing translations and English source text that
    has changed since it was translated. It reports only; it never blocks a
    deploy or rewrites a translation.

## Non-Goals

*   **SEO.** No per-language URLs, `hreflang`, canonical or sitemap changes.
    Page `<meta>` tags and JSON-LD keep reading the English fields.
*   **Order records.** `order_items.product_name` and `variant_name` keep the
    English text saved at checkout. Order history, confirmation emails and
    invoices are not translated.
*   **Changing stored values.** `cart_items.product_name`, Zustand state,
    analytics `item_name` and logs stay English.
*   **Automatic re-translation.** When Printify or an admin changes the English
    source, the stored translation stays as it is until someone updates it by
    hand.
*   **Rendering descriptions as HTML.** Translations are stored and shown as
    plain text.
*   **Admin tooling.** No UI for editing translations; they are edited in the
    repository.
*   **Other languages.** Only `pt` and `nl`. Adding a language later follows
    the same pattern but is not part of this work.
*   **Cart colour and size.** The cart never stores `variant_name` today, so
    there is no colour or size on a cart line to translate.

## Open Questions

*   **Exact blueprint list**: the acceptance snapshot (2026-10-05) has 9
    active products; the author counts 11 in production. The first run of
    the check script (step 1 of the implementation) lists the live active
    blueprints, and that list is what gets translated.

Resolved during drafting (2026-11-20): colours use a full-name list; product
lists keep the English order; the check script reads the live database.

## Critical User Journeys (CUJs)

### CUJ 1: Portuguese visitor browses the catalog

*   **Given**: The `NEXT_LOCALE` cookie is `pt`, and blueprint 6 has a stored
    Portuguese title and description.
*   **When**: The visitor opens `/catalog` and then the product dialog for
    blueprint 6.
*   **Then**: The card and dialog show the Portuguese title, description and
    specs. Prices, images and the product's category grouping are the same as
    for an English visitor. The page's JSON-LD still lists the English name.

### CUJ 2: Dutch visitor customises a mug and adds it to the cart

*   **Given**: The cookie is `nl`, and the mug blueprint has a stored Dutch
    title.
*   **When**: The visitor picks the mug in `/stamp`, designs it and adds it to
    the cart.
*   **Then**: The picker and final review show the Dutch title. No colour
    picker appears, because the mug is still detected as a mug. The print
    placement is the mug's. The cart row stores the English `product_name`,
    the analytics event sends the English `item_name`, and the cart line shows
    the Dutch title.

### CUJ 3: Signed-in visitor switches language with items in the cart

*   **Given**: A signed-in visitor has a T-shirt in their account cart and is
    viewing the site in English.
*   **When**: They switch the language to Português.
*   **Then**: After the page refreshes, the cart line title is in Portuguese,
    looked up by the `printify_blueprint_id` the cart RPC now returns. The
    stored cart row is unchanged.

### CUJ 4: A new product is synced before anyone translates it

*   **Given**: A thirteenth blueprint is synced from Printify and has no
    stored translation.
*   **When**: A Portuguese visitor opens the catalog.
*   **Then**: The new product shows its English title and description from the
    database, next to translated titles for the other products. Nothing
    errors. The next run of the check script lists the blueprint as missing a
    translation.

### CUJ 5: Printify changes an English description

*   **Given**: Blueprint 6 has a stored Dutch description, and the daily sync
    replaces its English description with new text.
*   **When**: A Dutch visitor opens the product dialog.
*   **Then**: They still see the stored Dutch description. The check script
    reports that blueprint 6's English source has changed since it was
    translated. Nobody's deploy is blocked.

## Technical Plan (Architecture)

### The rule this design is built on

Product data is English everywhere it is stored, compared, cached or sent:
Supabase rows, `unstable_cache` and React Query entries, Zustand state, cart
and order payloads, analytics events and logs. Portuguese or Dutch text exists
only in the final display value a component renders. Translation happens in
**display mappers**, the functions that turn a product row into the shape a
component shows, and it happens **after** every cache.

Because the caches stay English, no cache key changes, and one visitor's
language can never be served to another.

```text
 Printify ──sync──▶ Supabase (English)
                        │
           unstable_cache / React Query   (English, keys unchanged)
                        │
                        ▼
   ┌──────────── display mapper (feature lib/mappers) ────────────┐
   │ English fields kept as-is:  name, category, colour, size,    │
   │                             blueprintId, price               │
   │ display fields added:       displayName, displayDescription, │
   │                             displaySpecs  ◀── localizeProduct│
   └───────────────────────────────────────────────────────────────┘
                        │                          ▲
                        ▼                          │ locale
              component renders display*   getLocale() (server)
              logic reads English fields   useLocale() (client)
```

### Component 1: product text data (new)

Translations live in two TypeScript modules, one per language:

*   `src/shared/constants/productText/pt.ts`
*   `src/shared/constants/productText/nl.ts`

There is no `en.json`: English always comes from the database. Each file maps
a blueprint ID to the translated fields:

```text
{
  "<blueprint_id>": {
    "title":       string,          // optional
    "description": string,          // optional, plain text
    "specs":       string[],        // optional, plain text, same count as English
    "source": {                     // what the translation was made from
      "titleHash":       string,    // sha-256 of the English title, first 12 hex
      "descriptionHash": string     // sha-256 of the English description + specs
    }
  }
}
```

The same files hold a `labels` object for colour and paper-type names, keyed
by a normalised English value (lowercase, spaces and punctuation collapsed to
`-`, so `"Heather Grey"` becomes `heather-grey`):

```text
{ "labels": { "color": { "black": "Preto", ... },
              "paperType": { "lined": "Pautado", ... } } }
```

Each module exports a `ProductTextT` constant, so `tsc` checks the data itself:
a misspelt field or a `specs` value that is not an array fails the build. The
check script (Component 5) imports the modules through `tsx`. A small index
module (`src/shared/constants/productText/index.ts`) maps each non-English
locale to its module. The types live in `src/shared/types/productText.ts`.

These files are separate from `src/i18n/messages/*.json` on purpose. They are
read as plain data, never through `t()`, so ICU parsing, the ban on dotted
keys, the `en.json` typing and the root-provider payload don't apply.

### Component 2: the lookup functions (new)

One pure module, `src/shared/helpers/localizeProduct.ts`, is the only code
that reads the data. It exposes three functions. Each returns the translation
when one exists for the locale and the English value it was given otherwise.
For `en`, each returns its input unchanged.

*   `localizeProductText(locale, blueprintId, english)`: takes the English
    `{ title, description, specs }` the mapper already computed and returns
    the same shape. It falls back **field by field**: a product with a
    translated title but no translated description gets the Portuguese title
    and the English description.
*   `localizeProductLabel(locale, kind, englishValue)`: `kind` is `color` or
    `paperType`. It normalises the value, looks it up in `labels`, and returns
    the raw English value on a miss. Unknown Printify colours therefore show
    in English, never as a key.
*   `localizeCartItemName(locale, blueprintId, storedName)`: when
    `blueprintId` is `null` or has no translated title, returns `storedName`.

The translated description takes precedence over everything the English side
offers. The English input is whatever `resolveProductDescription` returns
today (`meta_description` first, then the Printify text), so the UI order
becomes: translated description, then `meta_description`, then the Printify
text. `<meta>` and JSON-LD don't call these functions and keep reading the
English fields.

The functions are pure and take the locale as an argument. They don't call
`getLocale()` or `useLocale()` themselves, so the same code runs on the server
and the client and needs no React context.

### Component 3: display mappers on each surface (modified)

Each surface keeps its English fields and gains display fields. Logic reads
the English fields; JSX renders the display fields.

| Surface | Runs on | Where the locale comes from | Mapper change |
| --- | --- | --- | --- |
| `/catalog` cards and dialog | server | `getLocale()` in `src/app/catalog/page.tsx`, passed to the mapper | `catalogProductMapper.ts` sets `name`, `description`, `specs` from `localizeProductText`; `category` keeps using the English `display_title` |
| Homepage cards, carousel | client (`HomepageContent.tsx` is `"use client"`) | `useLocale()` in `HomepageContent.tsx` | `productCardMapper.ts`, `carouselProducts.ts` take a `locale` argument |
| Product of the Month | client (`useProductOfMonth`) | `useLocale()` | the description lookup moves out of the `ui/` component into a homepage mapper |
| `/stamp` product picker | client | `useLocale()` | the inline mapping in `ProductSelectionSection.tsx` moves to `stamp/lib/mappers/`; it keeps `name` (English) and adds `displayName`, `displayDescription`, `displaySpecs` |
| `/stamp` selected card, final review | client | `useLocale()` | render `displayName` / `displaySpecs`; `SelectedProductCard.tsx` stops parsing specs itself |
| Colour swatches, paper types | client | `useLocale()` | visible text and `aria-label` use `localizeProductLabel`; the `value`, swatch lookup and selection state stay English |
| Cart and checkout lines | client | `useLocale()` | a cart display mapper calls `localizeCartItemName(locale, item.printify_blueprint_id, item.product_name)` |

Search on `/catalog` (`filterCatalogSections.ts`) matches the text the visitor
can see, so it searches the display name and description.

The empty `getDisplayTitle` / `BLUEPRINT_TITLE_MAP` map in the homepage slice
is deleted. It was a second, unused source of product titles, imported across
slices by the catalog.

Size words ("One Size", "Vertical", "Horizontal") and the hard-coded English
fallbacks next to product text ("See more", "See less", "Standard", "Custom
Design") are ordinary interface strings. They move into
`src/i18n/messages/{en,pt,nl}.json` and go through `t()` like the rest of the
interface. Sizes such as S/M/L or 11oz are already language-neutral.

### Component 4: account carts store the blueprint ID (database change)

Today, a cart line can be translated only if it knows its `blueprint_id`.
`cart_items.printify_blueprint_id` and `printify_print_provider_id` already
exist, and `CartService.getCart` already selects them with `*`. But the
`upsert_cart_item` RPC has no parameter for them, so every account-cart row
stores `NULL`. Guest carts keep the ID in localStorage, but the guest-to-account
merge (`guestCartMergeService.ts` through `mapLocalCartItemToAddToCartInput`)
drops it.

The change:

1.  A new migration replaces `upsert_cart_item` with a version that takes two
    extra optional parameters, `p_printify_blueprint_id` and
    `p_printify_print_provider_id` (both `INTEGER DEFAULT NULL`). Both insert
    branches write them. The quantity-merge branches set them only when the
    stored value is `NULL` (`COALESCE`), so an existing row is never changed.
    The migration drops the old 8-argument signature, then reapplies the
    hardening from `20261012000000_close_launch_authorization_gaps.sql`:
    `SECURITY INVOKER`, `search_path = public, pg_temp`, `REVOKE` from
    `PUBLIC, anon`, `GRANT` to `authenticated, service_role`.
2.  `addToCartSchema` gains optional `printify_blueprint_id` and
    `printify_print_provider_id`. `CartService.addToCart` sends them.
3.  The `/stamp` add-to-cart payload includes the blueprint and provider IDs
    it already holds. The guest-merge mapper passes them through.

Nothing else reads these columns today (the only reader is the guest-cart
mapper), so filling them changes no checkout, pricing or order behaviour. Rows
created before the migration keep `NULL` and show the stored English
`product_name`. There is no reliable way to backfill them, because
`product_id` is a per-user Printify product ID, not a blueprint ID.

### Component 5: check script (new, outside `src/`)

`scripts/i18n/check-product-translations.ts`, run with
`npx tsx scripts/i18n/check-product-translations.ts` and exposed as
`npm run i18n:check-products`. It reads the live catalog through `.env.local`,
the same way `scripts/backfill-product-seo.ts` does, and reuses
`resolveProductDescription` / `extractProductSpecs` to compute the English
source. It reports:

*   active blueprints with no `pt` or `nl` entry, or with a missing field;
*   entries for blueprints that no longer exist or are inactive;
*   `pt` and `nl` covering different blueprints or fields;
*   a translated `specs` array whose length differs from the English one;
*   **drift**: the stored `titleHash` or `descriptionHash` no longer matches
    the current English text;
*   colour and paper-type values in active variants with no label in either
    language.

It exits with code 0 in every case and prints the findings. That honours
"keep the stored translation": it tells someone a translation is stale but
never blocks a deploy or rewrites a file.

It also runs in CI, as a report-only step in `.github/workflows/ci.yml`. CI
reads the production catalog with the public `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, stored as repository secrets (the same values
the browser already receives). The step never fails the job; the findings
appear in the job log on every pull request. When the secrets are absent, for
example on a fork, the script prints that it skipped the live checks and
exits 0.

### How translations are produced

During implementation, Claude reads the live English source for each active
blueprint and writes the Portuguese and Dutch titles, descriptions, specs and
labels into the two modules, with the source hashes. The author
spot-checks the text before merging. No API key, no paid service and no
translation dependency is added. To translate a new blueprint later, someone
repeats the same step and the check script confirms coverage.

### Sorting

Lists keep the database order (`.order("display_title")`, English) in every
language, so a product sits in the same position for every visitor. Decided by
the author. The explicit "name A–Z" sort on `/catalog` sorts by the translated
name (see Implementation Notes).

### Colour labels

Every colour name used by an active variant gets a one-to-one translation in
both languages (about 45 names today, for example `Heather Navy`). A name with
no entry shows in English. Values Printify stores in the `color` field that are
not colours (pillow sizes such as `18" × 18"`, `11oz`, `S`, `M`, `Default`)
have no entry and display as they are, because they are language-neutral.
Paper types (`Blank`, `Lined`, `Dotgrid`, `Task`) go in the `paperType` list.

### What changes for English visitors

Nothing. For `en`, every lookup returns its input, the mappers produce the same
values they produce today, and the RPC change only fills in two columns no
code reads yet.

## Alternatives Considered

### Alternative A: Product text in the next-intl message catalogs

Add a `products` namespace to `src/i18n/messages/{pt,nl}.json`, keyed by
blueprint ID, and read it with `t()`.

*   **Pros**: No new mechanism. The text sits next to the rest of the
    translations, gets reviewed in pull requests, and uses next-intl's
    existing tooling.
*   **Cons**:
    *   next-intl parses every message as ICU. Product text containing `{`,
        `'` or `<tag>` throws or renders wrong unless every read uses `t.raw()`.
    *   next-intl rejects keys containing `.`, and real colour and size values
        contain dots (`1.25"`, `8.5" x 11"`).
    *   `src/app/layout.tsx` passes every message to `NextIntlClientProvider`,
        so 11 descriptions and the label list would ship to every page,
        including pages with no products, unless the namespace is removed
        with `pick`.
    *   The English fallback (`mergeMessages`) only covers keys present in
        `en.json`. English product text is in the database, so a missing key
        shows the key path. Every read would need `t.has(key) ? t.raw(key) :
        englishValue`.
*   **Reason for Rejection**: Rejected by author: every one of these problems
    needs a workaround on every read, and together the workarounds amount to
    a separate mechanism hidden inside next-intl. A plain data file gives the
    same review and versioning benefits without them.

### Alternative B: A `product_translations` table in Supabase

Store translations in the database, one row per blueprint and locale, and join
it in the catalog queries.

*   **Pros**: Translations can be fixed without a deploy. The sync never
    overwrites them. It scales to a large catalog and to human translators.
*   **Cons**: Needs a migration, RLS policies and regenerated types. Adds a
    join to every catalog read. The `unstable_cache` and React Query keys
    would have to include the locale, which multiplies cache entries by
    three. The main benefit, editing without a deploy, needs an admin UI that
    does not exist.
*   **Reason for Rejection**: Rejected by author: too much machinery for 11
    products that change rarely and are translated once. Revisit if the
    catalog grows or translations get human review.

### Alternative C: Translate at the data layer

Translate titles, descriptions, colours and sizes in the services or queries,
so every consumer receives localized rows.

*   **Pros**: Components need no changes. One place does all the work.
*   **Cons**: The English title decides product category, colour and
    paper-type visibility, and print placement, and colour and size strings
    are price-query filters and select values. Translated values would break
    all of these. The title would also be written to `cart_items`, copied
    into `order_items` and sent to analytics in the visitor's language.
    Caches would need locale keys or would serve one visitor's language to
    another.
*   **Reason for Rejection**: Rejected by author: product text is used as an
    identifier, so it can only be translated at the point of display.

### Alternative D: Translate the Printify HTML descriptions as-is

Store the full translated HTML and run the existing `stripHtml` and
`extractProductSpecs` on it, as the English path does.

*   **Pros**: One stored field per language. The spec extractor keeps working
    the same way for every language.
*   **Cons**: The UI never renders the HTML, so keeping it buys nothing.
    Machine translation often breaks the `.:` markers the spec extractor
    relies on, which silently drops the specs. The fallback sentence splitter
    does not recognise accented capitals such as É and Ó.
*   **Reason for Rejection**: Rejected by author: storing pre-extracted plain
    text and specs removes HTML parsing from translated text and the regex
    problems with it.

### Alternative E: Extend the existing `getDisplayTitle` map

Add locale support to `BLUEPRINT_TITLE_MAP` in
`src/features/homepage/lib/constants/productDisplayTitles.ts`, which the
catalog already calls.

*   **Pros**: The hook point already exists in the catalog mapper.
*   **Cons**: Titles only. It lives in the homepage slice and the catalog
    imports it across slices. It is empty today and not locale-aware.
*   **Reason for Rejection**: Rejected by author: it would become a second
    source of product titles. It is deleted and replaced by the lookup
    functions.

### Alternative F: Translate on the server only and pass strings down as props

Translate in server components and pass the translated strings to client
components, so no translation data reaches the client bundle.

*   **Pros**: Nothing extra ships to the browser.
*   **Cons**: The `/stamp` product picker and the cart fetch on the client
    through React Query, so they would still need a server-provided map of
    every product's translations, which ties server pages to client widgets
    they do not render.
*   **Reason for Rejection**: Rejected by author: the client surfaces need the
    data anyway. Importing the two modules only where the lookup is used
    keeps them out of pages without products.

### Alternative G: Runtime machine translation

Call a translation API (DeepL, Google, an LLM) when a page renders and cache
the result.

*   **Pros**: New blueprints and changed descriptions are translated
    automatically.
*   **Cons**: Costs money or hits free-tier limits, adds latency and a
    failure mode to every product page, needs an API key in production, and
    re-translates text the author asked to keep fixed.
*   **Reason for Rejection**: Rejected by author: the work must be free, and
    stored translations must not change when the English source changes.

--------------------------------------------------------------------------------

## Non-Functional Requirements

*   **Security**: translated text is rendered as plain React text, never
    through `dangerouslySetInnerHTML`, `t.rich()` or `t()`, so it cannot
    inject markup. The RPC replacement must keep `SECURITY INVOKER`, the fixed
    `search_path` and the `anon` revoke; losing any of them reopens a gap
    closed in `20261012000000_close_launch_authorization_gaps.sql`.
*   **Performance**: no extra database reads and no cache-key changes. The two
    translation modules (estimated 15–30 KB together) are imported only by the lookup
    module, so they ship in the bundles of pages that show products, not in
    the root layout's message payload.
*   **Rollout and rollback**: the display change ships as code only;
    reverting it restores English everywhere. The migration is additive (two
    optional parameters) and ships first, on its own, so the old client keeps
    working against the new function. Rolling the migration back means
    restoring the 8-argument function; rows already written keep their
    blueprint IDs, which nothing else reads.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

Work happens in `.claude/worktrees/product-text-translation` on
`feat/product-text-translation`, branched from `origin/dev`, with a pull
request against `dev`. Every change under `src/` starts with a failing unit
test (the `test-driven-development` skill; the hooks reject edits otherwise).
The unit tests added for this feature are deleted before committing (the
skill's "Before Committing" section). The steps are in the order they are
built; each leaves the app working.

### Step 1: Check script and first inventory

#### 1.1 `scripts/i18n/check-product-translations.ts` (Create)

*   **Type / Scope**: Node script run with `npx tsx`, outside `src/`.
*   **Proposed Changes**: Loads `.env.local` the way
    `scripts/backfill-product-seo.ts` does and reads, with the public anon
    key, `catalog_products` (`blueprint_id`, `display_title`, `is_active`),
    `product_seo` and `product_variants` (`blueprint_id`, `color`). Computes
    the English description and specs with `resolveProductDescription` and
    `extractProductSpecs` from `src/lib/seo/productDescription.ts`, and a
    12-hex sha-256 of the English title and of the description plus specs.
    Imports `src/shared/constants/productText/{pt,nl}.ts`. Prints one section per finding
    type listed in Component 5 and a summary line. Always exits 0. With
    `--inventory`, it also prints the active blueprints with their English
    title, description, specs and hashes, plus every distinct colour and
    paper type, which is the input for step 6.
*   **Why**: the only lasting check, since unit tests under `src/` don't
    survive the commit.

#### 1.2 `package.json` (Modify)

*   **Proposed Changes**: add
    `"i18n:check-products": "tsx scripts/i18n/check-product-translations.ts"`.
    Add `tsx` to `devDependencies` if it is not installed (it is run through
    `npx` today).

#### 1.3 `.github/workflows/ci.yml` (Modify)

*   **Type / Scope**: CI configuration.
*   **Proposed Changes**: a step in the `unit-tests` job, after
    `test:acceptance:contracts`, that runs `npm run i18n:check-products`
    with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
    repository secrets. Report-only: the script exits 0, so the job never
    fails on its findings.
*   **Why**: the brief requires the check in CI, so drift and gaps show on
    every pull request instead of only when someone remembers to run it.
*   **Setup (by the author, outside the repo)**: add the two repository
    secrets in GitHub.

### Step 2: Data files and lookup functions

#### 2.1 `src/shared/constants/productText/pt.ts` and `src/shared/constants/productText/nl.ts` (Create)

*   **Proposed Changes**: start as `{ "products": {}, "labels": { "color": {},
    "paperType": {} } }`. Filled in step 6.

#### 2.2 `src/shared/constants/productText/index.ts` (Create)

*   **Type / Scope**: TypeScript module.
*   **Proposed Changes**: imports both modules and exports them as
    `PRODUCT_TEXT: Record<Exclude<LocaleT, "en">, ProductTextT>`. Its header
    comment documents how to add or fix a translation and how to run the
    check script.

#### 2.3 `src/shared/types/productText.ts` (Create)

*   **Proposed Changes**: `ProductTextT`, `ProductTranslationT`
    (`title?`, `description?`, `specs?`, `source`),
    `LocalizedProductTextT` (`{ title: string; description: string | null;
    specs: string[] }`) and `ProductLabelKindT` (`"color" | "paperType"`),
    following `.claude/rules/types.md` (`T` suffix).

#### 2.4 `src/shared/helpers/localizeProduct.ts` (Create)

*   **Proposed Changes**: the three pure functions from Component 2, plus
    `normalizeLabelKey(value)`. Signatures:
    *   `localizeProductText(locale: LocaleT, blueprintId: number, english:
        LocalizedProductTextT): LocalizedProductTextT`
    *   `localizeProductLabel(locale: LocaleT, kind: ProductLabelKindT,
        englishValue: string): string`
    *   `localizeCartItemName(locale: LocaleT, blueprintId: number | null,
        storedName: string): string`
*   **Tests (throwaway)**: `en` returns input; field-by-field fallback;
    missing blueprint returns English; unknown colour returns raw value;
    normalisation matches `"Heather Grey"` and `"heather  grey"`; `null`
    blueprint in the cart returns the stored name.

### Step 3: Account carts store the blueprint ID

#### 3.1 `supabase/migrations/<timestamp>_upsert_cart_item_blueprint_ids.sql` (Create)

*   **Type / Scope**: SQL migration.
*   **Proposed Changes**: `DROP FUNCTION public.upsert_cart_item(UUID, TEXT,
    TEXT, INTEGER, TEXT, TEXT, TEXT, NUMERIC)`; `CREATE FUNCTION` with the
    same body as the current definition
    (`20260804000000_fix_cart_items_image_index.sql`) plus
    `p_printify_blueprint_id INTEGER DEFAULT NULL` and
    `p_printify_print_provider_id INTEGER DEFAULT NULL`, written on insert and
    `COALESCE`d on the quantity-merge updates. Then `SECURITY INVOKER`,
    `SET search_path = public, pg_temp`, `REVOKE ALL ... FROM PUBLIC, anon`,
    `GRANT EXECUTE ... TO authenticated, service_role`, matching
    `20261012000000_close_launch_authorization_gaps.sql`.

#### 3.2 `src/shared/types/database.types.ts` (Modify)

*   **Proposed Changes**: regenerate so the `upsert_cart_item` `Args` include
    the two parameters. `npm run supabase:types` writes to
    `src/types/database.types.ts`, which is not where the file lives; run
    `supabase gen types typescript --linked > src/shared/types/database.types.ts`
    and fix the script path in `package.json` in the same commit.

#### 3.3 `src/shared/schemas/cart.ts` (Modify)

*   **Proposed Changes**: `addToCartSchema` gains
    `printify_blueprint_id: z.number().int().nullable().optional()` and
    `printify_print_provider_id: z.number().int().nullable().optional()`.

#### 3.4 `src/shared/services/cartService.ts` (Modify)

*   **Proposed Changes**: `addToCart` passes `p_printify_blueprint_id` and
    `p_printify_print_provider_id` (or `null`) in `rpcParams`.

#### 3.5 `src/features/stamp/lib/hooks/useStampCartActions.ts` (Modify)

*   **Proposed Changes**: `cartItemPayload` includes
    `printify_blueprint_id: blueprintId ?? null` and
    `printify_print_provider_id: printProviderId ?? null`. `product_name`
    stays the English `selectedProductTitle`.

#### 3.6 `src/shared/mappers/localCartMapper.ts` (Modify)

*   **Proposed Changes**: `mapLocalCartItemToAddToCartInput` passes
    `item.blueprintId` and `item.printProviderId`, so the guest-to-account
    merge keeps them.

### Step 4: Display mappers

#### 4.1 `src/features/catalog/lib/mappers/catalogProductMapper.ts` (Modify)

*   **Proposed Changes**: `mapProductsToCatalogDisplay(products, locale)`.
    Builds the English `{ title, description, specs }` as today and passes
    it through `localizeProductText`. `category` keeps reading
    `product.display_title`. The `getDisplayTitle` import is removed.

#### 4.2 `src/app/catalog/page.tsx` (Modify)

*   **Proposed Changes**: passes `await getLocale()` to
    `mapProductsToCatalogDisplay`. `mapProductsToSchemaData` is unchanged, so
    JSON-LD stays English.

#### 4.3 `src/features/catalog/lib/helpers/filterCatalogSections.ts` (Modify)

*   **Proposed Changes**: no logic change if it already filters the mapped
    `name` and `description`; confirm with a test that a Portuguese query
    matches a Portuguese title.

#### 4.4 `src/features/homepage/lib/mappers/productCardMapper.ts` (Modify)

*   **Proposed Changes**: `mapProductsToCards(products, locale)`; title and
    description go through `localizeProductText`; `getDisplayTitle` import
    removed. Adds `mapProductOfMonth(product, locale)` returning the title and
    description `HomeProductOfMonthSection` needs.

#### 4.5 `src/features/homepage/lib/helpers/carouselProducts.ts` (Modify)

*   **Proposed Changes**: `mapToCarouselProducts(products, locale)`, same
    pattern.

#### 4.6 `src/features/homepage/ui/HomepageContent.tsx` (Modify)

*   **Proposed Changes**: reads `useLocale()` and passes it to the mappers.

#### 4.7 `src/features/homepage/ui/sections/HomeProductOfMonthSection/HomeProductOfMonthSection.tsx` (Modify)

*   **Proposed Changes**: stops calling `resolveProductDescription`; uses
    `mapProductOfMonth(product, useLocale())` and renders its title and
    description.

#### 4.8 `src/features/homepage/lib/constants/productDisplayTitles.ts` (Delete)

*   **Why**: empty, unused second title source (Alternative E). Its test, if
    any, is deleted with it.

#### 4.9 `src/features/stamp/lib/mappers/stampProductMapper.ts` (Create)

*   **Proposed Changes**: the mapping now inline in
    `ProductSelectionSection.tsx` (lines 61–90), moved here unchanged, taking
    `locale`. Keeps `name` (English) and adds `displayName`,
    `displayDescription` and `displaySpecs` from `localizeProductText`.
    `printifyDescription` is no longer needed by the card and is dropped if
    nothing else reads it.

#### 4.10 `src/features/stamp/lib/types/` (Modify the file that defines `CatalogProductMappedType`)

*   **Proposed Changes**: add the three display fields.

#### 4.11 `src/features/stamp/ui/sections/ProductSelectionSection/ProductSelectionSection.tsx` (Modify)

*   **Proposed Changes**: calls `stampProductMapper` with `useLocale()`.
    `isClothingProduct(product.name)`, the store update and the analytics
    `item_name` keep using the English `name`.

#### 4.12 `src/features/stamp/ui/sections/ProductSelectionSection/SelectedProductCard.tsx` (Modify)

*   **Proposed Changes**: renders `displayName`, `displayDescription` and
    `displaySpecs`; removes its own `extractProductSpecs` call. "See more" /
    "See less" move to `t()`.

#### 4.13 `src/features/stamp/lib/hooks/useLocalizedSelectedProduct.ts` (Create)

*   **Proposed Changes**: reads `blueprintId`, `selectedProductTitle` and
    `selectedProductDescription` from `useStampProductSelection`, and
    `useLocale()`. Returns `{ displayName, displayDescription }` from
    `localizeProductText` and a `colorLabel(color)` function from
    `localizeProductLabel`. The store keeps English. This keeps the rule that
    `ui/` components only render, as the cart (`useCartItemDisplayName`) and
    swatches (`useProductLabel`) do.

#### 4.14 `src/features/stamp/ui/sections/FinalReviewSection/FinalReviewSection.tsx` (Modify)

*   **Proposed Changes**: takes the title and description from
    `useLocalizedSelectedProduct` and passes them to `ProductSummary`.

#### 4.15 `src/features/stamp/ui/sections/FinalReviewSection/ProductSummary.tsx` (Modify)

*   **Proposed Changes**: receives the already-translated colour label as a
    prop (from the hook in 4.13) instead of the English colour. The
    hard-coded `"Black"` / `"M"` defaults move to `t()`.

### Step 5: Labels and interface strings

#### 5.1 `src/shared/hooks/useProductLabel.ts` (Create)

*   **Proposed Changes**: `useProductLabel()` reads `useLocale()` once and
    returns `(kind, value) => localizeProductLabel(locale, kind, value)`, so
    components don't import the lookup and the locale separately.

#### 5.2 `src/features/stamp/ui/sections/CustomizationSection/ColorSwatches.tsx` (Modify)

*   **Proposed Changes**: `title` and `aria-label` use the label; swatch
    lookups, `value` and selection keep the English name.

#### 5.3 `src/features/homepage/ui/components/ColorSwatches.tsx` (Modify)

*   **Proposed Changes**: `title` uses the label. Its callers
    (`HomeProductCard.tsx`, `CatalogProductCard.tsx`,
    `CatalogProductDialog.tsx`) need no change.

#### 5.4 `src/features/stamp/ui/sections/CustomizationSection/PaperTypeOptions.tsx` (Modify)

*   **Proposed Changes**: visible text and `aria-label` use the
    `paperType` label; the selected value stays English.

#### 5.5 `src/features/stamp/lib/helpers/sizeDisplayMapper.ts` (Modify)

*   **Proposed Changes**: returns a marker for "One Size" and the
    "(Vertical)" / "(Horizontal)" suffix instead of English words, and the
    caller renders them through `t()`. If that makes the helper's callers
    awkward, the alternative is a `locale`-free helper that returns
    `{ size, orientation }` and a component that formats it. Decided at
    implementation by whichever keeps the existing callers smaller.

#### 5.6 `src/shared/hooks/useCartItemDisplayName.ts` (Create)

*   **Proposed Changes**: `useCartItemDisplayName(item)` returns
    `localizeCartItemName(useLocale(), item.printify_blueprint_id,
    item.product_name || item.product?.name || t("customProduct"))`.

#### 5.7 Cart and checkout components (Modify)

*   `src/features/cart/ui/sections/CartItemCard/CartItemCardContent.tsx`,
    `CartItemCard.tsx`, `CartItemCardActions.tsx`,
    `src/features/checkout/ui/sections/CheckoutSummarySection/CheckoutCartItems.tsx`.
*   **Proposed Changes**: render the name from `useCartItemDisplayName`
    (including in `aria-label`s); "Standard" and "Custom Product" move to
    `t()`.

#### 5.8 `src/i18n/messages/en.json`, `pt.json`, `nl.json` (Modify)

*   **Proposed Changes**: keys for "See more", "See less", "Standard",
    "Custom Product", "One Size", "Vertical", "Horizontal" and the
    `ProductSummary` defaults, in the namespaces of the components that use
    them.

### Step 6: Translations

#### 6.1 `src/shared/constants/productText/pt.ts` and `nl.ts` (Modify)

*   **Proposed Changes**: from `npm run i18n:check-products -- --inventory`,
    Claude writes the Portuguese (pt-PT) and Dutch translations of every
    active blueprint's title, description and specs, with the `source`
    hashes the script printed, and every colour and paper-type label. The
    author spot-checks them. The script must then report no missing
    entries, no spec-count mismatches and no drift.

### Step 7: Tests and docs that outlive the branch

#### 7.1 `tests/acceptance/specs/catalog-products.spec.mjs` (Modify, needs approval)

*   **Proposed Changes**: pin `locale: 'en-US'` (and no `NEXT_LOCALE`
    cookie), because it selects products by their English title.

#### 7.2 `src/i18n/request.ts` (Modify)

*   **Proposed Changes**: the header comment's "to add a language" note also
    says to add `src/shared/constants/productText/<locale>.ts`.

#### 7.3 `docs/README.md` (Modify)

*   **Proposed Changes**: one line pointing to `src/shared/constants/productText/` and
    `npm run i18n:check-products`.

### Verification Plan

*   **Compilation/Build**: `npx tsc --noEmit`, `npm run build`.
*   **Unit Tests**: `npm run test:unit` while building (the throwaway tests
    from steps 2, 4 and 5); deleted before commit.
*   **Static Analysis & Linting**: `npm run lint`, `npm run knip` (catches
    the deleted `productDisplayTitles.ts` and any dropped
    `printifyDescription`), `npm run fallow`, and a check against
    `.claude/rules/`.
*   **Translation coverage**: `npm run i18n:check-products` reports no
    missing entries, mismatches or drift.
*   **Database**: `supabase db push` on the test project; add a product to
    an account cart and confirm `cart_items.printify_blueprint_id` is set;
    sign in with a guest cart and confirm the merged rows keep it.
*   **Manual, in the running app with the cookie set to `pt` and to `nl`**:
    each CUJ above, plus: mugs and notebooks keep their option sets; print
    placement is unchanged; the analytics event and `cart_items.product_name`
    are English; English visitors see no change.
*   **Before the PR**: `/review-frontend changes`.
*   **E2E/Integration**: `npm run test:acceptance` with the pinned locale.

## Implementation Notes (2026-11-21)

Where the implementation differs from the plan above, and why:

*   **Catalog size.** The live catalog has 9 active products, not 11; all 9,
    45 colours and 4 paper types are translated, and the check script reports
    no findings.
*   **One field convention everywhere** (Stage 5 and 6 review finding).
    Fields that logic reads (`name`: sorting, category detection, the stamp
    store, analytics) stay English and get a `displayName` twin. Fields that
    are only rendered (`description`, `specs`) carry the translated text.
    The catalog's "name A–Z" sort therefore keeps the English order.
*   **No barrel file.** `src/shared/constants/productText/productTextByLocale.ts`
    replaces the planned `index.ts`.
*   **Data shape.** Each language module is `{ products, labels }`.
*   **Descriptions** are stored as the full plain-text description (with the
    same `.:` bullets the English UI shows) plus a separate `specs` array, so
    the pt/nl layout matches English.
*   **Locale type.** The lookup functions take any locale string; anything
    other than `pt`/`nl` gets English. `useLocale()`/`getLocale()` return plain
    strings, so no call site needs a cast.
*   **Carousel.** `mapToCarouselProducts` has no callers, so it was left
    untouched.
*   **Size words** go through `useSizeLabel` (`stamp/lib/hooks`) and a pure
    `translateSizeWords`, with the words in the `productSizes` message
    namespace. "See more" / "See less" use new `stamp.productSelection` keys;
    the cart's "Standard" and "Custom Product" fallbacks reuse existing keys.
*   **Product of the Month** reads its translated text through
    `useLocalizedProductOfMonth`, and Final Review through
    `useLocalizedSelectedProduct`, so no `ui/` component calls the lookup.
*   **Bundle size (frontend review).** `localizeProduct.ts` imports no
    language data; every function takes the visitor's product text (null
    for English). Server pages resolve it with `productTextFor(locale)`
    and map before rendering (`/`, `/catalog`), so those client bundles
    carry no translation data. Client-only surfaces (`/stamp`, cart,
    checkout, Product of the Month) use `useProductText()`, which loads
    only the visitor's language with `import()` and caches it for the
    session; English visitors load nothing. The trade-off, chosen by the
    author: on the first load pt/nl product names show in English for a
    moment. Swatch labels for the homepage and catalog cards are built on
    the server (`colorLabels`).
*   **A–Z sort (frontend review).** The catalog's "name A–Z" option sorts
    by the visible `displayName`, so it is alphabetical in every language.
    The default order is still the English database order.
*   **Analytics.** Cart removal sends the stored English `product_name` as
    `item_name`, matching `add_to_cart`.
*   **Database types.** `upsert_cart_item` `Args` were updated by hand to match
    the migration; regenerate with `npm run supabase:types` after
    `supabase db push`.

--------------------------------------------------------------------------------

*Drafted with EGM*
