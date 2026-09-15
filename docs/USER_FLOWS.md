# Stamp.AI — User Flows

This document maps every user-facing flow of the website as implemented in the code today (branch `dev`, September 2026). It is a specification of *what exists*, not of what is desired: where the implementation has a gap or a defect, it is called out in a **⚠ Note** so the team can decide whether to fix the code or amend the spec.

The three revenue-critical pages — **/stamp**, **/cart** and **/checkout** — are decomposed scenario by scenario. Secondary pages are covered at flow level in section 6.

**How to read**

- Every scenario has an ID (`S-` stamp, `C-` cart, `K-` checkout, `A-` auth, `O-` orders, `D-` dashboard, `P-` profile, `B-` buy credits, `H-` homepage/catalog).
- *Preconditions* → *Trigger* → *Steps / Branches* → *Result* → *Data touched* (database tables, browser storage, analytics events).
- Prices are in **EUR cents** in the database and **EUR** in the UI. Free shipping threshold is €60, otherwise shipping is €4.99. There is no tax.
- Code references point to the file that owns the behaviour so the flow can be verified or updated.

---

## Table of contents

1. [Site map and global rules](#1-site-map-and-global-rules)
2. [The primary funnel](#2-the-primary-funnel)
3. [Stamp page flows (/stamp)](#3-stamp-page-flows-stamp)
4. [Cart flows (/cart)](#4-cart-flows-cart)
5. [Checkout and payment flows (/checkout)](#5-checkout-and-payment-flows-checkout)
6. [Secondary flows](#6-secondary-flows)
7. [Known gaps and defects found while mapping](#7-known-gaps-and-defects-found-while-mapping)
8. [Appendix A — Browser storage keys](#appendix-a--browser-storage-keys)
9. [Appendix B — Analytics events by flow](#appendix-b--analytics-events-by-flow)

---

## 1. Site map and global rules

### 1.1 Routes

| Route | Purpose | Auth | Indexable |
|---|---|---|---|
| `/` | Marketing homepage, CTAs into `/stamp` | Public | Yes (ISR 30 min) |
| `/catalog` | Browse products by category, quick-view dialog → `/stamp` | Public | Yes (ISR 30 min) |
| `/stamp` | 8-step AI designer: upload → describe → generate → pick → product → customize → create → review → bag | **Server-gated** (middleware redirects guests to `/`) | Yes |
| `/cart` | Review bag, select items, proceed to checkout | Client-gated (`ProtectedRoute` → `/`) | No |
| `/checkout?cartId=` | Address, promo code, payment (Stripe card, PayPal, iDEAL) | Client-gated | No |
| `/checkout/stripe-return` `/checkout/paypal-return` `/checkout/mollie-return` | Payment return pages; run the order-creation pipeline | Needs user in session | No |
| `/dashboard` | Profile card, credits card, quick links, metrics, recent orders, payment recovery banner | Client-gated | No |
| `/orders` | Order list with filters, details modal, cancel, invoice download | Client-gated | No |
| `/profile` | Edit name, change password, single shipping address | Client-gated | No |
| `/reset-password` | Set new password after recovery link | Public (needs recovery session to succeed) | No |
| `/auth/callback` | OAuth / magic-link / recovery code exchange | Public | — |
| `/auth/auth-code-error` | Callback failure page | Public | No |
| `/faq` `/shipping` `/returns` `/terms` `/privacy` `/cookies` `/security` | Static content | Public | Yes |

### 1.2 Authentication model

- Auth is **modal only**. There is no `/login` or `/signup` route; the header shows `Login` / `Register` dialog triggers for guests and `Orders / Cart / Profile / Logout` for users (`src/features/stamp/ui/components/StampHeader.tsx`).
- Providers: email + password (login has reCAPTCHA v3, signup does not), Google OAuth, password reset by email.
- **Post-login destination is always `/stamp`** (or a refresh when already there). There is no "return to intended page" for either email or Google login.
- Only `/stamp` is protected at the edge (`src/middleware.ts`). `/cart`, `/checkout`, `/dashboard`, `/orders`, `/profile` render a skeleton, then redirect guests to `/` on the client.

### 1.3 Global chrome

- Header on every page; footer on every page except `/stamp`.
- Toasts (Sonner, bottom-right) are the universal error/success surface via `useErrorHandler` / `handleSuccess`.
- Single locale (`en`), one message catalog at `src/i18n/messages/en.json`. No language switcher.
- GA4 loads unconditionally; there is no cookie-consent gate.

---

## 2. The primary funnel

```mermaid
flowchart LR
  H[/ Homepage/] -->|CTA| S0
  CAT[/catalog] -->|Quick view CTA| S0
  subgraph STAMP [/stamp]
    S0[00 Hero] --> S1[01 Upload]
    S1 -->|Next / Skip| S2[02 Describe]
    S1 -->|Cached images| S4
    S2 -->|STAMP IT! - 1 coin| S3[03 Generating]
    S2 -->|Skip: use my photo| S5
    S2 -->|Skip: cached images| S4
    S3 --> S4[04 Results]
    S4 -->|Use this image| S5[05 Product]
    S5 -->|Continue| S6[06 Customize]
    S6 -->|Create product| S7[07 Creating]
    S7 --> S8[08 Review]
    S8 -->|Bag it and create another| S5
  end
  S8 -->|Bag it| CART[/cart]
  CART -->|Proceed to checkout| CK[/checkout?cartId]
  CK -->|Stripe| SR[/checkout/stripe-return]
  CK -->|PayPal| PR[/checkout/paypal-return]
  CK -->|iDEAL| MR[/checkout/mollie-return]
  SR & PR & MR -->|Order pipeline| OK[Order confirmed]
  OK -->|Track your order| ORD[/orders]
  OK -->|Create another| S0
```

Server-side artefacts produced along the way: `products` (Printify product) → `carts` + `cart_items` → `payment_transactions` → `orders` + `order_items` + `order_status_history` → Printify order → `invoices` → cart cleared.

---

## 3. Stamp page flows (/stamp)

Source: `src/features/stamp/**`. Steps live in `lib/constants/stampSteps.ts`; state in the Zustand store `lib/stores/stampFlowStore.ts`; navigation in `lib/hooks/useStampNavigation.ts`.

### 3.1 Step model

| # | ID | Section | Title | Kind |
|---|---|---|---|---|
| 0 | `hero` | `HeroSection` | Entry | Landing |
| 1 | `step-1` | `UploadSection` | Upload | Optional input |
| 2 | `step-2` | `SynthesisSection` | Describe | Input, gated by auth + coins |
| 3 | `step-3` | `GenerationSection` | Process | Transient loading (90 s timeout) |
| 4 | `step-4` | `ResultsSection` | Results | Selection |
| 5 | `step-5` | `ProductSelectionSection` | Product | Selection |
| 6 | `step-6` | `CustomizationSection` | Custom | Colour / size / placement |
| 7 | `step-7` | `ProductionSection` | Creation | Transient loading (120 s timeout) |
| 8 | `step-8` | `FinalReviewSection` | Final | Review + add to bag |

**Rendering.** All nine sections are always mounted; the active one is shown by translating a full-height column (`StampCanvas.tsx`). Consequence: every section's mount effects run on page load.

**Navigation rules**

- `nextStep()` is unguarded; each step's CTA decides when it may be called (via `disabled`).
- `goToStep(n)` (hero CTA, "Repeat", error recovery) is guarded by `getMaxAccessibleStep()`:
  - no generated results → max 2
  - no selected image → max 4
  - no product (`blueprintId` + `printProviderId`) → max 5
  - no colour → max 6
  - no created product → max 7
- **Back** always skips loading steps: from 8 → 6, from 4 → 2. Desktop: fixed top-left back button (`data-testid="back-button"`), hidden on hero. Mobile: back inside the sticky footer.
- Desktop sidebar (≥1024 px) is **display only**: active / completed / locked step rows, not clickable.
- Mobile (<768 px): each step registers one primary action in a sticky footer (`useRegisterMobileAction`). Steps 3 and 7 register nothing, so only the back button shows during loading.
- Leaving `/stamp` resets the whole store; reloading returns the user to the hero (state is not persisted, except generated images and idempotency flags — see 3.5).

### 3.2 Step scenarios

#### S-00 · Hero

| | |
|---|---|
| Preconditions | Logged in (middleware). |
| Trigger | "Begin Customization". |
| Result | `goToStep(1)`. Back button and mobile footer hidden on this step. |
| Data | analytics `step_change`. |

#### S-01 · Upload a reference image (optional)

| | |
|---|---|
| Trigger | Drop zone / hidden `<input type=file accept=".jpg,.jpeg,.png,.gif">`. |
| Validation | Type must be `image/jpeg`, `image/png` or `image/gif` → else "Invalid file type…". Size ≤ 10 MB → else "too large". `FileReader` failure → "read failed". Errors show red inside the drop zone. |
| Storage | File read as a **base64 data URL** into the store only (`uploadedImageUrl`). Nothing is uploaded to a server at this step. |
| Sub-actions | Hover **REPLACE** overlay re-opens the picker; **X** on the file-info card removes the image and clears the input so the same file can be re-picked. |
| CTA branches | (a) image present → **Next Step** → step 2. (b) no image but cached generated images exist → **Proceed with previous photos** → step 4. (c) neither → **Skip Upload** → step 2 (prompt-only generation). The CTA is never disabled. |
| Data | analytics `stamp_image_upload` (`fileType`, `fileSizeKb`). |

⚠ Note: WEBP is rejected client-side even though the generation API can sniff WEBP.

#### S-02 · Describe the design

Layout: left = 15 "filter" suggestion cards + a *No filter* card (grid on desktop, `ExpandablePicker` with "Show N more" on mobile). Right = form.

Form state (local): `prompt` (max 500 chars, live counter), `preservation` slider 0–100 (default 50), `removeBackground` checkbox (default **on**), `selectedSuggestionId`.

| Scenario | Preconditions | Behaviour |
|---|---|---|
| **S-02a Generate** | authenticated, coins > 0, prompt non-empty | **STAMP IT!** → see S-03. Button disabled while generating / prompt blank / gated. Label switches to "GENERATING…". |
| **S-02b Skip with my photo** | an uploaded image exists | Secondary button **Proceed without editing my photo** → sets `selectedImageUrl = uploadedImageUrl` and jumps directly to **step 5** (bypasses accessibility guard on purpose). No coin spent. |
| **S-02c Skip with cached images** | no upload, localStorage has generated images | **Proceed with previous generated photos** → loads cache into results and jumps to **step 4**. |
| **S-02d Not logged in** | `!isAuthenticated` (after auth loading resolves) | Overlay over the form (`coins-overlay-login`): "Login or register to continue" with Login / Register **dialog** buttons. Left filter grid stays interactive; Generate is disabled. |
| **S-02e Out of coins** | authenticated, `coins === 0` | Overlay (`coins-overlay-no-coins`): "You're out of coins for today — coins reset daily at midnight". One action, by priority: uploaded image → "Proceed without editing my photo"; else cached images → "Proceed with previous generated photos"; else **no action at all** (dead end on this step until midnight). |
| Coin balance | authenticated | `CoinsDisplay` above the CTA: skeleton while loading, then "{n} Coins available". |

⚠ Note: selecting a suggestion card only highlights it. It never changes the prompt and is never sent to the API.

#### S-03 · Generation (loading)

Pipeline (`useStampImageGeneration.ts`):

1. Duplicate-click guard (`isGeneratingRef`). Empty prompt → toast.
2. `setIsGenerating(true)`, progress 0, **navigate to step 3 immediately**.
3. Fake progress +10 % / 400 ms, capped at 90 %.
4. Build reference file: data URL → `File`; remote URL → fetched blob; no upload → **1-byte placeholder PNG**.
5. **Deduct 1 coin** (`deduct_coin` RPC) *before* calling the model. RPC returns `false` → toast "coins deduct failed", progress reset, **user stays on step 3**.
6. `POST /api/generate-image` (multipart: image, prompt, `selectedStyle: "editorial"`, preservation, removeBackground) under a **90 s timeout**. Route requires a Supabase session (401 otherwise).
7. Success → progress 100, `addGeneratedResult` (newest first, max 20, de-duplicated by URL), `selectedImageUrl` + `enhancedPrompt` set, image saved to localStorage cache, `nextStep()` after 800 ms → step 4.
8. Failure / timeout → toast with the friendly message from the route (API key, moderation blocked, background removal, generic) or "timed out after 90 seconds". **User remains on the loading step**; only the back button leaves it. The coin is **not refunded**.

UI: spinner, "Generating Your Design…", "Est. 10 seconds…", progress bar. No mobile action.

Data: `profiles.coins` −1; analytics `stamp_generate_start`, `stamp_generate_complete` / `stamp_generate_failed`; localStorage `stamp:generated-images`.

#### S-04 · Results

| | |
|---|---|
| On mount | Loads localStorage cache into `generatedResults`; auto-selects the first result when nothing is selected. |
| Gallery | Shown only when > 1 result. Horizontal thumbnails, grayscale unless selected, gold check on the selected one (`aria-pressed`). Clicking sets `selectedImageUrl` + `enhancedPrompt`. |
| Hero image | Selected image; falls back to a hardcoded Unsplash URL if nothing is selected. |
| Actions | **USE THIS IMAGE** → step 5 (disabled without selection). **REPEAT** → `goToStep(2)` to generate another variant (each costs 1 coin). Mobile: REPEAT inline, primary in the footer. |

#### S-05 · Product selection

| | |
|---|---|
| Data | `useCatalogProductsWithSeo()`; blueprint 12 excluded. Price = `selling_price_cents` ?? `min_price + shipping` ?? €25 fallback. Variants (colours/sizes) for every product are prefetched on grid load. |
| Layout | Desktop: two labelled grids **Apparel** / **Accessories** (category detected from title keywords). Tablet: two disclosure sections (Apparel open). Mobile: single `ExpandablePicker` with count header. Loading = 4 skeletons; error = alert with hint; empty = status message. |
| Select | Card click sets `blueprintId`, `printProviderId`, title, description, `selectedPriceCents`. The grid collapses to a single `SelectedProductCard` with expandable spec bullets and a **Remove** button (clears all five fields and re-locks step 6). No auto-advance. |
| CTA | **CONTINUE TO CUSTOMIZATION**, disabled until a product is selected. |
| Data | analytics `select_item`. |

#### S-06 · Customization and placement

**Layout branch.** ≥768 px: controls left, preview right. <768 px: two sub-steps held in local state — **6a Customize** (colour, size, print positions) → *CONTINUE TO PREVIEW* → **6b Preview** (silhouette preview + adjuster) → *CREATE PRODUCT*.

**Derived state** (`useCustomizationData.ts`)

- Colours only for apparel/tote categories (`shouldShowColorSelection`), filtered to display colours (White/Black preference). One colour → auto-selected and swatches hidden. Zero colours (mug, socks, pillow, canvas, poster) → no colour requirement.
- Sizes from the variants API sorted by `SIZE_ORDER`, else fallback XS–XXL. Default size per product (One Size → 11oz → M/L/S/XL → middle poster size → first). Exactly one size → static label; several → dropdown.
- `canCreateProduct = !isFinalizing && product selected && colour requirement met && selectedImageUrl`.

**Print positions and placement** (`useDesignAdjustment.ts`, `src/lib/printPlacement/config.ts`)

| Product family | Positions | Selection mode | Adjustable | Defaults / constraints |
|---|---|---|---|---|
| Apparel (t-shirt, hoodie…) | front, back (+ sleeves/neck on some blueprints) | single | x, y, scale, rotation | centred, scale 1; picking *back* reorders mockups so the back image is first |
| Tote (standard) | front | single | x, y, scale, rotation | **scale 0.5** default |
| Tote AOP (1389), Pillow (229) | front | single | **scale only** (x/y/angle locked) | server forces final x/y |
| Mug (441, 468) | wrap | — | **no adjuster / preview**; server auto-places | `printPositions` omitted from payload |
| Socks (462, 496) | left, right | **multiple**, both enabled | none | calibrated per-leg placements |
| Canvas / Poster | front | single | x, y, scale, rotation | orientation parsed from the size string drives the preview ratio |

Adjuster controls: position select (when > 1 position and not scale-only), arrow buttons ±0.1 + fine x/y sliders bounded by the safe zone, "Center", scale −/+ 10 % and slider (0.1–1.5), rotation presets 0/90/180/270, **Reset** to defaults, and a "You've hit the edge of the safe print area" status when clamped. All disabled while finalizing. Placement is seeded once per blueprint; choosing another product resets it.

**Create product** CTA: **CREATE PRODUCT** / "CREATING…", disabled unless `canCreateProduct`. Payload built at click time (`useCustomizationHandlers.ts`): blueprint, provider, `image_url` (selected design), title/description from the enhanced prompt, user id + email, colour, size, `print_positions` (enabled positions with placement) unless auto-placement product.

Data: analytics `color_select`, `size_select`, `stamp_create_product`.

#### S-07 · Production (loading) — product creation pipeline

`useStampProductCreation.ts` → `CustomProductService.createCustomProduct` → edge functions.

1. Duplicate guard (`isCreatingRef`).
2. **Idempotency**: sessionStorage `stamp_product_{blueprint}_{provider}_{color}_{size}[_scaleN.NN]_completed === "true"` → toast "already created", `nextStep()` and stop.
3. Validation with recovery: no design → toast + `goToStep(2)`; no product → toast + `goToStep(5)`; no size → toast; no user → toast + `router.push("/auth/login")`.
4. Lock, `isFinalizing`, clear stale mockup, **go to step 7**, fake progress +10 % / 600 ms to 90 %.
5. Under a **120 s timeout**:
   - `upload-printify-image` (edge) → Printify image id + dimensions.
   - `create-custom-product` (edge): validates colour (Black/White enforcement for apparel), fetches variants, resolves print positions, filters variants by colour + size (first-allowed fallback), validates placement (x,y ∈ [0,1], 0 < scale ≤ 2), forces scale-only overrides, creates the Printify product, rewrites mockup URLs to `camera_label=front` when the design is on the front, resolves `selected_variant_id`.
   - Best-effort insert into our `products` table (`ProductService.savePrintifyProduct`); failure is logged and ignored.
6. Success → progress 100, sessionStorage flag set, `createdProductId`, `createdVariantId` (falls back to first variant with a warning), `mockupImages` (back-print image first when relevant), `mockupImageUrl`, `nextStep()` after 1.5 s → step 8.
7. Failure → progress 0, toast (timeout message or `CUSTOM_PRODUCT_CREATION_FAILED`), **back to step 6**.

UI: "Creating Your Product Mockup…", "Est. 15 seconds…", progress bar.

Data: Printify product; `products` row (`printify_product_id`, `blueprint_id`, `print_provider_id`, `user_id`, `print_areas`).

#### S-08 · Final review and add to bag

| | |
|---|---|
| Content | Desktop: `MockupCarousel` (prev/next, dots ≤10 images else counter, fullscreen modal with keyboard nav). Mobile: `PolaroidPreview`. Right: title "Ready to Wear", product name, "Color: X · Size: Y", description, total price. |
| **S-08a Bag it** | **BAG IT** → `handleAddToCart()`: duplicate guard; sessionStorage `stamp_cart_{product}_{variant}` already `"true"` → toast "already in cart" + `router.push("/cart")`. Else `useAddToCart` → `upsert_cart_item` RPC (`product_id`, `variant_id`, `quantity 1`, `product_name`, `unit_price = selectedPriceCents ?? 1999`, `custom_image_url = mockup ?? design`). Success → flag, toast, **redirect to `/cart`**. |
| **S-08b Bag it & create another** | Same add-to-cart, then `resetForNewProduct()`: keeps design, prompt and results; clears product, colour/size/price, placement, created product; **jumps to step 5**. |
| Data | `carts` (get-or-create for `user_id`), `cart_items` upsert (quantities merge on same product+variant+image), analytics `add_to_cart`. |

⚠ Note: `handleAddToCart(true)` ("Buy now" → `/checkout`) exists but no button calls it.

### 3.3 Gating summary

| Condition | Where enforced | Effect |
|---|---|---|
| Guest visits `/stamp` | middleware | 307 → `/` |
| Guest on step 2 (auth resolved client-side) | `SynthesisForm` | Login overlay |
| 0 coins | `SynthesisForm` | No-coins overlay with skip options |
| Coin cost | `useStampImageGeneration` | 1 coin per attempt, deducted before generation, never refunded |
| Guest at product creation | `useStampProductCreation` | Redirect `/auth/login` (route does not exist — see §7) |
| Buy more coins | — | **Not reachable from /stamp**; only from the dashboard credits card |

### 3.4 Category-specific behaviour worth testing

- Colour swatches hidden for mug/socks/pillow/canvas/poster.
- Mug: no preview, no adjuster, payload without positions.
- Socks: two positions both enabled; "multiple" mode.
- Tote: default scale 0.5; AOP tote scale-only.
- Back print on apparel: mockup order changes.
- Canvas/poster: orientation from size string.

### 3.5 Persistence and resume

| Storage | Key | Content | Lifetime |
|---|---|---|---|
| Zustand (memory) | — | whole flow | until unmount/reload |
| localStorage | `stamp:generated-images` | up to 20 generated `{imageUrl, enhancedPrompt, createdAt}` | 24 h, pruned lazily |
| sessionStorage | `stamp_product_*_completed` | product-creation idempotency | tab |
| sessionStorage | `stamp_cart_{product}_{variant}` | add-to-cart idempotency | tab |

On reload the user lands on the hero; cached images make "Proceed with previous photos" available on step 1 and 2.

### 3.6 Stamp edge cases

| Case | Behaviour |
|---|---|
| Generation timeout (90 s) | Toast; user stays on step 3; coin spent. |
| Coin RPC returns `false` | Toast; user stays on step 3. |
| Product creation timeout (120 s) | Toast; back to step 6. |
| Create the identical product twice (same key) | Toast "already created" then `nextStep()` → lands on step 7 with progress 100 and **nothing advances to step 8** (must use back). Changing scale ≥ 0.01 creates a new key. |
| Bag the same product twice | Toast "already in cart" + redirect `/cart` (no duplicate row). |
| Remote reference image fetch fails | Generic error toast after the coin was deducted. |
| Prompt-only generation | 1-byte placeholder image is sent; downstream processing may fail with a generic error. |
| Remove selected product on step 5 | Step 6 re-locks; "Continue" disabled. |

---

## 4. Cart flows (/cart)

Source: `src/features/cart/**`, `src/queries/cartQueries.ts`, `src/services/cartService.ts`.

### 4.1 Loading and states

| Scenario | Behaviour |
|---|---|
| **C-01 Guest** | `ProtectedRoute` → redirect `/` (no message, no return URL). Guest carts exist in the DB (session id in localStorage `guest_session_id`) but are never merged on login. |
| **C-02 Load** | `getOrCreateCart(userId)` then `getCart(id)` selecting `carts` + `cart_items` (no product/variant join). `staleTime 0`, refetch on mount, no refetch on focus. Skeleton with 3 shimmer rows while loading. |
| **C-03 Empty** | "Your bag's empty" + **Start Creating** → `/stamp`. No summary, no mobile CTA. |
| **C-04 Error** | Toast via `handleError`; page falls through to the **empty state** (no error UI, no retry). |
| **C-05 View** | Header "Shopping bag", selection header, item cards, sticky order summary (desktop) or fixed bottom CTA (mobile). analytics `view_cart` once per mount. |

### 4.2 Item actions

| Scenario | Trigger | Validation | Result / Data |
|---|---|---|---|
| **C-10 Increase quantity** | `+` stepper | max 99 (UI disables at bound; Zod `int().min(1).max(99)`) | `cart_items.quantity` update → refetch. No optimistic update, no stock check. |
| **C-11 Decrease quantity** | `−` stepper | min 1 | same |
| **C-12 Remove** | Trash button | none, no confirmation, no undo | `cart_items` delete → refetch; analytics `remove_from_cart` (fired before the request). Removing the last item → empty state. |
| **C-13 Select / deselect item** | Custom checkbox on the card | — | Local `Set<string>`; selected card gets gold border. |
| **C-14 Select all / deselect all** | Master checkbox (supports indeterminate) or text button | — | Local state. |
| **C-15 Continue browsing** | Link under the list | — | `/stamp` |

Card content: mockup image (160 px, `ShoppingBag` fallback only for an empty URL), product name (`product_name` → "Custom Product"), unit price, Variant / Color / Line total grid.

⚠ Notes: Variant and Color always render "Standard" because the query does not join variants and ignores `cart_items.variant_name`. "Deselect all" cannot stick: an effect re-selects everything whenever the selection becomes empty (see §7).

### 4.3 Order summary

| Row | Rule |
|---|---|
| Subtotal | Σ `unit_price × quantity` over **selected** items |
| Shipping | `0` ("Free") when subtotal ≥ 6000 cents, else 499 |
| Total | subtotal + shipping (no tax, no discount on this page) |
| Nothing selected | "Select items from your bag to proceed to checkout" and CTA disabled (unreachable in practice, see note above) |
| Footer | "Estimated Arrival · 5–8 Business Days", payment icons |

### 4.4 Proceed to checkout

**C-20 Checkout**

1. Preconditions: ≥ 1 selected item (`canCheckout`).
2. Desktop CTA **Proceed to Checkout** (in summary) or mobile fixed bar **Checkout · €{total}**.
3. `update_cart_items_selection(cartId, selectedIds)` RPC persists `cart_items.is_selected` (all false, then true for the chosen ids).
4. analytics `begin_checkout` (selected items, subtotal + shipping).
5. `router.push("/checkout?cartId={cart.id}")`. **Only the cart id travels in the URL**; selection travels through the DB flag.

Failure of step 3 → toast and no navigation.

### 4.5 Cart edge cases

| Case | Behaviour |
|---|---|
| Add same product+variant+image again from `/stamp` | `upsert_cart_item` merges quantities server-side. |
| Reload or return from checkout | Selection resets to "all selected"; `is_selected` flags are not read back. |
| Concurrent tabs | No realtime, no focus refetch; last write wins. |
| Post-purchase | Return pages call `clearCart`, which deletes **all** items of the cart, including unselected ones. |
| Two `carts` rows for one user | `maybeSingle()` errors → toast + empty state. |

---

## 5. Checkout and payment flows (/checkout)

Source: `src/features/checkout/**`, `src/app/checkout/**`, edge functions under `supabase/functions/`.

### 5.1 Entry

| Scenario | Behaviour |
|---|---|
| **K-01 Guest** | Skeleton then redirect `/`. No guest checkout. |
| **K-02 Load** | `cartId` from the query string → `useCartById` (refetch on focus). Items filtered to `is_selected !== false`; if none match, **the whole cart is used**. |
| **K-03 Cart not found** | No `cartId`, unknown id, RLS denial or network error → "Cart Not Found" alert with **Back to Cart**. |
| **K-04 Form** | Layout 7/5: left = Test-mode toggle, Billing address, "Ship to a different address" toggle, Shipping address (conditional), Payment method. Right = sticky summary: items, promo code, price breakdown, pay button. |

⚠ Note: an existing but empty cart renders the form with total €4.99 and enabled pay buttons.

### 5.2 Address form

- React Hook Form + Zod, `mode: "onChange"`; the pay button is enabled only when the form is valid and total > 0.
- **Billing** is always collected. Checking **Ship to a different address** reveals a second, identical address block; the shipping address used is `shipping` when the toggle is on, else `billing`.
- Fields: first name*, last name, email* (valid), phone, address 1*, address 2, city*, region, zip*, country* (one of 91 ISO-2 codes in a select). Errors render inline with `role="alert"`.
- Default values are the hardcoded `TEST_BILLING_DATA` (Amsterdam address) in **all environments**. There is no profile-address prefill.

### 5.3 Pricing and promo codes

```
subtotal   = Σ unit_price × quantity / 100
discount   = appliedPromo.discountValue (0 when none)
shipping   = (subtotal − discount) ≥ 60 ? 0 : 4.99
total      = subtotal + shipping − discount
```

**K-10 Apply promo code**

1. Input force-uppercases; Enter or **Apply** submits; empty → "Please enter a promo code".
2. `POST /api/validate-promocode {code, subtotal}` → looks up `promocodes` by code.
3. Valid → green pill with the code and an × remove button; Discount row appears (`−€x.xx`). `percentage` → `subtotal × value / 100`; `numeric` → fixed `value`; clamped to `[0, subtotal]`.
4. Invalid → inline alert "Invalid promo code." Server error → "Failed to validate promo code".
5. **Remove** clears the pill and the discount.

No expiry, minimum order, or usage limits exist in the `promocodes` table, so those failure cases do not exist. ⚠ The discount is not persisted on the order (`discount_amount` is always 0).

### 5.4 Payment method selection

Radio group with three options: **Credit Card** (Stripe `CardElement`, or a test-card selector when Test Mode is on), **PayPal** ("We'll send you to PayPal…"), **iDEAL** ("We'll send you to your bank…"). Apple Pay / Google Pay are not offered.

**Test Mode** (always visible): replaces the card element with predefined Stripe payment-method tokens — successful (visa, visa debit, mastercard, amex, discover), declined (generic, insufficient funds, expired, processing error) and 3-D Secure. Affects Stripe only.

### 5.5 Stripe card — K-20

Happy path:

1. **Pay €{total}** → `usePaymentForm.processPayment`: guards Stripe/Elements readiness, `loading` on.
2. `create-payment-intent` (edge, authenticated): `{amount, currency: "eur", line_items, shipping_address}` (+ `payment_method`, `confirm: true` in test mode). Creates the PaymentIntent with metadata (user, line items, address) and a `payment_transactions` row `status: "pending"`.
3. Test mode → success is assumed from the confirmed intent. Live mode → `stripe.confirmCardPayment(clientSecret, {card, billing_details})`; 3-DS is handled by Stripe; status must be `succeeded`.
4. Save `localStorage["stripe_checkout_data"] = {paymentIntentId, amount, lineItems, shippingAddress, cartId, timestamp}`; analytics `purchase`.
5. `router.push("/checkout/stripe-return?payment_intent=…&payment_intent_client_secret=…")`.

Non-success intent statuses map to fixed messages (processing, requires payment method, requires action, canceled, unknown). Card errors show inline under the button.

⚠ Notes: the edge function multiplies the cents amount by 100 again (100× overcharge vs PayPal/iDEAL); the live `CardElement` is mounted in a different `<Elements>` tree than the one that confirms, so live card payments currently fail with "We couldn't load the card form" — Test Mode is the working path. See §7.

### 5.6 PayPal — K-30

1. **Confirm Order • Pay with PayPal** → `create-paypal-order` (edge): validates zip + country, creates a PayPal order (`CAPTURE`, `PAY_NOW`, provided shipping address), `payment_transactions` row pending; return URL `/checkout/paypal-return`, cancel URL `/checkout`.
2. Checkout data saved to `localStorage["paypal_checkout_data"]` (1 h TTL); browser redirected to PayPal.
3. Approve at PayPal → `/checkout/paypal-return?token={orderId}&PayerID={payerId}`.
4. Return page calls `POST /api/paypal/capture-order {orderId, payerId}` → captures, then `atomic_paypal_payment_capture` RPC (payment + order columns), returns `{captureId, status, payerEmail}`.
5. Order pipeline (5.9) with `payment_method: "paypal"`.

Cancel at PayPal → `/checkout` **without cartId** → Cart Not Found. Capture failures return HTTP 422 with `isRetryable`: `INSTRUMENT_DECLINED` / retryable → **failed** screen; otherwise → **error** screen.

### 5.7 iDEAL (Mollie) — K-40

1. **Confirm Order • Pay with iDEAL** → `create-mollie-payment` (edge): amount in EUR, `method: "ideal"`, redirect URL `/checkout/mollie-return`, webhook omitted on localhost; `payment_transactions` row pending.
2. Five sessionStorage keys saved (`mollie_payment_id`, `mollie_line_items`, `mollie_shipping_address`, `mollie_cart_id`, `mollie_order_amount`); browser redirected to Mollie's hosted page (test mode offers a status picker).
3. Back on `/checkout/mollie-return` (no query params from Mollie): payment id from `?payment_id` → sessionStorage → **DB recovery** (`get_pending_payment_recoveries`).
4. Payment recorded for recovery as `pending`; `verify-mollie-payment` (edge, 3 retries with backoff) upserts the transaction and returns the status.
5. `paid` → order pipeline (5.9) with `payment_method: "mollie"` **plus client-side invoice generation** (`generate-invoice`). `failed | canceled | expired` → failed screen. `open | pending | authorized` → pending screen (session data kept). Unknown → error screen.

### 5.8 Return-page state machines

| Page | States | Success screen | Retry target |
|---|---|---|---|
| Stripe | loading → processing → success / error | `PaymentSuccess` "Order Confirmed", order number or `#ST-xxxxxx`, "Paid via Stripe", 7–10 business days | `/checkout` (no cartId) |
| PayPal | loading → capturing → success / failed / cancelled / error | same, `#PP-xxxxxx`, "Paid via PayPal" | `/checkout` (no cartId) |
| Mollie | loading → success / failed / pending / error | same, `#ML-xxxxxx`, "Paid via Mollie" | `/checkout?cartId=` (preserved) or `/cart` |

Success actions: **Track Your Order** → `/orders`; **Create Another Order** → `/stamp`; Trustpilot CTA. Failure screens (`PaymentError`): Retry Payment, Cancel & Go to Dashboard, alternative method buttons (all route to retry), "Contact Support" → `/profile`. Error screens: Return to Checkout, Go to Dashboard.

### 5.9 Post-payment order pipeline (all providers)

Runs client-side on the return page, once per payment (`hasProcessed` ref + sessionStorage locks `{provider}_finalizing_{id}` / `{provider}_finalized_{id}`), under a **120 s timeout**:

| Stage | Action | Data | On failure |
|---|---|---|---|
| 0 | Guards: payment id present, stored checkout data (Stripe 30 min / PayPal 1 h / Mollie session or DB), user logged in, `cartId` present | — | error screen with support message including the payment id |
| 0b | `record_payment_for_recovery` (cart snapshot, line items, address) | `payment_recovery` | logged only |
| 0c | `getOrderByIdempotencyKey("{provider}_{paymentId}")` — existing order → success immediately | `orders` | fails closed (throws) |
| 1 | `createOrderFromCart`: `orders` row (`order_number ORD-{ts}-{rnd}`, `status confirmed`, `payment_status paid`, `payment_method`, `currency EUR`, addresses, `idempotency_key`) + bulk `order_items`; `linkPaymentTransactionToOrder` | `orders`, `order_items`, `payment_transactions.order_id` | refund → "Order creation failed. A full refund has been initiated." |
| 2 | `create-printify-order` (edge) with validated line items, `is_test: false`; persist `printify_order_id`; status history | Printify order, `orders.printify_order_id`, `order_status_history` | `status → unsuccessful_confirmation`, refund → "Order fulfillment failed. A full refund has been initiated." |
| 3 | `mark_payment_recovered` | `payment_recovery` | logged |
| 4 | Mollie only: `generate-invoice` (non-blocking) | `invoices`, storage bucket `invoices`, email | logged |
| 5 | `clearCart` (non-blocking) | `cart_items` deleted | logged |

Invoices for Stripe and PayPal are generated by the provider webhooks (`stripe-webhook`, `paypal-webhook`, `capture-paypal-order`), which poll for the order by idempotency key for up to 30 s, then set `payment_status` and issue the invoice (gapless `INV-YYYY-NNNNN`, PDF in the private `invoices` bucket, emailed once). Webhooks never change `orders.status`.

Refunds go through `process-refund` (idempotent per order, atomic RPC `process_refund_atomic` updating `payment_transactions`, `orders`, `invoices`, `refunds`), with 3 client retries and a `refund_failures` alert when all fail.

### 5.10 Payment recovery (dashboard)

`PaymentRecoveryBanner` is rendered on `/dashboard` only. It lists `payment_recovery` rows from the last 24 h that are not recovered: "Incomplete Order Found — successful {provider} payment for {amount}". **Complete Order** → `process-payment-recovery` (edge) recreates the order + Printify order idempotently; **Dismiss** sets `recovery_status = cancelled`.

### 5.11 Checkout edge cases

| Case | Behaviour |
|---|---|
| Refresh while the pipeline runs | Lock found → page stays on the spinner with no CTA until the tab is closed; recover via dashboard banner. |
| Double click pay | Stripe: `loading` disables the button; PayPal/iDEAL: `isPending` guard. Server: `idempotency_key` prevents duplicate orders. |
| Back to checkout after failure (Stripe/PayPal) | `/checkout` without `cartId` → Cart Not Found. |
| Expired stored checkout data | "Checkout data expired or not found. Please try again from the checkout page." |
| Session expired at return | "You must be logged in to complete your order…" (PayPal capture returns 401). |
| Webhook before client pipeline | Webhook polls 30 s for the order, then links payment and invoices. |
| Partial cart checkout | Only selected items are ordered, but `clearCart` deletes every item. |
| Order totals | `orders.subtotal/total_amount` exclude shipping and discount (tax 0). |

---

## 6. Secondary flows

### 6.1 Authentication (A-xx)

| ID | Flow | Steps | Result |
|---|---|---|---|
| A-01 | Login (email) | Header **Login** → dialog → email + password (min 6) → reCAPTCHA v3 token (skipped when no site key) → `signInWithPassword` | Toast "Welcome back", coins cache invalidated, **redirect `/stamp`**. Errors inline + toast. |
| A-02 | Login (Google) | Google button → `signInWithOAuth` with `redirectTo /auth/callback?next=/stamp` → `/auth/callback` exchanges the code | Redirect `/stamp`. Failure → `/auth/auth-code-error`. |
| A-03 | Register | Header **Register** → first/last name, email, password + confirm → `signUp` with metadata | In-dialog success "Check your email to verify"; user is **not** signed in. No captcha, no resend option. |
| A-04 | Forgot password | Inside login dialog → "Forgot password?" → email → `resetPasswordForEmail` (redirect `/auth/callback?next=/reset-password&type=recovery`) | Toast "Password reset email sent". |
| A-05 | Reset password | Email link → callback → `/reset-password` → new password + confirm → `updateUser` | Success screen, redirect `/` after 3 s. Missing session → "This link won't work". |
| A-06 | Logout | Header **Logout** | Cache cleared, toast, redirect `/`. |

### 6.2 Homepage and catalog (H-xx)

- **H-01** Every homepage CTA (hero, product cards, product of the month, promos, process timeline, bottom CTA) leads to `/stamp`; "View full catalog" → `/catalog`; FAQ contact → `mailto:`.
- **H-02 Catalog**: browse mode (two group showcase cards) ↔ results mode (group filter, search, sort, per-group sections with anchors, empty-results with clear filters). Product card → quick-view dialog (gallery, price with strike-through when on sale, colours, specs) → single CTA **/stamp**. Filters are not persisted in the URL.

### 6.3 Dashboard (D-xx)

- **D-01** Load: profile card (avatar, verified badge, **Edit profile** → `/profile`), credits card (**Buy more** → BuyCreditsDialog), quick access (`/profile`, `/orders`), metrics, CTA → `/stamp`, recent orders (5) opening the shared order-details modal, **View archive** → `/orders`.
- **D-02** Payment recovery banner (see 5.10).
- Error → card with **Retry**.

### 6.4 Orders (O-xx)

| ID | Flow | Behaviour |
|---|---|---|
| O-01 | List | `orders` + `order_items` for the user, newest first, polled every 60 s and on focus. Filters: status (All / Delivered / Shipped / Processing / Cancelled), time (30 d / 90 d / 2023 / all), list ↔ grid, 10 per page, removable filter pills. Empty → CTA `/stamp`. |
| O-02 | Details | Modal: status badge, order number, items, delivery block, tracking link, order info grid, status timeline (`order_status_history`), totals sidebar. |
| O-03 | Track shipment | Button only when `tracking_url` exists → new tab. |
| O-04 | Cancel | Allowed for `created / pending / confirmed`. Confirm modal → `cancel-order` (edge) → Printify cancel + refund → toast composed from results; `orders.status = cancelled`. |
| O-05 | Reorder | Non-cancellable orders → button pushes `/stamp` (does not re-add to cart). |
| O-06 | Invoice | In the details modal when `payment_status === "paid"`: signed URL for the existing PDF, or `generate-invoice` on demand → opens in a new tab. |

Display statuses: Processing, Preparing, In production, Shipped, Delivered, Cancelled, Needs attention (mapped from `orders.status` and `printify_status`).

### 6.5 Profile (P-xx)

- **P-01** Edit first/last name (email read-only) → `updateUser` metadata → toast.
- **P-02** Change password (new + confirm, min 6, no current-password check) → `updateUser`.
- **P-03** Single shipping address (same schema as checkout) stored in `user_metadata.shipping_address` → toast. Not used by checkout for prefill.
- No delete-account, avatar, or email-change flows exist.

### 6.6 Buy credits (B-xx)

- **B-01** Dashboard **Buy more** → step 1: packages 100/€9.99, 250/€19.99 (default, "popular"), 500/€34.99, 1000/€59.99, or custom amount (≥ 10 credits at €0.10 each) → **Continue**.
- **B-02** Step 2: method (card default; PayPal is a "coming soon" placeholder; iDEAL excluded) → Stripe `CardElement` → `create-credit-payment` (edge, enforces ≥ 10 credits) → `confirmCardPayment` → dialog closes on `succeeded`.
- **B-03** Balance update happens asynchronously in `stripe-webhook` (`payment_intent.succeeded` with `metadata.type = credit_purchase`) → `user_credits` + `credit_transactions`. The stamp page reads coins from `profiles.coins` via `get_user_coins` instead (see §7).

### 6.7 Legal / FAQ / errors

Static pages rendered from the message catalog with a shared `LegalDocument` renderer; FAQ uses native `<details>` accordions and a `mailto:` support CTA. 404 page has no navigation; global error page offers Try Again / Go to Homepage and shows a Sentry digest.

---

## 7. Known gaps and defects found while mapping

These were observed in the code while writing this document. They are listed so the spec and the implementation can be reconciled; none have been changed here.

| Area | Finding | Where |
|---|---|---|
| Stamp | `router.push("/auth/login")` on product creation without a user — the route does not exist (auth is modal only). | `useStampProductCreation.ts` |
| Stamp | Re-creating an identical product lands on step 7 with no advance to step 8. | `useStampProductCreation.ts` idempotency branch |
| Stamp | Generation/coin errors leave the user on the loading step; coin is never refunded. | `useStampImageGeneration.ts` |
| Stamp | `selectedProductType` is never set; step 8 heading is always "Ready to Wear". | `stampFlowStore.ts` / `FinalReviewSection.tsx` |
| Stamp | Mobile footer uses `t("common.loading")` under the `stamp` namespace → missing translation. | `MobileStepFooter.tsx` |
| Stamp | Suggestion cards are cosmetic. | `SynthesisSection.tsx` |
| Cart | "Deselect all" cannot stick: `allCartItemIds` is rebuilt every render and the auto-select effect refires. | `useCart.ts` |
| Cart | `is_selected` is written but never read back on reload. | `useCart.ts` |
| Cart | Variant/Color always "Standard" (no variant join; `variant_name` ignored). | `cartService.getCart`, `CartItemCardContent.tsx` |
| Cart | Fetch errors render as an empty cart; toast fired during render. | `useCart.ts` |
| Cart | Guest carts are never merged on login; `mergeCart` / `clearSessionId` have no callers; local-cart layer is dead code. | `cartService.ts`, `guestProductStorageService.ts` |
| Cart | `update_cart_items_selection` is `SECURITY DEFINER` without an ownership check on `p_cart_id`. | migration `20260810000000` |
| Cart | Post-payment `clearCart` deletes unselected items. | `cartService.clearCart` |
| Cart | Hardcoded English in summary footer/total while i18n keys exist; analytics send `currency: "USD"`. | `CartOrderSummaryFooter.tsx` |
| Checkout | Stripe amount is multiplied by 100 twice (client sends cents, edge function multiplies again). | `create-payment-intent/index.ts` |
| Checkout | Live `CardElement` lives in a different `<Elements>` tree than the confirming hook → "couldn't load the card form"; only Test Mode works. | `CheckoutStripeCardForm.tsx`, `CheckoutSummarySection.tsx` |
| Checkout | Test-mode 3-DS intent is treated as success without checking status. | `usePaymentForm.ts` |
| Checkout | Billing form defaults to hardcoded test data in every environment. | `CheckoutFormContext.tsx` |
| Checkout | Empty existing cart is payable (€4.99). | `CheckoutSummarySection.tsx` |
| Checkout | Promo discount never persisted (`discount_amount = 0`); order totals exclude shipping/discount. | `orderService.ts`, `orderServiceMapper.ts` |
| Checkout | Stripe/PayPal retry and PayPal cancel go to `/checkout` without `cartId` → Cart Not Found. | return clients, `create-paypal-order` |
| Checkout | Refresh during the pipeline → infinite spinner (lock without status). | all return clients |
| Checkout | Stripe stored data has no `billing` key; `billing_address` always equals shipping. | `CheckoutStripeButton.tsx` |
| Checkout | No order-confirmation email; success page never shows the email line. | `PaymentSuccess.tsx` |
| Checkout | `process-payment-recovery` has no auth check and reads `item.price` (never written). | edge function |
| Auth | No return-to-intended-page after login; Google `next` hardcoded to `/stamp`. | `authQueries.ts`, `authService.ts` |
| Auth | `/auth/auth-code-error` links to `/auth/reset` (404). | `auth-code-error/page.tsx` |
| Homepage | Bottom CTA links to `/products` (404); hero "free credits" link dispatches an event nobody listens to. | `HomeCtaSection.tsx`, `HeroContent.tsx` |
| Dashboard | Credits and designs figures are hardcoded placeholders; recovery success pushes `/orders/{id}` (404). | `constants/dashboard.ts`, `DashboardContent.tsx` |
| Credits | Webhook credits `user_credits`; the app reads `profiles.coins` — a purchase never changes the visible balance. No refetch after purchase. | `stripe-webhook`, `coinsService.ts` |
| Privacy | GA4 loads with no consent gate. | `layout.tsx` |
| Tests | Several e2e specs encode stale UI (art-style selector, Buy Now button, `/auth/login` routes, `cart-count` badge, `orders.status === "completed"`, unprefixed form field names). | `src/tests/e2e/*`, `src/features/stamp/__tests__/*` |

---

## Appendix A — Browser storage keys

| Key | Type | Owner | Purpose / TTL |
|---|---|---|---|
| `stamp:generated-images` | localStorage | stamp | generated designs cache, 24 h, max 20 |
| `stamp_product_{bp}_{pp}_{color}_{size}[_scaleX]_completed` | sessionStorage | stamp | product creation idempotency |
| `stamp_cart_{productId}_{variantId}` | sessionStorage | stamp | add-to-cart idempotency |
| `guest_session_id` | localStorage | cart | guest cart session id (unused after login) |
| `stripe_checkout_data` | localStorage | checkout | intent id, amount, items, address, cartId — 30 min |
| `paypal_checkout_data` | localStorage | checkout | same for PayPal — 1 h |
| `mollie_payment_id`, `mollie_line_items`, `mollie_shipping_address`, `mollie_cart_id`, `mollie_order_amount` | sessionStorage | checkout | Mollie return context |
| `stripe_finalizing_{pi}` / `stripe_finalized_{pi}` (and `paypal_*`, `mollie_*`) | sessionStorage | return pages | pipeline lock / done flag |

## Appendix B — Analytics events by flow

| Flow | Events |
|---|---|
| Navigation | `page_view` (every route), `step_change` (every stamp step change) |
| Auth | `login {method}`, `sign_up {method: email}`, `logout` |
| Stamp | `stamp_image_upload`, `stamp_generate_start`, `stamp_generate_complete`, `stamp_generate_failed`, `select_item`, `color_select`, `size_select`, `stamp_create_product`, `add_to_cart` |
| Cart | `view_cart`, `remove_from_cart`, `begin_checkout` |
| Checkout | `add_payment_info` (live Stripe only), `purchase` (Stripe only) |

Dashboard, orders, profile, catalog and buy-credits are not instrumented.
