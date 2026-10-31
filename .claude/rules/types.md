---
paths:
  - "src/**/*.{ts,tsx}"
---

# Types & Interfaces

## Types

- **All data is typed.** Every piece of data flowing through the app has an explicit type.
- **Database-shaped types derive from the generated database types.** A type with the same structure as a table infers it from the generated Supabase types instead of redeclaring it, so it can't drift from the schema.
- **Location**: feature types in `src/features/<feature>/lib/types/`; shared types in `src/types/` or `src/shared/types/`. Never in a `ui/` folder.
- **Naming**: type names end in `T` (`UserT`, `ProductT`, `PaymentReturnStatusT`). Older types still use a `Type` suffix (`FlowStepType`); rename them to `T` when you touch them.

## Interfaces

- Component interfaces live in the component file. An interface used by a single component is named `PropsI`.
- Shared interfaces go in a shared location with a descriptive name.

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
