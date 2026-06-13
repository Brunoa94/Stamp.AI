# Cart Feature

This feature handles the shopping cart functionality following the Feature-Sliced Design (FSD) pattern.

## Structure

```
cart/
├── lib/
│   └── types/          # Feature-specific types
├── ui/                 # UI components
│   ├── CartItem/       # Cart item components
│   ├── CartList/       # Cart list components
│   ├── CartSummary/    # Cart summary components
│   ├── components/     # Shared cart UI components
│   ├── mobile/         # Mobile-specific components
│   └── sections/       # Page sections
├── index.ts            # Public API
└── README.md           # This file
```

## Architecture Notes

### Shared Dependencies

Following the project's architecture guidelines, cart-related data access and business logic are kept in shared layers:

- **Queries**: `/src/queries/cartQueries.ts` - React Query hooks for cart data fetching
- **Services**: `/src/services/cartService.ts` - Business logic for cart operations
- **Types**: `/src/types/cart.ts` - Shared cart type definitions (CartWithItems, CartItemT, etc.)

This separation allows cart functionality to be consumed by other features (checkout, navbar, etc.) without circular dependencies.

### Feature-Specific Types

Types specific to the cart feature UI (e.g., UI state, local calculations) are defined in `lib/types/cartTypes.ts`.

## Usage

```typescript
import { CartContent, CartList, CartSummary } from "@/features/cart";
import type { CartItemUpdateType } from "@/features/cart";
```

## Key Components

- **CartContent**: Main cart page content wrapper
- **CartList**: Displays list of cart items
- **CartItem**: Individual cart item with quantity controls
- **CartSummary**: Order summary with pricing breakdown
- **EmptyCart**: Empty state display

## Related Features

- **Checkout** (`/src/features/checkout`) - Consumes cart data for order processing
- **Navigation** (`/src/features/layout`) - Displays cart item count in navbar
