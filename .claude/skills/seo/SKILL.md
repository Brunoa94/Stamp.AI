---
name: seo
description: SEO conventions in this Next.js app — page metadata, canonical URLs, robots/noindex, the sitemap, JSON-LD structured data and heading structure. Use when adding or changing a route under src/app, a page's title or description, the src/features/seo slice, sitemap.ts or robots.ts, structured data, or when reviewing a change for search visibility.
---

# SEO

## Overview

Everything search engines read comes from one slice, `src/features/seo/`. Pages never hand-write `<head>` tags, robots rules or JSON-LD: they call the slice's helpers, so canonical URLs, noindex rules and the sitemap can't drift apart. The generic searchfit-seo plugin skills cover keyword and content strategy; this skill covers how *this codebase* does it.

## Source of truth

| What | Where |
| ---- | ----- |
| Route registry (path, sitemap priority, `index`) | `src/features/seo/config/routes.ts` → `ROUTE_SEO` |
| Pages that must be noindex | `NOINDEX_PATHS` in the same file (supports a trailing `*`) |
| Paths robots must disallow | `DISALLOW_PATHS` in the same file |
| Site URL, name, languages | `src/features/seo/config/site.ts` |
| Per-page keywords | `src/features/seo/config/keywords.ts` → `PAGE_KEYWORDS` |
| Metadata builder | `src/features/seo/metadata/pageMetadata.ts` → `generatePageMetadata` |
| JSON-LD builders | `src/features/seo/schemas/*.ts`, rendered with `StructuredData` |
| Sitemap / robots | `src/app/sitemap.ts`, `src/app/robots.ts` — both derive from `routes.ts`; never list paths in them directly |

## Adding or changing a route

1. **Register it in `ROUTE_SEO`.** `index: true` puts it in the sitemap; `routeSeo.test.ts` fails if an indexed route has no `page.tsx`.
2. **Private or transactional pages** (cart, checkout and its return pages, orders, dashboard, profile, auth callbacks, reset-password) get `index: false`, an entry in `NOINDEX_PATHS`, and — when crawlers shouldn't fetch them at all — `DISALLOW_PATHS`.
3. **Export `generateMetadata`** (or `metadata`) from `page.tsx`, built with `generatePageMetadata({ title, description, path, keywords })`. It sets the canonical URL, hreflang alternates, Open Graph, Twitter and robots for you. Titles and descriptions come from the page's `meta` namespace in `src/i18n/messages/` via `getTranslations`, not string literals in the page.
4. **Pass the route's real `path`.** The canonical URL and the noindex check are both computed from it; a wrong path silently canonicalises to another page.

## Content rules

- **Title**: unique per page, the primary topic first; the root layout's template adds the site name, so don't append it yourself.
- **Description**: written for the result snippet, one or two sentences. `optimizeDescription` trims it; don't rely on the trim to fix a long one.
- **One `h1` per page**, via `Heading as="h1"`; section headings descend without skipping levels. The visual `variant` is independent of the level.
- **Images**: `alt` describes what the image shows for this page's purpose; decorative images get `alt=""`. A product image's alt names the product.
- **Internal links** use `next/link` with crawlable `href`s, not click handlers.

## Structured data

Render JSON-LD with `<StructuredData data={...} />` using a builder from `schemas/`; never inline a `<script type="application/ld+json">`.

| Page type | Schema |
| --------- | ------ |
| Home | `homepage`, `organization`, `website` |
| Catalog / product listing | `itemList`, `product` (via `lib/productSchemaMapper.ts`) |
| FAQ | `faqPageSchema` — questions must match the visible text |
| Content pages | `pageSchema` / `webpage`, `breadcrumb` |

Structured data must describe what the page actually shows: prices, availability and FAQ answers that differ from the visible content are a spam signal.

## Review checklist

- [ ] New or renamed route is in `ROUTE_SEO` with the right `index`
- [ ] Private routes are noindex (and disallowed where appropriate)
- [ ] `generatePageMetadata` with the correct `path`; title/description from i18n messages
- [ ] Exactly one `h1`; heading levels don't skip
- [ ] Meaningful `alt` on content images
- [ ] JSON-LD from `schemas/`, consistent with the visible content
- [ ] `sitemap.ts` / `robots.ts` untouched, or still derived from `routes.ts`
