# Stamp.AI Integrated Homepage Refinement — Implementation Plan

Draft source:
- Project ID: `d9331256-00e1-4115-b3c8-e47316cbff97`
- Draft ID: `daaa00d7-592a-42b1-af4e-4cbff17a946a`
- Draft title: `Stamp.AI | Integrated Homepage Refinement`
- Retrieval: fetched via Superdesign CLI (`get-design`)

## Objective
Implement the integrated homepage direction from the approved Superdesign draft in the Next.js codebase, aligned with the existing app shell, design tokens, and component architecture.

## Draft-to-app interpretation
The draft includes a standalone HTML page with its own navbar/footer. In this app, navbar/footer are already rendered globally in `src/app/layout.tsx`, so implementation will map only homepage body sections into `src/app/page.tsx` (and extracted feature components).

## Scope

### In scope
1. Homepage content sections and visual hierarchy:
   - Hero (editorial headline treatment)
   - CTA band
   - Journey/process section (6-step flow)
   - Brand story section
   - Pricing section (Starter / Professional / Enterprise)
   - FAQ accordion section
   - Trust & security section
2. Tokenized styling migration (replace draft hardcoded palette with project tokens).
3. Responsive behavior for mobile/tablet/desktop.
4. Minimal interactions from draft (scroll indicator behavior, FAQ open/close, subtle hover/motion).

### Out of scope
1. Global navbar redesign (handled by `src/features/layout/navbar.tsx`).
2. Global footer redesign (handled by `src/features/layout/footer.tsx`).
3. New backend integrations (live pricing plans, CMS FAQ, dynamic reviews/security feeds).
4. New checkout/payment business logic.

## Current-state notes
- Current homepage (`src/app/page.tsx`) is a 3-section, full-page snap experience.
- Draft is a long-form editorial layout with multiple stacked sections.
- Existing homepage already contains process/trust concepts, but draft expands content and section count significantly.

## Technical approach

### 1) Refactor homepage structure
- Replace monolithic `src/app/page.tsx` markup with section composition using feature components:
  - `src/features/home/HomeHero.tsx`
  - `src/features/home/HomeCtaBand.tsx`
  - `src/features/home/HomeJourney.tsx`
  - `src/features/home/HomeBrandStory.tsx`
  - `src/features/home/HomePricing.tsx`
  - `src/features/home/HomeFaq.tsx`
  - `src/features/home/HomeSecurity.tsx`
- Keep `page.tsx` as orchestrator + static content wiring.

### 2) Content/data extraction
- Move repeated card/faq/pricing data into typed constants:
  - `src/features/home/data.ts`
- Keep UI text editable in one place for future content iteration.

### 3) Token-first style mapping
Map draft-specific colors to design-system tokens:
- `#f2f2f2` / off-white backgrounds → `bg-background`, `bg-secondary/30`
- `#111111` text → `text-foreground`
- `#FF7E5F` accent → `text-chart-5`, `bg-chart-5` (or closest approved accent token)
- soft glass cards → existing `.glass-card` + `bg-card/..`, `border-border`
- muted metadata text → `text-muted-foreground`

No hardcoded hex values unless a missing token forces a design decision.

### 4) Interaction mapping
- Remove/retire current wheel-capture full-page snap logic.
- Keep natural page scroll for multi-section narrative.
- Optional retained micro-interactions:
  - Hero scale-on-scroll (lightweight, throttled)
  - FAQ chevron rotation on open state
  - Card hover lift/shadow transitions

### 5) Asset strategy
- Do not rely on external stock images from draft HTML.
- Use local/static assets if available; otherwise use neutral placeholders until branded assets are confirmed.

## File plan

### New files
- `src/features/home/HomeHero.tsx`
- `src/features/home/HomeCtaBand.tsx`
- `src/features/home/HomeJourney.tsx`
- `src/features/home/HomeBrandStory.tsx`
- `src/features/home/HomePricing.tsx`
- `src/features/home/HomeFaq.tsx`
- `src/features/home/HomeSecurity.tsx`
- `src/features/home/data.ts`
- `docs/development/stampai-integrated-homepage-refinement-implementation-plan.md`

### Files to update
- `src/app/page.tsx`

### Optional (if shared utility needed)
- `src/features/home/index.ts`

## Implementation phases

### Phase 1 — Foundation
1. Create `src/features/home/` section components.
2. Define typed content models in `data.ts`.
3. Recompose homepage in `src/app/page.tsx` using section components.

### Phase 2 — Visual parity pass
1. Match section spacing, typography hierarchy, and card proportions.
2. Apply tokenized surfaces, borders, and accents.
3. Implement responsive breakpoints for all sections.

### Phase 3 — Interaction + accessibility
1. FAQ with semantic `<details>/<summary>` or accessible controlled accordion.
2. Ensure heading order and landmark structure are valid.
3. Add focus-visible states and keyboard-accessible controls.

### Phase 4 — QA and stabilization
1. Run lint/type checks and resolve regressions.
2. Visual QA across key breakpoints.
3. Confirm navbar/footer remain unchanged and compatible with new sections.

## Acceptance criteria
1. Homepage reflects draft structure and intent across all listed sections.
2. Existing app shell (navbar/footer/providers) remains intact.
3. Styling is token-driven and dark/light mode-safe.
4. No new lint/type errors introduced.
5. Mobile and desktop layouts are usable and visually coherent.

## Risks & mitigations
- **Risk:** Draft uses hardcoded palette and external fonts not in design system.  
  **Mitigation:** enforce token mapping and existing font utilities (`font-heading`, `font-accent`, body font).

- **Risk:** Draft includes many sections, causing heavy first render.  
  **Mitigation:** extract components, keep data static, avoid unnecessary client-only logic.

- **Risk:** Replacing snap-scroll may alter current UX expectations.  
  **Mitigation:** align with product decision: long-form editorial homepage per approved draft.

## Rollback strategy
If regressions occur, revert:
- `src/app/page.tsx`
- `src/features/home/*` (new section files)
- this plan file

## Status
- [x] Superdesign draft fetched (`daaa00d7-592a-42b1-af4e-4cbff17a946a`)
- [x] Implementation plan added to docs
- [ ] Homepage implementation started
- [ ] Visual QA completed
