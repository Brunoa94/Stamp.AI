---
paths:
  - "src/**"
---

# Architecture & Folder Structure

## Feature-Sliced Design (FSD)

Each feature is a self-contained slice:

```
src/features/[feature-name]/
├── ui/              # React components only (.tsx)
│   ├── sections/    # One folder per page section
│   └── components/  # Components shared by 2+ sections or other slices
└── lib/             # All non-component code
    ├── helpers/     # Pure functions for computations
    ├── constants/   # Static data and configuration
    ├── types/       # Feature-specific types
    ├── hooks/       # Custom React hooks
    ├── mappers/     # Data transformation functions
    ├── services/    # Business logic and external integrations
    ├── variants/    # cva styling variants
    └── utils/       # Generic utility functions
```

Code used by several slices goes in `src/shared/`.

## UI vs non-UI

- **`ui/` holds only React components.** Never put helpers, constants, hooks or types in a `ui/` folder; they go in `lib/`.
- `ui/sections/<SectionName>/` holds `<SectionName>.tsx` plus every component only that section uses (see `src/features/stamp/ui/sections/`).
- `ui/components/` holds only components used by two or more sections or by other features. A component used by one section lives in that section's folder.

```
// ❌ BAD: helper inside a component folder
src/features/homepage/ui/sections/HomeProcessSection/
├── ProcessStickyCarousel.tsx
└── processAnimationHelpers.ts

// ✅ GOOD
src/features/homepage/
├── ui/sections/HomeProcessSection/ProcessStickyCarousel.tsx
└── lib/helpers/processAnimationHelpers.ts
```

## Layers

1. **UI**: `src/features/*/ui/`, presentational components
2. **Queries**: `src/shared/queries/` and feature hooks in `src/features/*/lib/hooks/`, data fetching and caching
3. **Services**: `src/shared/services/` and feature services in `src/features/*/lib/services/`, business logic and external integrations

**No data fetching in UI components.** Components under `ui/` (and `src/features/ui`, `src/shared/ui`) never call `fetch`, Supabase, `useQuery`/`useMutation`, AI SDKs or API services directly. They get data from a hook and render it. `analyticsService` is the one allowed service import. Enforced by ESLint.

## Hooks and side effects

- **A write is a `useMutation`.** Creating, updating, deleting, claiming or merging data goes through a mutation in `src/shared/queries/` or the feature's `lib/hooks/` (see `useLogin` in `authQueries.ts`, `useAddToCart` in `cartQueries.ts`). Cache updates and invalidation go in `onSuccess`; errors go to `handleError` in `onError`. No `.then().catch().finally()` chains around a service call in a hook.
- **An effect only decides when.** When a write must happen in response to state (a session appearing, a return page loading), the `useEffect` checks the condition and calls `mutate`; everything else lives in the mutation.
- **Use the mutation's state, not a ref.** `isPending` shows progress; `isIdle` allows one attempt (a failed mutation is not idle, so an effect guarded by it doesn't retry in a loop). A `useRef` flag is for the one thing React state can't do: rejecting a second call synchronously, before a re-render (`useSinglePaymentAttempt`).

```ts
// ❌ BAD: the effect does the write by hand
const isMerging = useRef(false);
useEffect(() => {
  if (!ready || isMerging.current) return;
  isMerging.current = true;
  mergeService(user)
    .then(() => queryClient.invalidateQueries({ queryKey: ["cart"] }))
    .catch((error) => handleError(error))
    .finally(() => { isMerging.current = false; });
}, [ready, user]);

// ✅ GOOD: a mutation owns the write, the effect triggers it
const { mutate: merge, isIdle } = useMergeMutation(); // onSuccess invalidates, onError handles
useEffect(() => {
  if (!ready || !isIdle) return;

  merge(user);
}, [ready, isIdle, merge, user]);
```

## Slice boundaries

A file imports its own layer or a lower one, never a higher one:

| Layer    | Folders                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------- |
| app      | `src/app`, `src/providers`, files at the `src/` root (middleware, instrumentation)                 |
| features | `src/features/<slice>` (every slice except `ui`)                                                   |
| shared   | `src/features/ui` (design system), `src/shared`, `src/lib`, `src/helpers`, `src/i18n`, `src/types` |

Between feature slices, only the **public API** may be imported: `<slice>/lib/**` and `<slice>/ui/components/**`. Everything else (`ui/sections/**`, files at the slice root, ad-hoc folders like `auth/login/`) is internal. If another slice needs it, move it to `lib/` or `ui/components/`, or to `src/shared/` when several slices use it.

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

Test files are exempt. Enforced by `eslint-rules/sliceBoundaries.mjs`, as an ESLint rule and as a Claude Code hook.

## No barrel exports

No `index.ts` re-export files. Import directly from the file that defines the thing. Enforced by ESLint.
