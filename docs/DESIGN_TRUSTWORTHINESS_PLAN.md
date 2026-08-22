# Design Trustworthiness Improvements Plan

Based on analysis of popsofa.com's design patterns, reconciled against the current codebase (2026-08-19). Much of the original plan was already implemented in `src/features/ui/trust/` and the homepage sections — this revision replaces generic recommendations with the actual remaining gaps, each with concrete file targets.

---

## What Already Exists (Do Not Rebuild)

Verified in the codebase before planning:

- **Trust component library** — `src/features/ui/trust/` ships 8 components: `HeroSecurityBadge`, `OrdersFulfilledCounter`, `TrustpilotWidget`, `PaymentSecurityBadge`, `SecureCheckoutNotice`, `VerifiedSecureBadge`, `FooterPaymentIcons`, `TrustpilotReviewButton`. Hero, checkout payment section, checkout summary, footer, and payment-success already use them.
- **Payment badges** — real brand assets in `public/payment-options/`, wired via `PAYMENT_ICONS` (`src/features/homepage/lib/constants/paymentIcons.tsx`), rendered in footer, homepage, checkout method selector, and `SecureCheckoutNotice`.
- **Testimonials & social proof** — `HomeReviewsSection` (rating summary + 4 testimonial cards with names, roles, quotes, star ratings) and `HomeTrustGuaranteesSection` (returns / money-back / secure checkout / free shipping cards). `HeroPromoBanner` shows trust items above the fold.
- **Policy pages** — `/terms`, `/privacy`, `/cookies`, `/security`, `/shipping`, `/returns` all exist via `src/features/legal/ui/LegalDocument.tsx`, plus a full `/faq` page and `HomeFaqSection`. Footer links to all of them.
- **Scroll reveals** — `SectionReveal` (parallax + fade on 6 homepage sections), `useStaggeredReveal`, with `prefers-reduced-motion` handled in 11 CSS blocks.
- **Image discipline** — zero raw `<img>` tags; everything goes through `next/image`.

---

## Trust Defects Found (New — Fix First)

These actively undermine trust today and cost almost nothing to fix:

### A. Placeholder legal entity data on live pages

`src/features/legal/lib/constants/legalEntity.ts` renders `[registered address — pending legal review]`, `[KvK number — …]`, `[VAT number — …]` on the live legal pages, and its own TODO notes that `src/features/seo/config/business.ts` declares a **US** entity while the legal pages assume **NL**. Visible placeholder brackets on a Terms page is a stronger anti-trust signal than any missing badge.

**Action:** Resolve the entity jurisdiction, fill in real registration data, and remove the placeholders. Blocked on legal input — escalate, don't wait.

### B. Contradictory trust numbers

Three unreconciled hardcoded figures ship simultaneously: `OrdersFulfilledCounter` (10,000 orders), `TrustpilotWidget` default (4.8 / 2,847 reviews), `HOME_RATING_SUMMARY` (4.8 / 1,247 reviews). Guarantee copy also disagrees: `TRUST_ITEMS` and `trust.guarantee.title` say **30-day** money back; `home.guarantees.items.returns.title` says **14-day** returns.

**Action:** Pick one source of truth for each figure (single constants module or CMS), align all consumers, and make the returns window match `/returns` policy copy.

### C. Homepage advertises a payment method that doesn't work

`HomePaymentMethods.tsx:31` renders **all** `PAYMENT_ICONS` including iDEAL, while `FooterPaymentIcons` filters it out and checkout marks it disabled/"Soon" (`CheckoutPaymentMethods.tsx:120-142`).

**Action:** Apply the same iDEAL filter (or "coming soon" treatment) in `HomePaymentMethods`.

### D. The purchase flow has zero trust signals

`AppLayoutChrome.tsx:17-22` suppresses the footer on `/stamp*`, so the configure/buy flow shows no policy links, no payment icons, no guarantees. `/cart` likewise has none — `CartOrderSummaryFooter` shows only a delivery estimate, and `CartMobileCta` (the fixed mobile checkout bar) is bare.

**Action:** See §1 below.

---

## Recommendations

### 1. Trust Signals Where the Money Is (was "Prominent Trust Signals")

Trust components exist but are concentrated on the homepage and checkout payment step. The gaps are cart, the `/stamp` flow, and the final pay button.

**Actions:**

- Add `SecureCheckoutNotice` (or a compact variant) + payment icons to `CartOrderSummaryFooter` next to "Proceed to Checkout", and a lock icon to `CartMobileCta`.
- Move recognizable payment icons adjacent to the actual pay CTAs in `CheckoutSummarySection.tsx:96-117` — today only `VerifiedSecureBadge` sits below them while the icons live a column away in `CheckoutPaymentMethods`.
- Give `/stamp` a minimal trust treatment: either stop suppressing the footer, or add a slim trust strip (payment icons + returns/secure links). The unused `trust.bar` i18n keys in `en.json` (`secureCheckout`, `guarantee`, `madeToOrder`, `carbonNeutral`) suggest this was already designed — build or delete them.
- Reconsider `CheckoutPayPalButton`'s restyling (chocolate → gold per its own comment, replacing PayPal blue). Recognizable payment branding at the CTA is itself a trust cue; this is a deliberate trade-off to revisit, not an oversight.
- Add avatars to `ReviewsTestimonialCard` — cards already have names/roles/quotes; photos are the only missing piece. (Requires real or licensed imagery; do not use AI-generated faces for "customers".)

### 2. Contact Visibility (was part of "Policy Visibility")

Policy pages and footer links already exist. What's missing is contact:

- **No `/contact` route.** Contact surface is a `mailto:` in exactly two places (`LegalDocument.tsx:99`, `FaqPageContent.tsx:90`).
- **No contact link or email in the footer** (`StampFooter.tsx:27-63` columns cover create/support/legal/social only).

**Actions:**

- Add a contact entry (email at minimum) to the footer `support` column.
- Add a lightweight `/contact` page or expandable contact block on `/faq`.
- The header (`StampHeader.tsx`) is already fixed; if a trust/policy strip is wanted there, it's an addition to the existing header, not a new sticky element.

### 3. Consistent Card Styling — Confirmed, With a Named Outlier List

There is **no shared Card component** in `src/features/ui/`. The de-facto house style is *square corners + 1px divider border + `--shadow-stamp-card-hover` on hover*, but the repo currently uses 9 border-radius values, ~15 shadow values, and 7 image aspect ratios.

**Actions:**

- Extract a `Card` primitive in `src/features/ui/` encoding the house style (square, `border border-stamp-divider`, hover shadow token, `p-8 lg:p-10` default).
- Migrate the named outliers to it:
  - `ProcessMobileCard.tsx` — `rounded-2xl` + `shadow-lg` + `aspect-video`
  - `SuggestionCard.tsx` / `NoFilterCard.tsx` — `rounded-xl` + `ring-1`
  - `HomePaymentMethods.tsx` — `rounded-lg`
  - `HomeProductOfMonthSection.tsx` — `shadow-xl`
  - `FeaturedCarouselCard.tsx` — arbitrary inset shadow
  - Legacy shadcn-era pages `auth/auth-code-error/page.tsx` and `reset-password/page.tsx` — `bg-white rounded-lg shadow-md`
- Standardize product imagery on `aspect-square` (mobile) / `aspect-3/4` (desktop) as `HomeProductCard` already does; treat the other 5 ratios as exceptions needing justification.
- Fix `ReviewsTestimonialCard.tsx:31` inline `style.borderColor` — move per-platform border colors to variants/tokens per `docs/COLOR_PALETTE_GUIDELINES.md`.

### 4. Spacing Consistency (was "More Whitespace")

The baseline is already generous — homepage sections run `py-24` (96px) with uniform `px-6 lg:px-12 xl:px-24`. A blanket +20-30% is not needed; consistency is.

**Actions:**

- Normalize the vertical rhythm outliers: `HomeStorySection` at `py-16` (low) vs `HomeCtaSection` at `py-32` (high) against the `py-24` norm — make deviations intentional.
- **Add container constraints to cart and checkout**: `CartLayout.tsx:20` and `CheckoutLayout.tsx:25` have no `mx-auto max-w-*` at all, so they stretch unboundedly on wide screens.
- Reconcile the container max-width spread (`screen-2xl`, `7xl`, `6xl`, `5xl`, `4xl` across sections) into a documented scale.

### 5. Dead Code & Token Cleanup (replaces "Restrained Accent Colors")

The original recommendation to "use `--color-purple`/`--color-cyan` more sparingly" was based on a false premise: **zero components use them.** All references are dead rules inside `globals.css` (`.nav-link-underline`, `.dashboard-blob`, `.animated-dot`, etc. — none applied by any `.tsx`). Likewise, dark mode is force-disabled (`ThemeProvider` sets `forcedTheme="light"`; the `.dark` block in `globals-stamp.css` is TODO comments), and the shipping palette is `--color-stamp-*` (hex), not the OKLCH shadcn tokens.

**Actions:**

- Delete dead brand tokens (`--color-purple`, `--color-cyan`) and the `globals.css` rules referencing them, or explicitly re-adopt them — currently they're documentation fiction.
- Update `docs/COLOR_PALETTE_GUIDELINES.md`, which still documents purple as "Primary brand" and cyan as "Secondary brand".
- Remove never-imported components: `HomeManifestoSection.tsx`, `HomeFeaturedCarouselSection.tsx`, `HomeTrustIndicators.tsx`, `AnimatedLogoDot.tsx`; and unused i18n keys `trust.bar` / `trust.guarantee` (unless the `/stamp` trust strip from §1 adopts them).
- Audit remaining `.dark:` utilities (12, all unreachable) — delete or ship dark mode, not the current half-state.
- If any accent is overused today it is `--color-stamp-gold` — audit that, not purple/cyan.

### 6. Animation Cleanup (was "Subtle Background Animation")

The "22-30s durations as currently implemented" claim referred to `.animate-drift-1..4` in `globals.css:743-777` — which **no component applies**. Actual running animation (grain overlay, `SectionReveal` parallax, bubbling products, stagger reveals) is already restrained and mostly reduced-motion-safe.

**Actions:**

- Delete the dead animation CSS (`.animate-drift-*`, `.blob`, `.gradient-layer`, `.dashboard-blob`, `.hero-blur-blob`, `.glass-card`, `.brutalist-card`, etc.) or wire it up deliberately.
- Fix the three reveals that bypass `prefers-reduced-motion` because they animate via inline styles with no CSS override: `HomeProductCard.tsx:41-45`, `FeaturedCarouselCard.tsx:42-46`, `HeroPromoBanner.tsx:28-35`.
- Have `useScrollProgress` (in `SectionReveal`) and the `HeroBubblingProducts` wheel handler check the reduced-motion media query in JS before driving continuous scroll work.

### 7. Lifestyle/Contextual Imagery — Unchanged, Correctly Low Priority

Confirmed accurate: all current assets are flat product mockups or design-transform pairs; no worn/in-context photography, no UGC section, no avatars anywhere.

**Actions (when assets exist):**

- Photos of products worn/used in real settings; UGC "Happy Customers" section; consistent lighting/backgrounds.
- Testimonial avatars (see §1).
- Note: any card in the plan that says "product pages" means `/stamp` — there is no per-product detail page; `productCardMapper.ts:49` routes every card to `/stamp`.

---

## Implementation Priority

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| **P0** | Legal entity placeholders + jurisdiction (Defect A) | High | Low (blocked on legal input) |
| **P0** | Reconcile trust numbers & guarantee windows (Defect B) | High | Low |
| **P0** | iDEAL shown as available on homepage (Defect C) | Medium | Trivial |
| High | Trust signals on cart + `/stamp` + pay CTA (§1) | High | Low-Medium |
| High | Cart/checkout container max-width (§4) | Medium | Trivial |
| High | Contact visibility (§2) | High | Low |
| Medium | Shared Card primitive + outlier migration (§3) | Medium | Medium |
| Medium | Dead code/token cleanup (§5) | Medium | Low |
| Medium | Reduced-motion gaps (§6) | Medium | Low |
| Low | Spacing rhythm normalization (§4) | Low | Low |
| Low | Lifestyle imagery + avatars (§7) | High | High (requires assets) |

---

## Quick Wins (revised)

1. Filter iDEAL out of `HomePaymentMethods` (one-line parity fix with footer/checkout).
2. Single source of truth for order/review counts and the returns window.
3. `SecureCheckoutNotice` + payment icons in `CartOrderSummaryFooter`; lock icon in `CartMobileCta`.
4. `mx-auto max-w-*` on `CartLayout` and `CheckoutLayout`.
5. Contact email in the footer support column.
6. Delete dead components, dead animation CSS, and dead purple/cyan token rules.

---

## Metrics to Track

- **Conversion rate** — especially cart → checkout (that's where trust signals were missing)
- **Cart abandonment** — the cart page was the weakest trust surface
- **Checkout completion rate** — after moving payment branding next to the pay CTA
- **Bounce rate / time on site** — for homepage consistency changes

---

## Corrections to the Original Plan

Kept for traceability; the sections above already incorporate these.

| Original claim | Reality |
|---|---|
| Add payment badges, security indicators, testimonials, social proof section, order/review counts | All already built (`src/features/ui/trust/`, `HomeReviewsSection`, `HomeTrustGuaranteesSection`). Remaining gaps: cart, `/stamp`, pay-CTA adjacency, avatars. |
| Use `--color-purple`/`--color-cyan` more sparingly | Used zero times in components; only in dead CSS. Deletion task, not restraint task. |
| "Dark mode gradients" as a neutral base | Dark mode is force-disabled (`forcedTheme="light"`). |
| `--color-concrete` as the neutral base | Used twice; the actual base is `--color-stamp-*`. |
| "22-30s animations as currently implemented" | Real CSS, but dead — `.animate-drift-*` applied nowhere. |
| "Add sticky header with policy links" | Header is already fixed; it lacks the links, not the stickiness. |
| "Consider an FAQ section" | `/faq` page and `HomeFaqSection` both exist. |
| "Policy summaries on product pages" | No product detail pages exist; every card routes to `/stamp`. |
| "Sanchez + Poppins hierarchy" (Current Strengths) | Body font is Inter (`--font-sans: var(--font-inter)`); Poppins is a fallback. Six Google fonts load in `layout.tsx` — itself worth an audit. |
| "OKLCH color system" (Current Strengths) | True only for unused shadcn tokens; the shipping `--color-stamp-*` palette is hex. |

---

## References

- [popsofa.com](https://www.popsofa.com) - Design inspiration source
- `docs/COLOR_PALETTE_GUIDELINES.md` - Our color system (needs updating per §5)
- `docs/README_UI_ENGINEERING.md` - UI component guidelines
- `src/features/ui/trust/` - Existing trust component library
