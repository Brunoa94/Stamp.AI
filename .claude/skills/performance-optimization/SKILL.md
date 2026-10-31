---
name: performance-optimization
description: Measures and fixes performance in this Next.js + Supabase app. Use when a page, interaction or API route is slow; when Core Web Vitals (LCP, INP, CLS) regress or need improving; when reading a profiler or Lighthouse report; when adding images, heavy client components or list queries; or when deciding whether a memo, cache or dynamic import is worth it.
---

# Performance Optimization

## Overview

Measure before optimizing. Performance work without measurement is guessing, and guessing leads to premature optimization that adds complexity without improving what matters. Profile first, identify the actual bottleneck, fix it, measure again.

## When to Use

- Users or monitoring (Sentry) report slow behavior
- Core Web Vitals are below the "Good" thresholds
- You suspect a change introduced a regression
- You were handed a profiler trace or Lighthouse report to analyze
- Building features that render large lists, big images or heavy client components

**When NOT to use:** don't optimize without evidence of a problem. Premature optimization costs more than it gains.

## Core Web Vitals Targets

| Metric                              | Good    | Needs Improvement | Poor    |
| ----------------------------------- | ------- | ----------------- | ------- |
| **LCP** (Largest Contentful Paint)  | ≤ 2.5s  | ≤ 4.0s            | > 4.0s  |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms           | > 500ms |
| **CLS** (Cumulative Layout Shift)   | ≤ 0.1   | ≤ 0.25            | > 0.25  |

## The Optimization Workflow

```
1. MEASURE  → Establish a baseline with real numbers
2. IDENTIFY → Find the actual bottleneck (not the assumed one)
3. FIX      → Address that specific bottleneck
4. VERIFY   → Measure again, confirm the improvement
5. GUARD    → Add monitoring or a test so it doesn't regress
```

### Step 1: Measure

Use both kinds of data:

- **Synthetic:** Lighthouse and the DevTools Performance tab (or a Chrome DevTools MCP performance trace). Controlled and reproducible; best for isolating an issue. Always measure a production build (`npm run build && npm run start`) — `next dev` is not representative.
- **Real users:** Core Web Vitals are already captured by `src/shared/ui/WebVitalsReporter.tsx` → `src/lib/observability/webVitals.ts` and sent to Sentry. Check Sentry before and after a fix to confirm users actually got faster.

**Backend:** Sentry performance traces (sampling via `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`), Supabase query performance in the dashboard, and `console.time` around a suspect call for a quick check.

### Where to Start Measuring

```
What is slow?
├── First page load
│   ├── Large bundle? --> Check the client JS per route in the `next build` output
│   ├── Slow server response? --> TTFB in the Network waterfall
│   │   └── Waiting (server) long? --> Profile the Server Component / route: queries and caching
│   └── Render-blocking resources? --> CSS/JS/fonts blocking in the waterfall
├── Interaction feels sluggish
│   ├── UI freezes on click? --> Main thread long tasks (>50ms) in the Performance trace
│   ├── Input lag? --> Re-renders (React DevTools Profiler), controlled-input overhead
│   └── Animation jank? --> Layout thrashing, forced reflows, animating non-composited properties
├── Page after navigation
│   ├── Data loading? --> Request waterfalls, React Query cache misses, sequential awaits
│   └── Client rendering? --> Component render time in the React Profiler
└── API route / Edge Function
    ├── One endpoint slow? --> Its Supabase queries (indexes, N+1), external calls (Printify, AI)
    └── Intermittent? --> Cold starts, external API latency, lock contention
```

### Step 2: Identify the Bottleneck

**Frontend:**

| Symptom           | Likely cause                                                 | Investigation                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------- |
| Slow LCP          | Unprioritized hero image, render-blocking resources, slow TTFB | Waterfall, which element is the LCP  |
| High CLS          | Images without dimensions, late content, font swaps          | Layout shift attribution              |
| Poor INP          | Heavy JS on the main thread, large DOM updates               | Long tasks in the Performance trace   |
| Slow initial load | Large client bundle, too much `"use client"`                 | `next build` route sizes              |

**Backend:**

| Symptom            | Likely cause                                          | Investigation                     |
| ------------------ | ----------------------------------------------------- | --------------------------------- |
| Slow responses     | N+1 queries, missing indexes, unbounded selects       | Supabase query performance        |
| Memory growth      | Unbounded caches, large payloads                      | Heap snapshot                     |
| High latency       | Missing caching, sequential awaits, external API hops | Sentry trace spans                |

### Step 3: Fix Common Anti-Patterns

#### N+1 Queries

```ts
// BAD: one query per order for its items
const { data: orders } = await supabase.from("orders").select("*");
for (const order of orders ?? []) {
  order.items = (await supabase.from("order_items").select("*").eq("order_id", order.id)).data;
}

// GOOD: one query with the relation embedded
const { data: orders } = await supabase.from("orders").select("*, order_items(*)");
```

#### Unbounded Data Fetching

```ts
// BAD: every row, every column
const { data } = await supabase.from("orders").select("*");

// GOOD: only the columns the view needs, paginated
const { data } = await supabase
  .from("orders")
  .select("id, status, total, created_at")
  .order("created_at", { ascending: false })
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
```

#### Sequential Awaits

```ts
// BAD: waterfalls two independent requests
const user = await getUser();
const catalog = await getCatalog();

// GOOD: run independent work in parallel
const [user, catalog] = await Promise.all([getUser(), getCatalog()]);
```

#### Images

Always use `Image` from `next/image` (lint enforces it). It handles formats, `srcset` and lazy loading; you supply what it can't infer:

```tsx
// Hero / LCP image: load it first, tell the browser how wide it renders
<Image src={heroSrc} alt="…" width={1200} height={600} priority sizes="(max-width: 1200px) 100vw, 1200px" />

// Below the fold: lazy by default; give `sizes` for anything that isn't full width
<Image src={productSrc} alt="…" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
```

Remote hosts must be listed in `images.remotePatterns` in `next.config.ts` (and `img-src` in the CSP there).

#### Unnecessary Re-renders

```tsx
// BAD: new object every render, so memoized children re-render
<CatalogFilters options={{ sortBy: "date", order: "desc" }} />

// GOOD: stable reference (module constant in lib/constants)
<CatalogFilters options={DEFAULT_FILTER_OPTIONS} />
```

Reach for `memo` / `useMemo` / `useCallback` only when the Profiler shows a costly render. Overusing them is as bad as underusing them. In Zustand stores, select the slice you need (`useStampFlowStore((s) => s.step)`) instead of the whole store.

#### Large Client Bundle

- Keep components Server Components by default; push `"use client"` down to the leaves that need interactivity.
- Load heavy, rarely-used client UI on demand:

```tsx
// src/features/dashboard/ui/DashboardContent.tsx: the modal's code loads only when it's needed
const OrdersDetailsModal = dynamic(
  () => import("@/features/orders/ui/components/OrdersDetailsModal/OrdersDetailsModal").then((mod) => mod.OrdersDetailsModal),
  { ssr: false },
);
```

#### Missing Caching

- **Server data that rarely changes** (catalog, pricing): cache it on the server with `unstable_cache`, as `src/lib/supabase/server-cache.ts` does, with a tag to revalidate it.
- **Client data:** set a deliberate `staleTime` on the React Query hook in `src/shared/queries`. Fresh-critical data (orders) uses `staleTime: 0`; reference data can be cached for minutes.

## Performance Budget

Targets to check against (not yet enforced in CI):

```
Client JS per route: < 200KB gzipped (first load, from `next build` output)
Images above the fold: < 200KB each
Fonts: < 100KB total
API response time: < 200ms p95 (excluding AI generation)
Lighthouse Performance score: ≥ 90 on mobile
```

## Common Rationalizations

| Rationalization                     | Reality                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| "We'll optimize later"              | Performance debt compounds. Fix obvious anti-patterns now, defer micro-optimizations.  |
| "It's fast on my machine"           | Your machine isn't the user's. Profile with CPU and network throttling.                |
| "This optimization is obvious"      | If you didn't measure, you don't know. Profile first.                                  |
| "Users won't notice 100ms"          | Small delays measurably hurt conversion, especially in checkout.                       |
| "Next.js handles performance"       | It can't fix N+1 queries, unbounded selects or a page that's all `"use client"`.        |

## Red Flags

- Optimization without profiling data to justify it
- N+1 queries or `select("*")` on list views
- List queries without `.range()` / a limit
- `next/image` without `sizes` on non-full-width images, or no `priority` on the LCP image
- Client bundle growing without review
- `memo` / `useMemo` everywhere

## Verification

After any performance change:

- [ ] Before and after numbers exist, measured on a production build
- [ ] The specific bottleneck is identified and addressed
- [ ] Core Web Vitals are within "Good" (Lighthouse locally, Sentry for real users)
- [ ] `next build` route sizes didn't grow noticeably
- [ ] No N+1 queries in new data-fetching code
- [ ] Existing tests still pass (`npm test`)
