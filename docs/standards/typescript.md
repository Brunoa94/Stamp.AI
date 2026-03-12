# TypeScript Guidelines

## **Naming Conventions**

- **Component Props**: Use interfaces ending with `I`. For single-component props use `Props`
- **API Interfaces**: End with `I` (e.g., `UserI`, `PaymentTransactionI`)
- **Type Aliases**: End with `T` (e.g., `ErrorCodeT`, `StatusT`)
- **Enum Types**: End with `T` (e.g., `PaymentStatusT`)

## **Interface vs Type Usage**

- **Use Interfaces for**:
  - Component props
  - API request/response objects
  - Database entity shapes
  - Extensible object structures
- **Use Types for**:
  - Union types (e.g., `'loading' | 'success' | 'error'`)
  - Computed types
  - Utility types (Pick, Omit, etc.)

## **File Organization**

- **Shared Types**: `/types/index.ts` for cross-platform types (frontend + backend)
- **Frontend Types**: `/src/types/` for frontend-specific types
- **Component Types**: Co-located with components when component-specific

## **Database Integration**

- Object types that exist on the database are derived from the schemas
- Use Zod schemas for runtime validation and type inference
- Prefix database types with `DB` (e.g., `DBUserI`)

## **Configuration**

- Strict mode enabled in tsconfig.json
- Path mapping configured: `@/*` → `./src/*`, `@/types/*` → `./types/*`

## **Best Practices**

- Always prefer interfaces over types for object shapes
- Use `readonly` for immutable data
- Leverage utility types: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`
- Use generic constraints for reusable types
