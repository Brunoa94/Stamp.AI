# Claude Code Instructions

Docs index: `docs/README.md`. Detailed rules load automatically from `.claude/rules/` when you touch matching files (`components.md` for `.tsx`, `architecture.md` and `types.md` for `src/`). Read the relevant one before planning a change you haven't opened files for yet.

## Core rules

- **Components**: Single Responsibility, DRY, atomic. One exported component per `.tsx` file; no complex logic inside `.map()` callbacks (move it to `lib/helpers/`). Props drilled more than 3 levels move to context (read-only, never setters) or a Zustand store (when children write the state); ask before introducing either.
- **Design system**: use `@/features/ui/*` components instead of raw HTML, `next/image` for images and SVG assets (no inline `<svg>`), cva variants in `lib/variants/` for styling, design tokens only.
- **Feature-Sliced Design**: `src/features/<slice>/ui/` holds only components; all other code goes in `lib/`. Imports go app → features → shared, never upward. Other slices may import only `<slice>/lib/**` and `<slice>/ui/components/**`. No barrel `index.ts` files.
- **No data fetching in UI**: components get data from hooks in `lib/hooks/` or `src/shared/queries/`.
- **Types**: everything typed; types end in `T`, single-component props interfaces are `PropsI`; database-shaped types derive from the generated database types.
- **Errors**: only `UserFacingError` messages reach the user; surface errors through `useErrorHandler`; log with `src/lib/observability/logger.ts`, not `console.log`. Load the `error-handling` skill before writing code that can fail: payments, checkout, fulfillment, refunds, AI generation, external APIs, timeouts, retries, idempotency.
- **Clean code**: no premature memoization; update existing docs instead of adding a markdown file per change.

## Workflow

Before editing code under `src/`, load the `test-driven-development` skill and write the failing test first. Other skills (`frontend-ui-engineering`, `accessibility`, `error-handling`, `performance-optimization`) are listed in `docs/README.md` → Skills.

## Pre-Commit Validation

Before committing, verify the code follows these rules and the files in `.claude/rules/`; refactor it if not. Run `npm run knip` and `npm run fallow` before verifying.

ESLint, the git pre-commit hook and the Claude Code hooks enforce most rules; `docs/guardrails.md` lists every one. Fix the code when a check fails. Never bypass the hook with `--no-verify`.
