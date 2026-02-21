# Mappers

This directory contains mapper classes that handle data transformation across the application.

## Purpose

Mappers provide clean, reusable functions for transforming data between different formats:
- Database types ↔ Application types
- External API responses ↔ Internal data structures
- Input validation ↔ Service method parameters
- Response formatting for clients

## Structure

```
mappers/
├── services/           # Service-specific mappers
│   ├── authServiceMapper.ts
│   ├── cartServiceMapper.ts
│   ├── customProductServiceMapper.ts
│   ├── orderServiceMapper.ts
│   ├── printifyServiceMapper.ts
│   ├── productServiceMapper.ts
│   └── index.ts        # Exports all service mappers
├── index.ts            # Main export file
└── README.md           # This file
```

## Usage

### Import Mappers

```typescript
// Import specific mapper
import { ProductServiceMapper } from '@/mappers/services';

// Import multiple mappers
import { 
  ProductServiceMapper, 
  CartServiceMapper 
} from '@/mappers/services';

// Import from root mappers folder
import { ProductServiceMapper } from '@/mappers';
```

### Example: ProductServiceMapper

```typescript
import { ProductServiceMapper } from '@/mappers/services';

// Map Printify product to database input
const input = ProductServiceMapper.mapPrintifyProductToInput(
  printifyProduct,
  blueprintId,
  printProviderId,
  printAreas,
  userId
);

// Map input to database insert format
const insertData = ProductServiceMapper.mapInputToProductInsert(input);

// Map database row to public-facing format
const publicProduct = ProductServiceMapper.mapProductRowToPublic(dbProduct);
```

### Example: CartServiceMapper

```typescript
import { CartServiceMapper } from '@/mappers/services';

// Calculate cart totals
const totals = CartServiceMapper.calculateCartTotals(cartItems);

// Map cart row to CartWithItems
const cart = CartServiceMapper.mapCartRowToCartWithItems(cartRow, items);

// Generate cart summary
const summary = CartServiceMapper.mapItemsToCartSummary(items);
```

## Guidelines

### When to Create a Mapper

Create a mapper when you need to:
1. Transform database types to application types
2. Format API responses for internal use
3. Convert between different data structures
4. Calculate derived values from data
5. Standardize data transformation logic

### Naming Conventions

- Mapper classes: `{ServiceName}Mapper` (e.g., `ProductServiceMapper`)
- Mapping methods: `map{Source}To{Target}` (e.g., `mapProductRowToPublic`)
- Calculation methods: `calculate{What}` (e.g., `calculateCartTotals`)
- Extraction methods: `extract{What}` (e.g., `extractFirstImageUrl`)
- Generation methods: `generate{What}` (e.g., `generateOrderNumber`)

### Best Practices

1. **Pure Functions**: Mappers should be pure functions without side effects
2. **Type Safety**: Always use proper TypeScript types for inputs and outputs
3. **Reusability**: Create small, focused mapping functions
4. **Documentation**: Add JSDoc comments explaining what each mapper does
5. **Testing**: Mapper functions should be easy to unit test
6. **No Business Logic**: Keep complex business logic in services, not mappers

### Example Mapper Structure

```typescript
export class ExampleServiceMapper {
  /**
   * Map database row to public format
   */
  static mapRowToPublic(row: DbRow): PublicType {
    return {
      // transformation logic
    };
  }

  /**
   * Map input to database insert format
   */
  static mapInputToInsert(input: InputType): InsertType {
    return {
      // transformation logic
    };
  }

  /**
   * Calculate derived values
   */
  static calculateTotals(items: Item[]): Totals {
    // calculation logic
  }
}
```

## Adding New Mappers

1. Create a new file in `src/mappers/services/{serviceName}Mapper.ts`
2. Export the mapper class with static methods
3. Add the export to `src/mappers/services/index.ts`
4. Update services to use the new mapper
5. Add tests for the mapper functions

## Benefits

- **Separation of Concerns**: Data transformation logic is separate from business logic
- **Reusability**: Mapping functions can be used across multiple services
- **Testability**: Pure functions are easy to test
- **Maintainability**: Centralized transformation logic is easier to update
- **Type Safety**: TypeScript ensures correct data transformations
