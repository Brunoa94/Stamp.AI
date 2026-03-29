# Stamp.AI Homepage + Google Reviews Trust Section — Implementation Plan

Draft source:

- Project ID: `d9331256-00e1-4115-b3c8-e47316cbff97`
- Draft ID: `daaa00d7-592a-42b1-af4e-4cbff17a946a`
- Draft title: `Stamp.AI | Google Reviews Trust Section`

## Objective

Implement the homepage visual direction from the Superdesign draft while explicitly excluding navbar redesign, and map all visual colors to existing design-system tokens.

## Scope

### In scope

1. Homepage hero section visual language and typography hierarchy.
2. Process/Journey card grid section.
3. Google Reviews trust section:
   - aggregate rating
   - rating distribution bars
   - review cards grid
4. Token-driven color migration (remove draft hardcoded palette in favor of project design-system tokens).

### Out of scope

1. Navbar redesign from the draft.
2. Footer redesign from the draft.
3. New backend integration for live Google Reviews data.

## Design-system mapping strategy

Draft hardcoded colors are replaced with app tokens/utilities:

- Background surfaces: `bg-background`, `bg-card`, `bg-secondary/30`
- Text hierarchy: `text-foreground`, `text-muted-foreground`
- Borders: `border-border`
- Positive/review accents: `text-chart-2`, `bg-chart-2`
- Star/rating accents: `text-chart-4`, `fill-chart-4`
- Negative/error scale: `bg-destructive`

This keeps dark/light mode compatibility and consistency with global token definitions in `src/app/globals.css`.

## Implementation breakdown

### Phase 1 — Draft extraction and structural translation

- Fetch Superdesign draft HTML via CLI.
- Identify homepage sections relevant to this request (exclude navbar).
- Convert static HTML blocks into React/Next JSX structure.

### Phase 2 — UI implementation in homepage route

- Update `src/app/page.tsx` to include:
  - Hero section
  - Process cards (data-driven array)
  - Trust/reviews section (data-driven arrays)
- Use icon libraries already available in project (`lucide-react`, `react-icons`).

### Phase 3 — Token alignment and polish

- Replace draft-specific hardcoded colors with theme tokens.
- Preserve typographic personality using existing `font-heading` and `font-accent` utilities.
- Keep responsive breakpoints and spacing aligned with current app shell.

### Phase 4 — Validation

- Run project diagnostics for TypeScript/lint issues in changed files.
- Confirm homepage renders with existing global layout/navbar/footer unaffected.

## Acceptance criteria

1. Homepage visually reflects draft direction (hero + process + trust sections).
2. Navbar remains untouched by this implementation.
3. Colors are tokenized according to the design system.
4. No new lint/type errors introduced by the change.

## Rollback strategy

If regressions are found, revert:

- `src/app/page.tsx`
- `docs/development/stampai-google-reviews-homepage-implementation-plan.md`

## Status

- [x] Draft fetched from Superdesign CLI
- [x] Implementation plan added
- [x] Homepage implementation applied (excluding navbar)
- [ ] Visual QA in browser
- [ ] Optional enhancement: wire reviews to live data source
