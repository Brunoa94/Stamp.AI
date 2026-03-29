# Stamp.AI Modern Glassmorphism Floating Navbar — Implementation Plan

Draft source:

- Project ID: `d9331256-00e1-4115-b3c8-e47316cbff97`
- Draft ID: `04c9cecc-8c8a-40c2-a6bb-29d4421bd8ac`
- Draft title: `Stamp.AI | Modern Glassmorphism Floating Navbar (Space Grotesk Update)`

## Non-negotiable constraint

- The left brand text must remain exactly as-is: `Stamp.AI` (existing project rendering preserved).

## Objective

Implement the approved floating top navbar style (glass shell, rounded full-width capsule, center CTA emphasis, compact right-side utility actions) in the current Next.js layout without breaking existing auth/cart/logout flows.

## Scope

### In scope

1. Desktop floating navbar shell and accent treatment.
2. Center navigation visual update (`My Orders`, `Stamp It!`, `Dashboard`).
3. Right action cluster visual update (coins, cart, profile, sign out).
4. Preserve existing app routes and mutations.

### Out of scope

1. Full mobile redesign to match this draft.
2. Backend/auth logic changes.
3. Footer or homepage section changes.

## File-level implementation

1. `src/theme/components.ts`
   - Updated navbar tokens for:
     - floating glass container,
     - top accent bar,
     - three-slot desktop layout,
     - link underline style,
     - gradient `Stamp It!` CTA,
     - refined action controls.

2. `src/features/layout/navbar.tsx`
   - Applied desktop structure with:
     - left brand slot,
     - centered nav slot,
     - right actions slot,
     - top accent element.

3. `src/features/layout/navbar/NavbarLinks.tsx`
   - Added active-state treatment for `/stamp` while preserving route behavior.

4. `src/features/layout/navbar/AuthenticatedUserSection.tsx`
   - Switched to draft-aligned visual hierarchy:
     - coins pill,
     - cart icon with badge,
     - compact profile pill,
     - lightweight sign-out control.
   - Kept logout mutation behavior unchanged.

## Acceptance criteria

1. Desktop navbar matches the floating glassmorphism style from the draft.
2. Left brand text remains unchanged (`Stamp.AI`).
3. Navigation links and `Stamp It!` route actions still work.
4. Cart badge and sign-out mutation remain functional.
5. No TypeScript/lint errors in touched files.

## Validation checklist

- [x] Superdesign draft fetched
- [x] Implementation plan documented
- [x] Desktop implementation applied
- [ ] Browser visual QA against draft
- [ ] Cross-page responsive QA (desktop and tablet)
