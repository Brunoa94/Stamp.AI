# Stamp.AI Simplified Sunset Navbar — Implementation Plan

Draft source:
- Project ID: `d9331256-00e1-4115-b3c8-e47316cbff97`
- Draft ID: `8f880f7a-abda-4524-aad3-f292020f4326`
- Draft title: `Stamp.AI Simplified Sunset Navbar - Refined Sign Out`

## Objective
Implement the approved navbar visual language (sunset top accent, glass shell, simplified right actions, refined sign-out CTA) in the production Next.js app while preserving existing auth/cart behavior.

## Scope

### In scope
1. Desktop navbar shell and top accent bar.
2. Brand lockup update to `STAMP • AI` with gradient dot.
3. Center navigation visual treatment (`My Orders`, `Stamp It!`, `Dashboard`).
4. Simplified authenticated actions: cart + divider + refined sign-out button.
5. Keep current routing and logout mutations unchanged.

### Out of scope (this iteration)
1. Mobile sidebar redesign.
2. Login/Register visual redesign.
3. Footer or page-level redesign.

## Implementation breakdown

### Phase 1 — Theme token alignment
- Update `navbarTheme` tokens in `src/theme/components.ts` for:
  - Glass background and border/shadow.
  - Animated top gradient bar.
  - Brand typography and gradient dot.
  - Link hover underline and sunset active state.
  - Stamp button style.
  - Action area spacing + cart badge + sign-out style.

### Phase 2 — Desktop navbar structure
- Update `src/features/layout/navbar.tsx`:
  - Keep desktop and mobile composition as-is.
  - Apply updated desktop shell classes.
  - Add dedicated top gradient accent element.

### Phase 3 — Component-level visual implementation
- Update `src/features/layout/navbar/NavbarBrand.tsx`:
  - Render split logo text segments: `Stamp` + dot + `AI`.
- Update `src/features/layout/navbar/NavbarLinks.tsx`:
  - Use updated link styling and route-active logic.
  - Keep `Stamp It!` CTA route and add active state ring.
- Update `src/features/layout/navbar/AuthenticatedUserSection.tsx`:
  - Simplify to cart and sign-out actions.
  - Keep cart count badge and logout pending state.

### Phase 4 — Verification and polish
- Confirm no TypeScript or lint regressions.
- Confirm nav behavior in authenticated desktop state:
  - Route navigation works.
  - Cart count renders correctly.
  - Sign-out mutation still executes.
- Confirm mobile navbar remains functional and unaffected.

## Acceptance criteria
1. Desktop navbar visually matches the approved sunset draft.
2. Sign-out control is visually refined and still functional.
3. Existing auth/cart functionality remains intact.
4. No build/lint/type errors introduced by the change set.

## Rollback strategy
If regressions are found, revert these files only:
- `src/theme/components.ts`
- `src/features/layout/navbar.tsx`
- `src/features/layout/navbar/NavbarBrand.tsx`
- `src/features/layout/navbar/NavbarLinks.tsx`
- `src/features/layout/navbar/AuthenticatedUserSection.tsx`

## Status
- [x] Draft fetched from Superdesign CLI
- [x] Implementation plan added
- [x] Initial implementation applied
- [ ] QA/visual verification in browser
- [ ] Optional follow-up: mobile parity with sunset style
