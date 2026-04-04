# Imaginary Builder AI - Documentation

This folder contains all architectural patterns, coding standards, and best practices for the Imaginary Builder AI project.

## Quick Navigation

### 🏗️ Architecture
- **[Architecture Overview](./architecture/overview.md)** - Project structure and architectural principles
- **[File Organization](./architecture/file-organization.md)** - How to organize files and folders
- **[Queries Layer](./architecture/queries-layer.md)** - React Query patterns and centralized server state management ⭐

### 📋 Standards
- **[TypeScript Guidelines](./standards/typescript.md)** - TypeScript naming conventions and best practices
- **[Zod Validation](./standards/zod-validation.md)** - Runtime validation patterns with Zod schemas

### 📐 Guidelines
- **[Styling Guidelines](./styling.md)** - Tailwind CSS, clsx, semantic HTML, and accessibility (WCAG 2.1 AA)
- **[Component Guidelines](./components.md)** - Component patterns, React Query integration, error handling, E2E testing

### 🎨 Design System
- **[Design System](./design-system.md)** - Using design system components and custom hooks

### 💻 Development
- **[Commands](./development/commands.md)** - Available npm scripts and CLI commands
- **[Tech Stack](./development/tech-stack.md)** - Technologies, dependencies, and versions

---

## Key Patterns at a Glance

### Data Flow Architecture

```
┌─────────────────────────────────────┐
│         Components Layer            │
│      (UI & User Interactions)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Queries Layer               │  ⭐ NEW: Centralized React Query
│  (React Query Hooks & Mutations)    │
│       src/queries/*.ts              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        Services Layer               │
│   (Business Logic & API Calls)      │
│      src/services/*.ts              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Data Sources                │
│   (Supabase, APIs, Database)        │
└─────────────────────────────────────┘
```

### Folder Structure

```
src/
├── app/                    # Next.js App Router (routes & API)
├── components/             # React components (feature-based organization)
├── features/               # Feature-specific code
│   └── ui/                 # Design system components
├── queries/                # ⭐ React Query hooks (centralized)
├── services/               # Business logic & API communication
├── hooks/                  # Custom utility hooks (non-query)
├── lib/                    # Core libraries
│   └── supabase/           # Supabase client configs
├── types/                  # TypeScript type definitions
├── schemas/                # Zod validation schemas
├── providers/              # React context providers
├── theme/                  # Design system (colors, icons, themes)
└── utils/                  # Helper functions
```

## Important Patterns

### ✅ DO

1. **Centralize React Query**
   - Put ALL queries and mutations in `src/queries/`
   - Organize by domain (orderQueries.ts, productQueries.ts)
   - Use consistent query keys

2. **Use Design System Components**
   - Prioritize shadcn/ui components
   - Import from `@/features/ui/`
   - Extend with className props

3. **Follow Feature-Based Organization**
   - Group by feature, not by type
   - Co-locate related files
   - Keep shared code in common/

4. **Maintain Accessibility**
   - WCAG 2.1 AA compliance required
   - Use semantic HTML elements
   - Include proper ARIA attributes

5. **Handle Errors Comprehensively**
   - Try-catch in all service methods
   - User-friendly error messages
   - Proper error boundaries

### ❌ DON'T

1. **Don't Define Queries in Components**
   - ❌ Bad: `useQuery()` directly in component files
   - ✅ Good: Import from `@/queries/`

2. **Don't Create Custom Buttons/Inputs**
   - ❌ Bad: `<button className="px-4...">`
   - ✅ Good: `<Button variant="outline">`

3. **Don't Use Type-Based Organization**
   - ❌ Bad: `components/buttons/`, `components/inputs/`
   - ✅ Good: `components/checkout/`, `components/dashboard/`

4. **Don't Skip Accessibility**
   - ❌ Bad: Color-only indicators, missing alt text
   - ✅ Good: Semantic HTML, ARIA labels, keyboard navigation

5. **Don't Mix React Query Logic**
   - ❌ Bad: Some queries in hooks/, some in components
   - ✅ Good: ALL queries in queries/ folder

6. **Don't Create Barrel Exports (index.ts)**
   - ❌ Bad: Creating index.ts files in component folders
   - ✅ Good: Import directly from file paths
   - Reason: Adds complexity, harder to maintain, causes circular dependencies

## Recently Added

### ⭐ Queries Layer Pattern (NEW)

A centralized location for all React Query hooks and mutations:

- **Location:** `src/queries/`
- **Purpose:** Single source of truth for server state management
- **Benefits:** Consistent query keys, reusable across app, easy cache invalidation

**Example:**
```typescript
// src/queries/orderQueries.ts
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", { userId }],
    queryFn: () => OrderService.getOrders(userId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => OrderService.createOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
```

See [Queries Layer Documentation](./architecture/queries-layer.md) for complete patterns.

## Getting Started

1. **New to the project?** Start with [Architecture Overview](./architecture/overview.md)
2. **Creating components?** Read [Component Guidelines](./guidelines/components.md)
3. **Adding data fetching?** Check [Queries Layer](./architecture/queries-layer.md)
4. **Styling components?** See [Styling Guidelines](./guidelines/styling.md)
5. **TypeScript types?** Review [TypeScript Guidelines](./standards/typescript.md)

## Questions?

If you can't find what you're looking for:
1. Check the relevant documentation file above
2. Search for patterns in existing code
3. Ask the team for guidance

## Contributing to Docs

When adding new patterns or updating existing ones:
1. Update the relevant documentation file
2. Add examples with ✅ Good and ❌ Bad patterns
3. Keep documentation concise and practical
4. Update this README if adding new sections
