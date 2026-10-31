# Guest stamp and checkout

- **Status**: Planned
- **Date**: 2026-10-31
- **Slice**: `src/features/stamp`, `src/features/cart`, `src/features/checkout`, `src/features/auth`
- **Routes**: `/stamp` (`src/app/stamp/page.tsx`), `/cart` (`src/app/cart/page.tsx`), `/checkout` and its return pages (`src/app/checkout/**`)

## Goal

A logged-out visitor can open the Stamp studio, design a product, keep it in a cart stored in the browser and pay for it, without creating an account. Only the prompt edit (AI generation, `SynthesisSection`) still needs a real account. Today the middleware sends every guest who clicks Stamp to a login prompt, which loses buyers who only want to upload their own image.

## Acceptance criteria

- [ ] A logged-out visitor who clicks Stamp lands on `/stamp` with no login prompt, and can upload, pick a product, customise and add it to the cart.
- [ ] The prompt edit section shows the existing login overlay to guests, including guests with an anonymous session, and `/api/generate-image` returns 401 for both.
- [ ] Guest cart items are stored in localStorage, shown on `/cart` and in the `/checkout` order summary, and survive a reload.
- [ ] Starting a payment (Stripe, PayPal or Mollie) first writes the local cart to a database cart owned by the guest's anonymous user and clears the local cart. The existing payment flow then runs unchanged, and the confirmation and invoice email go to the email entered at checkout.

## Out of scope

- Moving guest orders into an account that already exists. Only the cart moves, see step 9.
- A page where guests can track orders. They get the confirmation email and invoice only.
- Deleting stale anonymous users.
- Coins or credits for guests. `/dashboard` and buy-credits stay login-only.

## Decisions

| Question | Decision | Source |
| -------- | -------- | -------- |
| Guest identity on the server | Supabase anonymous sign-in (`enable_anonymous_sign_ins = true`). The guest gets a real `auth.uid()` with `is_anonymous = true`, so RLS, `requireUser` (`supabase/functions/_shared/authGuard.ts`) and the payment functions work unchanged. Session-id guest carts stay removed (`20261012000000_close_launch_authorization_gaps.sql`) | User |
| When the anonymous session starts | Lazily, just before the first server call that needs an identity. In this code that is product creation (`useStampProductCreation` → `CustomProductService` → `upload-printify-image` and `create-custom-product`). The image upload step stays client-only, so visitors who only browse or upload create no auth user | User (made concrete from the code) |
| Anonymous sign-in rate limit | Keep `anonymous_users = 30` per hour per IP in `supabase/config.toml`, and use the same value on the hosted project | User |
| Where the cart lives before payment | localStorage, using the existing but unused local-cart methods of `GuestProductStorageService` (`addLocalCartItem`, `getLocalCartItems`, …) | User |
| When the database cart is created | When the guest clicks a payment button: create the cart under the anonymous uid, insert the items, clear localStorage, then call the existing `PaymentService` with the new `cartId` | User |
| "Logged in" for the UI and gates | A user counts as registered only when `user && !user.is_anonymous`. Anonymous users are treated as logged out by the header, the prompt section, `ProtectedRoute` and the middleware for `/orders`, `/profile` and `/dashboard` | Code |
| Guest email | A required email field in `CheckoutAddressForm`, shown only to non-registered users and saved as the order's `customer_email` | User |
| Guest logs in with a local cart | Local items are moved into the user's database cart and the local cart is cleared | User |
| Ownership after login | `resolveProductBlueprint` in `supabase/functions/_shared/checkoutPricing.ts` rejects a product owned by another user. A guest's products belong to the anonymous uid, so logging in must move `products.user_id` and `printify_image_owners.user_id` from the anonymous uid to the new uid (step 9) | Code |
| Indexing | `/stamp` keeps its current metadata. `/cart` and `/checkout` stay as they are now | Code |
| Edge function limits for guests | A guest can get a new anonymous uid on every sign-in, so the existing per-user `enforceOperationLimit` calls are not enough. Anonymous callers get a tighter per-user limit plus a per-IP limit shared by all anonymous users on that IP. Registered users keep today's limits. Values (proposed, adjust before step 2): `image-upload` 20/min per user and 60/hour per IP (registered: 60/min). `product-create` 5/min per user and 30/hour per IP (registered: 20/min). `payment-create`, shared by the 3 payment functions, 10/min per user and 30/hour per IP (registered: 30/min). `claim-guest-products` 5/min per caller | User (values proposed) |
| Google login from a guest session | Use `supabase.auth.linkIdentity({ provider: "google" })` so the anonymous uid becomes the Google account, and its products and cart stay owned without a claim. If Supabase returns `identity_already_exists` (that Google account already belongs to a user), fall back to the normal Google sign-in followed by claim-and-merge, keeping the anonymous access token in sessionStorage across the OAuth redirect | User |
| Registering from a guest session | Keep `signUp` (no in-place conversion), so register and email login both use claim-and-merge | User |
| Analytics | New events `guest_add_to_cart`, `guest_checkout_started`, `guest_payment_started` | User |

## Files

| File | Change |
| ---- | ------ |
| `supabase/config.toml` | `enable_anonymous_sign_ins = true` and `enable_manual_linking = true` (needed by `linkIdentity`). The hosted project needs both settings in the dashboard |
| `supabase/migrations/<timestamp>_anonymous_operation_limits.sql` (new) | `consume_operation_limit_key(p_key TEXT, p_operation TEXT, p_limit INTEGER, p_seconds INTEGER)`, the same as `consume_operation_limit` but keyed by text so it can count per IP (key `ip:<sha256 of IP>`, never the raw IP). Grant to `service_role` only |
| `supabase/functions/_shared/authGuard.ts` | `AuthedUser` gains `isAnonymous: boolean`. Add `clientIp(req: Request): string` from `x-forwarded-for` (first entry) |
| `supabase/functions/_shared/operationLimit.ts` | `enforceCallerLimits(caller, req, operation, limits: { user: LimitT; anonymousUser: LimitT; anonymousIp: LimitT })`, with `LimitT = { limit: number; seconds: number }` |
| `supabase/functions/{upload-printify-image,create-custom-product,create-payment-intent,create-paypal-order,create-mollie-payment}/index.ts` | Replace `enforceOperationLimit` with `enforceCallerLimits` |
| `src/shared/helpers/authIdentity.ts` (new) | `isRegisteredUser(user: User \| null \| undefined): boolean` |
| `src/shared/queries/authQueries.ts` | `useIsAuthenticated` uses `isRegisteredUser`. Add `useEnsureGuestSession()`, which returns the current session or calls `signInAnonymously()` |
| `src/middleware.ts` | Remove `/stamp`, `/cart` and `/checkout` from `PROTECTED_PREFIXES`. The remaining prefixes treat anonymous users as logged out |
| `src/app/cart/CartPageClient.tsx`, `src/app/checkout/CheckoutPageClient.tsx` | Drop `ProtectedRoute` |
| `src/features/auth/ProtectedRoute.tsx` | Treat anonymous users as logged out |
| `src/app/api/generate-image/route.ts` | Return 401 when `user.is_anonymous` |
| `src/features/stamp/ui/sections/SynthesisSection/SynthesisSection.tsx` | `isAuthenticated = isRegisteredUser(user)` |
| `src/features/stamp/ui/components/StampHeader.tsx` | Show "Sign in" for anonymous users |
| `src/features/stamp/lib/hooks/useStampProductCreation.ts` | Replace the `notLoggedIn` redirect with `useEnsureGuestSession()`. Send `customer_email: ""` for guests |
| `src/features/stamp/lib/hooks/useStampCartActions.ts` | Guests: add to the local cart instead of `useAddToCart` |
| `src/shared/services/localCartStorageService.ts` (new) | The local-cart part of `GuestProductStorageService`, moved here so `cart`, `checkout` and `src/shared/queries` can use it without crossing slice boundaries. Delete the unused `GuestProduct` and session-id methods along with the old file |
| `src/features/checkout/lib/services/guestProductStorageService.ts` | Deleted once callers have moved |
| `src/shared/queries/cartQueries.ts` | `useCart` returns the local cart for non-registered users, mapped to `CartWithItems`. Update and remove mutations work on local items. Drop the `session_id` branch |
| `src/shared/mappers/localCartMapper.ts` (new) | `LocalCartItem[]` → `CartWithItems`, and `LocalCartItem[]` → the payload the database cart insert needs |
| `src/shared/services/cartService.ts` | `createCartFromLocalItems(userId, items): Promise<CartWithItems>` |
| `src/features/checkout/lib/hooks/useCheckoutCart.ts` | No `cartId` and not registered → use the local cart |
| `src/features/checkout/lib/hooks/usePersistGuestCart.ts` (new) | `persistGuestCart(): Promise<string>` ensures a guest session, creates the database cart, clears localStorage and returns the `cartId` |
| `src/features/checkout/ui/sections/CheckoutSummarySection/CheckoutStripeButton.tsx`, `CheckoutPayPalButton.tsx`, `CheckoutIdealButton.tsx` | Call `persistGuestCart()` before the existing payment call when the cart is local |
| `src/features/checkout/ui/components/CheckoutAddressForm.tsx` | Required guest email field |
| `src/features/checkout/lib/services/checkoutDataBuilder.ts` | Use the guest email as `customer_email` |
| `supabase/functions/claim-guest-products/index.ts` (new) | Takes the caller's JWT (a registered user) and the previous anonymous access token. Checks that the token belongs to a user with `is_anonymous = true`, then moves that user's `products` and `printify_image_owners` rows to the caller |
| `src/features/auth/lib/hooks/useMergeGuestCart.ts` (new) | After login or register: if there was an anonymous session, call `claim-guest-products`, add the local items to the user's cart and clear localStorage |
| `src/shared/queries/authQueries.ts` (`useLogin`, `useRegister`, `useGoogleSignIn`) | `useLogin` and `useRegister`: save the anonymous access token before signing in, and run the merge afterwards. `useGoogleSignIn`: for an anonymous user, call `linkIdentity` first, and fall back to sign-in plus merge on `identity_already_exists` |
| `src/features/analytics/types/analyticsTypes.ts` | The three new event names |
| `src/i18n/messages/en.json` | `checkout.guestEmail.{label,placeholder,invalid}`, `checkout.errors.guestCartPersist`, `stamp.errors.productCreation.guestSession` |

## Steps

### 1. Registered-user helper and anonymous sign-in

- **Test first**: `src/shared/helpers/authIdentity.test.ts` (new): `isRegisteredUser` returns false for null, undefined and a user with `is_anonymous: true`, and true for a normal user.
- **Then**: add the helper, switch `useIsAuthenticated` to it, enable anonymous sign-ins in `supabase/config.toml`.
- **Done when**: the hosted Supabase project has anonymous sign-ins on (ask the user, it is a dashboard setting).

### 2. Stricter edge function limits for anonymous callers

- **Test first**: `supabase/functions/_shared/operationLimit.test.ts`: for an anonymous caller, `enforceCallerLimits` uses the anonymous per-user limit and also takes from the per-IP bucket, and either one being exhausted throws 429 `RATE_LIMITED`. For a registered caller it takes only from today's per-user limit. A request with no IP header falls back to a single shared `unknown` bucket rather than skipping the IP limit. `authGuard` test: `requireUser` returns `isAnonymous: true` for an anonymous JWT.
- **Then**: the migration, `isAnonymous` and `clientIp` in `authGuard.ts`, `enforceCallerLimits` in `operationLimit.ts`, and the switch from `enforceOperationLimit` to `enforceCallerLimits` in `upload-printify-image`, `create-custom-product`, `create-payment-intent`, `create-paypal-order` and `create-mollie-payment`, with the values in the Decisions table.
- **Done when**: the existing tests for those five functions still pass.

### 3. Generation and prompt edit stay registered-only

- **Test first**: `src/app/api/generate-image/route.test.ts`: an anonymous user gets 401 and no credit is debited. `SynthesisSection` test: an anonymous user sees the not-logged-in overlay and the generate button is disabled.
- **Then**: the `is_anonymous` check in the route, `isRegisteredUser` in `SynthesisSection` and `StampHeader`.

### 4. Open the routes

- **Test first**: `src/middleware.test.ts`: a request with no user to `/stamp`, `/cart` and `/checkout` passes through. `/orders`, `/profile` and `/dashboard` still redirect, both with no user and with an anonymous user. `ProtectedRoute` test: an anonymous user gets the fallback.
- **Then**: update `PROTECTED_PREFIXES` and the user check in `src/middleware.ts`, remove `ProtectedRoute` from the cart and checkout page clients, update `ProtectedRoute`.
- **Done when**: clicking Stamp on `/` while logged out opens `/stamp`.

### 5. Local cart service and mapper

- **Test first**: `src/shared/services/localCartStorageService.test.ts`: add, update quantity, remove, clear, and the data survives a fresh read (reload). Corrupt JSON returns an empty cart. `src/shared/mappers/localCartMapper.test.ts`: totals and line items match a `CartWithItems` built from the same products.
- **Then**: move the local-cart methods into the new service, add the mapper, delete `guestProductStorageService.ts` and fix its imports.

### 6. Guest product creation and add to cart

- **Test first**: `src/features/stamp/lib/hooks/__tests__/useStampProductCreation.test.ts`: with no user, it calls `signInAnonymously` once, then creates the product, and no longer redirects to `/auth/login`. If anonymous sign-in fails, it shows `guestSession` and stays on the step. `useStampCartActions` test: a non-registered user's add-to-cart writes to the local cart, fires `guest_add_to_cart` and does not call `useAddToCart`.
- **Then**: `useEnsureGuestSession` in `authQueries.ts`, and the changes to the two stamp hooks.

### 7. Cart and checkout read the local cart

- **Test first**: `src/shared/queries/cartQueries.test.ts`: `useCart` returns the mapped local cart for non-registered users, and quantity and remove mutations update localStorage. `useCheckoutCart` test: with no `cartId` and a guest user, it returns the local cart, and `guest_checkout_started` fires once.
- **Then**: the changes to `cartQueries.ts` and `useCheckoutCart.ts`. `CartOrderSummary` and `CheckoutSummarySection` need no change if the mapped shape matches.
- **Done when**: a guest sees the same items, prices and totals on `/cart` and in the `/checkout` summary after a reload.

### 8. Guest email and writing the cart at payment

- **Test first**: `CheckoutAddressForm` test: the email field is shown and required only for non-registered users. `usePersistGuestCart` test: it creates one database cart owned by the anonymous uid with the local items, clears localStorage only after the insert succeeds, fires `guest_payment_started` and returns the `cartId`. On failure it keeps the local cart and shows `guestCartPersist`. A second click while a call is still running does not create a second cart. `checkoutDataBuilder.test.ts`: the guest email becomes `customer_email`.
- **Then**: `createCartFromLocalItems` in `cartService.ts`, the new hook, the three payment buttons, the form field and `checkoutDataBuilder.ts`.
- **Done when**: a guest test payment in Stripe test mode creates an order with the guest's email, and the return page finalises it like a registered user's order.

### 9. Move the guest cart and products on login

- **Test first**: `supabase/functions/claim-guest-products/index.test.ts`: it moves `products` and `printify_image_owners` rows from an anonymous user to the caller. It refuses when the source user is not anonymous, when the token is invalid, and when the caller is anonymous. `useMergeGuestCart` test: after login, the local items are added to the user's database cart and localStorage is cleared. If the claim fails, the local cart is kept and an error is shown. `useGoogleSignIn` test: an anonymous user calls `linkIdentity` and not `signInWithOAuth`. On `identity_already_exists` it stores the anonymous token in sessionStorage and calls `signInWithOAuth`, and the merge runs after the callback.
- **Then**: the edge function (using `requireUser` for the caller and `enforceCallerLimits`), the hook, and the changes to `useLogin`, `useRegister` and `useGoogleSignIn`.
- **Done when**: a guest who adds a product, logs in and pays gets no `PRODUCT_NOT_FOUND` from `checkoutPricing`.

## Acceptance tests

These need the user's approval when implemented:

- `tests/acceptance/specs/navigation-auth.spec.mjs`: rewrite `AUTH-08 guest Stamp click prompts login and continues to the studio after sign-in` so that clicking Stamp while logged out opens `/stamp` with no dialog. `AUTH-08 anonymous /orders` and `/dashboard` stay as they are.
- `tests/acceptance/specs/guest-checkout.spec.mjs` (new):
  - `GUEST-01`: a guest's cart survives a reload and shows the same items and total on `/cart` and in the `/checkout` summary.
  - `GUEST-02`: an anonymous session gets 401 from `/api/generate-image`, and the prompt section shows the login overlay.
  - `GUEST-03`: starting a payment creates a database cart owned by the anonymous user, with the local items, and clears localStorage.

## Open questions

None.
