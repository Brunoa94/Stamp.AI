# Imaginary Builder AI - Documentation

This documentation defines the architectural patterns, coding standards, and best practices for the Imaginary Builder AI project.

## Table of Contents

- [Types & Interfaces](#types--interfaces)
- [Components](#components)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Guardrails](#guardrails)
- [Skills](#skills)
- [General Guidelines](#general-guidelines)

---

## Types & Interfaces

### Type Definitions

- **All data must be typed** - Every piece of data flowing through the application requires explicit type definitions.
- **Always grant that the types derived from the database follow the schemas there implemented** - Types that have the same structure that in the database must infer the types generated from the database
- **Type organization**:
  - Feature-specific types: `src/features/[feature-name]/types/`
  - Shared types: `src/types/` or `src/shared/types/`
- **Naming convention**: All type names end with a `T` suffix.
  - Example: `UserT`, `ProductT`, `PaymentReturnStatusT`
  - Older types still use a `Type` suffix (`FlowStepType`); rename them to `T` when you touch them.

### Interface Definitions

- **Component interfaces**: Define interfaces directly in component files.
- **Props interfaces**: When an interface is specific to a single component, name it `PropsI`.
- **Shared interfaces**: Place in appropriate shared locations with descriptive names.

**Example:**

```typescript
// Component-specific props
interface PropsI {
  title: string;
  onSubmit: () => void;
}

// Shared type
type UserT = {
  id: string;
  name: string;
  email: string;
};
```

---

## Components

### Core Principles

All components must adhere to these three principles:

1. **Single Responsibility Principle (SRP)** - Each component should have one clear purpose.
2. **DRY (Don't Repeat Yourself)** - Avoid code duplication by extracting reusable logic.
3. **Atomicity** - Components should be as small and focused as possible.

### Component Guidelines

- **Use the design system**: Always use components from `@/features/ui/` instead of raw HTML elements. This ensures consistent typography, spacing, and styling across the application.

  | HTML Element | Design System Component | Import |
  |--------------|------------------------|--------|
  | `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` | `<Heading>` | `@/features/ui/heading` |
  | `<p>` | `<Paragraph>` | `@/features/ui/paragraph` |
  | `<span>` (labels, badges, meta text) | `<Span>` | `@/features/ui/span` |
  | `<button>` | `<Button>` | `@/features/ui/button` |
  | `<input>` | `<Input>` | `@/features/ui/input` |
  | `<textarea>` | `<Textarea>` | `@/features/ui/textarea` |
  | `<select>` | `<Select>` | `@/features/ui/select` |
  | `<label>` | `<Label>` | `@/features/ui/label` |
  | `<input type="checkbox">` | `<Checkbox>` | `@/features/ui/checkbox` |
  | `<ul>`, `<ol>` | `<List>` | `@/features/ui/list` |
  | `<hr>` | `<Separator>` | `@/features/ui/separator` |
  | `<img>` | `<Image>` | `next/image` |

  **Exception**: Only use raw HTML elements when:
  - Building a new design system component
  - The design system doesn't have a suitable component (rare)
  - External/dynamic image URLs that can't be optimized

- **SVGs are always assets**: Never write inline `<svg>` markup in components. Save every SVG as a file under `public/assets/` (grouped by feature, e.g. `public/assets/flow-preview/`, `public/assets/platforms/`) and render it with `<Image>` from `next/image`. Enforced by ESLint (`no-restricted-syntax`).

  ```tsx
  // ❌ Bad
  <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21..." /></svg>

  // ✅ Good
  <Image src="/assets/platforms/trustpilot.svg" alt="" aria-hidden width={16} height={16} />
  ```

  **Exception**: Inline `<svg>` is allowed only when the markup must react at runtime: animated paths (e.g. stroke-dash drawing), `currentColor`/theme-token strokes, or shapes generated from props/config. Add a `// eslint-disable-next-line no-restricted-syntax -- <reason>` directive explaining why.

- **Styling approach**:
  - Prefer component `variants` for styling.
  - **No styling outside the returned JSX in `.tsx` files.** Class-string constants, tone/size lookup maps and helpers that return classes go in a `cva` file under the feature's `lib/variants/` (e.g. `src/features/homepage/lib/variants/flowMockButtonVariants.ts`); one-off classes stay inline in `className`. Enforced by ESLint (`no-restricted-syntax`); `src/features/ui/**` is exempt.

  ```tsx
  // ❌ Bad — class map in the component file
  const toneClasses = { dark: "bg-(--color-stamp-chocolate)", gold: "bg-(--color-stamp-gold)" };

  // ✅ Good — cva in lib/variants/, called from the JSX
  <Span className={cn(flowMockButtonVariants({ tone }), className)} />
  ```
  - Only add custom styles when absolutely necessary for specific use cases.
  - **Avoid inline styles** - use Tailwind classes instead. Only use inline `style` attributes for dynamic values that cannot be expressed with Tailwind (e.g., animation delays, dynamic widths from state).
- **Avoid premature optimization**: Only use `useCallback`, `useMemo`, `React.memo` for heavy computations or proven performance bottlenecks.

### File & Component Atomicity

**Every component file should contain only ONE exported component.** This is a strict rule that ensures maintainability, testability, and reusability.

#### Rules

1. **One file, one component**: Each `.tsx` file should export a single component.
2. **Extract sub-components**: If a component grows to include helper components, extract them to separate files.
3. **Organize in folders**: Related components should be grouped in folders with individual files.

#### Bad Example

```tsx
// ❌ BAD: ProcessStickyCarousel.tsx with multiple components
function ProcessStepper({ activeStepIndex, totalSteps }) {
  return <div>...</div>;
}

export function ProcessStickyCarousel() {
  return (
    <div>
      <ProcessStepper activeStepIndex={0} totalSteps={5} />
      ...
    </div>
  );
}
```

#### Good Example

```
// ✅ GOOD: Separate files for each component
src/features/homepage/ui/sections/HomeProcessSection/
├── HomeProcessSection.tsx       # Section entry point
├── ProcessStickyCarousel.tsx    # Main carousel component
├── ProcessStepper.tsx           # Stepper dots component
├── ProcessStepCard.tsx          # Individual step card
└── ProcessStepImage.tsx         # Step image component
```

```tsx
// ProcessStepper.tsx
interface ProcessStepperPropsI {
  activeStepIndex: number;
  totalSteps: number;
}

export function ProcessStepper({ activeStepIndex, totalSteps }: ProcessStepperPropsI) {
  return <div>...</div>;
}

// ProcessStickyCarousel.tsx
import { ProcessStepper } from "./ProcessStepper";

export function ProcessStickyCarousel() {
  return (
    <div>
      <ProcessStepper activeStepIndex={0} totalSteps={5} />
      ...
    </div>
  );
}
```

#### Benefits

- **Easier testing**: Each component can be unit tested in isolation.
- **Better code navigation**: File names match component names.
- **Improved reusability**: Components can be imported individually.
- **Clearer dependencies**: Import statements show component relationships.
- **Smaller bundle sizes**: Tree-shaking works more effectively.

### No Complex Logic in JSX Loops

**Extract complex computations from `.map()` loops into helper functions.** The `.map()` itself stays in the JSX return, but the logic inside should be minimal.

#### Rules

1. **Extract computation logic**: Move calculations to helper functions that return computed values.
2. **Keep `.map()` in JSX**: The iteration itself belongs in the return statement.
3. **Minimal logic in callbacks**: Only simple property access and helper function calls inside `.map()`.

#### Bad Example

```tsx
// ❌ BAD: Complex logic inside .map() callback
return (
  <div>
    {items.map((item, index) => {
      const isActive = index === activeIndex;
      const isPast = index < activeIndex;

      let opacity = 0;
      let translateY = 0;

      if (isActive) {
        opacity = 1 - progress;
        translateY = -40 * progress;
      } else if (index === activeIndex + 1) {
        opacity = progress;
        translateY = 40 * (1 - progress);
      }

      if (Math.abs(index - activeIndex) > 1) {
        return null;
      }

      return <div style={{ opacity, transform: `translateY(${translateY}px)` }}>...</div>;
    })}
  </div>
);
```

#### Good Example

```tsx
// ✅ GOOD: Extract logic to helper function, keep .map() in JSX
// helpers.ts
interface AnimationData {
  opacity: number;
  translateY: number;
  isVisible: boolean;
}

function computeAnimation(index: number, activeIndex: number, progress: number): AnimationData {
  const isActive = index === activeIndex;
  let opacity = 0;
  let translateY = 0;

  if (isActive) {
    opacity = 1 - progress;
    translateY = -40 * progress;
  } else if (index === activeIndex + 1) {
    opacity = progress;
    translateY = 40 * (1 - progress);
  }

  const isVisible = Math.abs(index - activeIndex) <= 1;
  return { opacity, translateY, isVisible };
}

// Component.tsx
return (
  <div>
    {items.map((item, index) => {
      const animation = computeAnimation(index, activeIndex, progress);
      if (!animation.isVisible) return null;

      return <StepCard key={item.id} item={item} {...animation} />;
    })}
  </div>
);
```

#### Benefits

- **Testable logic**: Helper functions can be unit tested independently.
- **Readable JSX**: The return statement clearly shows the component structure.
- **Reusable calculations**: Logic can be shared across components.

**Example:**

```tsx
// Good - uses design system variant
<Button variant="primary" size="lg">Submit</Button>

// Avoid - custom styling unless necessary
<Button className="custom-specific-case">Submit</Button>
```

---

## Architecture & Folder Structure

### Feature-Sliced Design (FSD)

This project follows the **Feature-Sliced Design** pattern for scalable and maintainable architecture.

- **Feature structure**:
  ```
  src/features/[feature-name]/
  ├── ui/              # UI components only
  │   ├── sections/    # Page sections
  │   └── components/  # Reusable components
  ├── lib/             # Non-component code (public API, with ui/components/)
  │   ├── helpers/     # Helper functions
  │   ├── constants/   # Constants and static data
  │   ├── types/       # Feature-specific types
  │   ├── hooks/       # Custom hooks
  │   ├── mappers/     # Data transformation functions
  │   ├── services/    # Business logic services
  │   └── utils/       # Utility functions
  ```

  There is no `index.ts` (barrel exports are banned); see [Slice boundaries](#slice-boundaries) for what other slices may import.

### Separation of Concerns in Folders

**IMPORTANT**: Keep a strict separation between UI and non-UI code:

1. **`ui/` folder**: Contains ONLY React components (`.tsx` files)
   - Components organized in subfolders by purpose
   - No helper functions, constants, or types directly in component folders

   - `ui/sections/<SectionName>/` holds one page section: `<SectionName>.tsx` plus every component only that section uses (see `src/features/stamp/ui/sections/`)
   - `ui/components/` holds only components shared by two or more sections (or imported by other features). When a component is used by a single section, it lives in that section's folder

2. **`lib/` folder**: Contains ALL non-component code
   - `helpers/` - Pure functions for computations (e.g., animation calculations)
   - `constants/` - Static data and configuration
   - `types/` - TypeScript type definitions
   - `hooks/` - Custom React hooks
   - `mappers/` - Data transformation functions
   - `services/` - Business logic and external integrations
   - `utils/` - Generic utility functions

#### Bad Example

```
// ❌ BAD: Helper file inside component folder
src/features/homepage/ui/sections/HomeProcessSection/
├── ProcessStickyCarousel.tsx
├── ProcessStepper.tsx
└── processAnimationHelpers.ts   # Wrong location!
```

#### Good Example

```
// ✅ GOOD: Helper in lib/helpers, components in their section folder
src/features/homepage/
├── ui/
│   └── sections/
│       └── HomeProcessSection/
│           ├── HomeProcessSection.tsx
│           ├── ProcessStickyCarousel.tsx
│           └── ProcessStepper.tsx
└── lib/
    └── helpers/
        └── processAnimationHelpers.ts
```

### Core Architecture Layers

The project is organized into three primary layers:

1. **UI Layer** (`src/features/*/ui/`) - Presentational components
2. **Queries Layer** (`src/shared/queries/`, plus feature hooks in `src/features/*/lib/hooks/`) - Data fetching and caching logic
3. **Services Layer** (`src/shared/services/`, plus feature services in `src/features/*/lib/services/`) - Business logic and external integrations

**No data fetching in UI components.** Components under `ui/` (and `src/features/ui`, `src/shared/ui`) never call `fetch`, Supabase, `useQuery`/`useMutation`, AI SDKs or API services directly. They get data from a hook in `lib/hooks/` or `src/shared/queries/` and render it. `analyticsService` is the one allowed service import. Enforced by ESLint (`no-restricted-imports`, `no-restricted-globals`).

### File Organization

- Keep features self-contained and decoupled.
- Share common utilities in `src/shared/`.
- Follow consistent naming conventions across features.
- **Never place helper functions, constants, or types inside `ui/` folders.**

### Slice boundaries

Layers, top to bottom. A file imports its own layer or a lower one, never a higher one:

| Layer    | Folders                                                                                      |
| -------- | -------------------------------------------------------------------------------------------- |
| app      | `src/app`, `src/providers`, files at the `src/` root (middleware, instrumentation)           |
| features | `src/features/<slice>` (every slice except `ui`)                                             |
| shared   | `src/features/ui` (design system), `src/shared`, `src/lib`, `src/helpers`, `src/i18n`, `src/types` |

Between feature slices, only the **public API** may be imported: `<slice>/lib/**` and `<slice>/ui/components/**`. Everything else (`ui/sections/**`, files at the slice root, ad-hoc folders like `auth/login/`) is internal. If another slice needs it, move it into `lib/` or `ui/components/`, or into `src/shared/` when several slices use it.

```ts
// ❌ BAD: shared code depending on a feature (wrong direction)
// src/shared/queries/authQueries.ts
import { getSafeRedirectPath } from "@/features/auth/lib/helpers/redirectTarget";

// ❌ BAD: reaching into another slice's internals
// src/features/stamp/ui/components/StampHeader.tsx
import { Login } from "@/features/auth/login/Login";

// ✅ GOOD: another slice's public API
// src/features/cart/ui/sections/CartItemCard/CartItemCardSpecs.tsx
import { formatVariantForDisplay } from "@/features/stamp/lib/helpers/sizeDisplayMapper";
```

Test files are exempt. The rule lives in `eslint-rules/sliceBoundaries.mjs` and runs both as an ESLint rule and as a Claude Code hook that rejects edits adding a violation (existing violations in a file don't block unrelated edits).

---

## Performance Optimization

- **React hooks**: Use performance hooks (`useCallback`, `useMemo`, `React.memo`) only when:
  - Profiling shows measurable performance issues
  - Handling expensive computations
  - Preventing unnecessary re-renders in large lists
- **Avoid premature optimization** - Measure first, optimize second.

The full measure → identify → fix → verify workflow is the `performance-optimization` skill (see [Skills](#skills)).

---

## Error Handling

- Catch errors at boundaries; only `UserFacingError` messages reach the user verbatim.
- Every error state gives the user a way forward (retry, another method, support with the payment ID).
- Idempotency is enforced on the server (idempotency key + database constraint), never only in the browser.
- Log with the structured logger in `src/lib/observability/logger.ts`, not `console.log`.

Payment states, idempotency, timeouts, refunds/recovery and logging are in the `error-handling` skill (see [Skills](#skills)).

---

## Guardrails

These patterns are enforced by tools, so neither people nor agents can drift from them.

**ESLint** (`eslint.config.mjs`)
- Design-system components instead of raw HTML elements; no inline `<svg>`; styling in cva variants or inline JSX
- Design tokens only: no arbitrary color classes (`bg-[#7C3AED]`), no hex literals in components, no arbitrary spacing (`p-[13px]`)
- Accessibility: jsx-a11y recommended rules
- No data fetching in UI components (see [Core Architecture Layers](#core-architecture-layers))
- No direct `toast.error`: errors reach the user through `useErrorHandler` (see [Error Handling](#error-handling))
- [Slice boundaries](#slice-boundaries)
- No barrel exports

**Git pre-commit hook** (`.githooks/pre-commit`, installed by `npm install`): ESLint on the staged files, `tsc --noEmit`, then `vitest related` on the staged `src/` files. A commit that breaks a rule, the types or a related unit test is rejected.

**Claude Code hooks** (`.claude/hooks/`, registered in `.claude/settings.json`, tested by `npm run test:hooks`)
- `protect-acceptance-tests.mjs`: editing acceptance tests needs approval (also from the shell)
- `guard-dangerous-commands.mjs`: `rm -rf`, `git push --force`, `git reset --hard`, installing new dependencies, changes to the remote Supabase project (`db push`, `db reset --linked`, `functions deploy|delete`, `secrets set|unset`, `migration repair`) and `psql` against a non-local host need approval. Looks inside `bash -c` and `npx`.
- `enforce-slice-boundaries.mjs`: edits that add a slice-boundary violation are rejected
- `block-shell-source-writes.mjs`: shell commands that write `src/` source code (`sed -i`, heredocs, `tee`, `cp`, `mv` from outside `src/`) are rejected; source is edited with Edit/Write/MultiEdit so the two hooks above and below see it. Renames inside `src/` and shell writes to tests, styles and docs are fine.
- `enforce-test-first.mjs`: an Edit/Write that changes the behavior of gated source code is rejected until a **covering** test has been written or changed in the same session (also from the shell), and Claude is sent to the `test-driven-development` skill
- `enforce-tdd-on-commit.mjs`: a `git commit` (including `-a`/`--all`) that changes the behavior of gated source code without changing a covering test is rejected and sent back to the `test-driven-development` skill; a `No-Tests-Reason:` line in the message asks a human instead

What the two TDD hooks gate:

- **Gated**: logic under `src/`: hooks, helpers, services, queries, mappers, API routes, middleware, providers.
- **Not gated**: tests; presentational code (`ui/` folders, the design system `src/features/ui` and `src/shared/ui`, `src/app` pages and layouts, `.tsx` components elsewhere in a slice outside `lib/`); `lib/variants/` (styling); `constants/` (static data); types. Acceptance tests, lint and `tsc` cover these.
- **Not a behavior change**: edits that only touch import/re-export statements, comments or formatting (moving a module and updating its imports, documenting, reformatting).

A test **covers** a source file when it imports it, directly or through other modules (including a module that doesn't exist yet: the red step for a new file), or has the same base name (`total.ts` ↔ `total.test.ts`), or sits in the source's folder, a `__tests__` folder there, or an ancestor folder at slice/module depth or deeper (`src/features/<slice>/__tests__/` covers the whole slice; `src/__tests__/` covers nothing). See `isBehaviorFile` and `isRelatedTest` in `.claude/hooks/tdd-files.mjs`, `test-imports.mjs` and `behavior-change.mjs`.

**Cleanup** (run before verifying): `npm run knip` for unused files, exports and dependencies; `npm run fallow` for duplicated code. Fallow fails CI once duplication passes the ratchet in `.fallowrc.jsonc`. Lower the threshold as clones get removed.

---

## Skills

Task-specific guidance lives in Claude Code skills under `.claude/skills/`. Claude loads a skill when the task matches its description; people can read the `SKILL.md` files directly.

| Skill                      | Use it for                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `frontend-ui-engineering`  | Components, layouts, state, accessibility, responsive design, loading/error/empty states. Its `references/color-palette.md` is the color system. |
| `performance-optimization` | Measuring and fixing slow pages, interactions and API routes; Core Web Vitals                |
| `test-driven-development`  | Implementing logic, fixing bugs or changing behavior: red-green-refactor, reproduce bugs with a failing test first |
| `error-handling`           | Payments, checkout, fulfillment, refunds, external APIs: error states, idempotency, timeouts, recovery, logging |

Rules that must always hold are not left to skills: they are lint rules or hooks (see [Guardrails](#guardrails)).

---

## General Guidelines

- **Documentation**: Do not create new markdown files for every change. Update existing documentation when appropriate.
- **Code reviews**: Follow established patterns in the codebase.
- **Consistency**: Maintain consistency with the Feature-Sliced Design architecture.
- **No barrel exports**: Do not use `index.ts` files for re-exporting. Import directly from specific files instead of using barrel files. This improves tree-shaking, reduces circular dependencies, and makes imports explicit.

---

## Contributing

When adding new features or modifying existing code:

1. Follow the established patterns in existing features.
2. Maintain consistency with the Feature-Sliced Design architecture.
3. Document significant architectural decisions.
4. Ensure all code is properly typed.

For questions or clarifications, refer to existing implementations or consult the team.
