# Checkout Feature

A complete checkout flow implementation following Feature Slice Design (FSD) architecture pattern.

## Architecture

This feature follows the **Feature Slice Design (FSD)** pattern, providing clear separation of concerns and scalable structure.

```
checkout/
├── ui/                      # UI Layer - All visual components
│   ├── sections/            # Page sections (billing, shipping, payment, summary)
│   ├── components/          # Shared checkout components (loading, error, dialogs)
│   ├── PaymentMethodSelector/   # Payment method selection UI
│   ├── PayPalButton/        # PayPal integration UI
│   ├── PaymentSuccess/      # Success screen
│   ├── paymentForm/         # Stripe payment form
│   ├── productCustomization/    # Product customization flow
│   └── CheckoutPageContent.tsx  # Main page component
│
├── lib/                     # Lib Layer - Business logic & utilities
│   ├── hooks/               # Custom hooks (pricing, submission, customization)
│   └── mappers/             # Data transformation utilities
│
├── model/                   # Model Layer - State management & types
│   └── context/             # React Context for form state
│
├── api/                     # API Layer - External API calls (empty for now)
│
├── config/                  # Config Layer - Feature configuration (empty for now)
│
└── index.ts                 # Public API - Main feature exports
```

---

## FSD Layers Explained

### 1. **UI Layer** (`/ui`)
Contains all visual components and presentation logic.

**Sections** (`/ui/sections/`):
- `BillingAddressSection.tsx` - Billing address form
- `ShippingAddressSection.tsx` - Optional shipping address form
- `ShippingAddressToggle.tsx` - Toggle for separate shipping address
- `PaymentMethodSection.tsx` - Payment method selection and forms
- `OrderSummarySection.tsx` - Order summary sidebar with pricing
- `CheckoutHeaderSection.tsx` - Page header component

**Components** (`/ui/components/`):
- `CheckoutLoading.tsx` - Loading state
- `CheckoutError.tsx` - Error display
- `CheckoutHeader.tsx` - Header with navigation
- `PaymentError.tsx` - Payment failure screen
- `VerifyPayment.tsx` - Payment verification screen
- `PromoCodeInput.tsx` - Promo code input field
- And more...

**Payment Components**:
- `PaymentMethodSelector/` - Payment method radio buttons
- `PayPalButton/` - PayPal integration with custom button
- `paymentForm/` - Stripe Elements integration
- `PaymentSuccess/` - Success confirmation screen

**Product Customization**:
- `productCustomization/` - Product customization wizard

### 2. **Lib Layer** (`/lib`)
Business logic, utilities, and hooks that don't depend on UI.

**Hooks** (`/lib/hooks/`):
- `useCheckoutPricing.ts` - Calculate subtotal, discount, total
- `usePaymentSubmission.ts` - Handle payment submission logic
- `useCustomization.ts` - Product customization state
- `useProductCustomizer.ts` - Product customizer workflow

**Mappers** (`/lib/mappers/`):
- `printifyLineItemsMapper.ts` - Transform cart items to Printify format
- `customization/` - Customization mapping utilities
  - `orderItemCustomizationMapper.ts` - Map order items to customization format
  - `orderCustomizationMapper.ts` - Map orders to customization format (fallback)
  - `types.ts` - Type definitions for mappers
  - `index.ts` - Barrel exports

### 3. **Model Layer** (`/model`)
State management and type definitions.

**Context** (`/model/context/`):
- `CheckoutFormContext.tsx` - React Hook Form state management
  - Form schema with Zod validation
  - Billing/shipping address fields
  - Payment method selection
  - Promo code field

**Types**:
- `CheckoutFormData` - Main form data type
- Exported from context file

---

## Usage

### Importing from Checkout Feature

Always import from the main feature export (`index.ts`), not from internal paths:

```typescript
// ✅ Correct - Import from feature root
import { CheckoutPageContent, useCheckoutPricing } from "@/features/checkout";

// ❌ Wrong - Don't import from internal paths
import { CheckoutPageContent } from "@/features/checkout/ui/CheckoutPageContent";
```

### Available Exports

```typescript
// UI Components
import { CheckoutPageContent } from "@/features/checkout";

// Model - Types & Context
import type { CheckoutFormData } from "@/features/checkout";
import { CheckoutFormProvider, useCheckoutFormContext } from "@/features/checkout";

// Lib - Hooks & Utilities
import {
  useCheckoutPricing,
  usePaymentSubmission,
  buildPrintifyLineItems,
} from "@/features/checkout";
```

---

## How It Works

### 1. Checkout Flow

```
User → CheckoutPage
         ↓
    CheckoutPageContent (Protected Route)
         ↓
    CheckoutFormProvider (React Hook Form + Zod)
         ↓
    ┌─────────────────────────────────────┐
    │   Billing Address Section           │
    │   Shipping Address Toggle            │
    │   Shipping Address Section (optional)│
    │   Payment Method Section             │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │   Order Summary (Sidebar)           │
    │   - Cart Items                      │
    │   - Promo Code Input                │
    │   - Price Breakdown                 │
    │   - Submit Button                   │
    └─────────────────────────────────────┘
         ↓
    Payment Submission (Stripe or PayPal)
         ↓
    ┌─────────────────────────────────────┐
    │   Verification Page                 │
    │   - stripe-return or paypal-return  │
    └─────────────────────────────────────┘
         ↓
    Success or Error Screen
```

### 2. Form State Management

Uses **React Hook Form** with **Zod** validation:

```typescript
const CheckoutFormSchema = z.object({
  billing: ShippingAddressSchema,           // Required billing address
  useShippingAddress: z.boolean(),          // Toggle for separate shipping
  shipping: ShippingAddressSchema.optional(), // Optional shipping address
  paymentMethod: z.enum(["stripe", "paypal"]), // Payment method choice
  promoCode: z.string().optional(),         // Optional promo code
});
```

### 3. Pricing Calculation

The `useCheckoutPricing` hook handles:
- Subtotal calculation from cart items
- Shipping cost (always free)
- Promo code validation and discount application
- Total calculation

### 4. Payment Submission

The `usePaymentSubmission` hook:
1. Builds Printify line items from cart
2. Determines shipping address (billing or separate)
3. Stores checkout data in localStorage
4. Routes to appropriate payment handler (Stripe or PayPal)

---

## Key Benefits of FSD Architecture

### ✅ Scalability
- Easy to add new sections, components, or hooks
- Clear structure prevents code sprawl
- Each layer has a single responsibility

### ✅ Maintainability
- Easy to locate code by feature and layer
- Prevents circular dependencies
- Clear import paths

### ✅ Testability
- Business logic (lib) is separate from UI
- Easy to mock and test each layer independently
- Clear boundaries between layers

### ✅ Reusability
- Components in UI layer are composable
- Hooks in lib layer are feature-agnostic
- Mappers can be used across the application

### ✅ Developer Experience
- Intuitive folder structure
- Clear naming conventions
- Self-documenting architecture

---

## Adding New Features

### Adding a New Section

1. Create component in `/ui/sections/`:
```typescript
// /ui/sections/ShippingMethodSection.tsx
export function ShippingMethodSection() {
  // Component logic
}
```

2. Export from `/ui/sections/index.ts`:
```typescript
export { ShippingMethodSection } from "./ShippingMethodSection";
```

3. Use in `CheckoutPageContent.tsx`:
```typescript
import { ShippingMethodSection } from "./sections";
```

### Adding a New Hook

1. Create hook in `/lib/hooks/`:
```typescript
// /lib/hooks/useShippingMethods.ts
export function useShippingMethods() {
  // Hook logic
}
```

2. Export from `/lib/hooks/index.ts`:
```typescript
export { useShippingMethods } from "./useShippingMethods";
```

3. Export from main `/lib/index.ts`:
```typescript
export { useShippingMethods } from "./hooks";
```

---

## Migration from Old Structure

The checkout feature was refactored from a flat structure to FSD:

**Before:**
```
checkout/
├── components/
├── sections/
├── hooks/
├── context/
├── mappers/
├── PaymentMethodSelector/
├── PayPalButton/
├── paymentForm/
└── CheckoutPageContent.tsx
```

**After (FSD):**
```
checkout/
├── ui/                      # Everything visual
│   ├── atoms/               # Basic building blocks (NEW)
│   ├── molecules/           # Composed components (NEW)
│   ├── sections/            # Page sections
│   └── components/          # Shared components
├── lib/                     # Business logic
│   ├── services/            # Business services (NEW)
│   ├── hooks/               # Custom hooks
│   └── mappers/             # Data transformers
├── model/                   # State & types
├── api/                     # API calls
└── config/                  # Configuration
```

**Import Changes:**
- `@/features/checkout/CheckoutPageContent` → `@/features/checkout`
- `@/features/checkout/components` → `@/features/checkout/ui/components`
- `@/features/checkout/hooks` → `@/features/checkout/lib/hooks`
- `@/features/checkout/context` → `@/features/checkout/model`

---

## Design System Integration

The checkout uses components from the global design system (`@/features/ui/`):
- Button, Input, Label, Checkbox, Select
- All styled with the app's theme system
- Glass morphism effects, purple/cyan gradients
- Consistent typography and spacing

---

## Testing Strategy

**Unit Tests:**
- Test hooks in isolation (`lib/hooks/`)
- Test mappers with sample data (`lib/mappers/`)
- Test form validation (Zod schemas)

**Integration Tests:**
- Test section components with form context
- Test pricing calculations with cart data
- Test payment submission flow

**E2E Tests:**
- Full checkout flow (billing → payment → success)
- Promo code application
- Error handling scenarios

---

## Future Enhancements

1. **API Layer**: Extract payment API calls to `/api` folder
2. **Config Layer**: Move payment provider config to `/config`
3. **Shared Types**: Extract common types to `/model/types.ts`
4. **Error Boundary**: Add feature-level error boundary
5. **Lazy Loading**: Code-split payment forms

---

## Related Documentation

- [Feature Slice Design Pattern](https://feature-sliced.design/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [PayPal Integration](https://developer.paypal.com/)

---

## Recent Improvements (2026-06-05)

### Atomic Design Refactoring

The checkout feature has been refactored to follow **Atomic Design** principles within the FSD structure:

**New Structure:**
- **Atoms** (`/ui/atoms/`) - Basic building blocks
  - `SectionCard` - Consistent section wrapper with glass-card styling
  - `PriceRow` - Single price line item component

- **Molecules** (`/ui/molecules/`) - Composed components
  - `AddressForm` - Generic address form (eliminates duplication between billing/shipping)
  - `CartItemsList` - Cart items display with images
  - `PriceBreakdown` - Complete price breakdown using PriceRow atoms
  - `StripeCardForm` - Stripe card input with test mode support

**Benefits Achieved:**
- ✅ **85-90% reduction** in code duplication (BillingAddressSection & ShippingAddressSection now reuse AddressForm)
- ✅ **40-60% reduction** in component size:
  - BillingAddressSection: 92 → 17 lines
  - ShippingAddressSection: 98 → 26 lines
  - PaymentMethodSection: 83 → 53 lines
  - OrderSummarySection: 156 → 90 lines
- ✅ **Better separation of concerns** - Services layer extracted from hooks
- ✅ **Improved testability** - Smaller, focused components and services

### Service Layer

New business logic services (`/lib/services/`):
- `CheckoutStorageService` - Centralized localStorage operations with expiration handling
- `CheckoutDataBuilder` - Data transformation and checkout data preparation

### Updated Hooks

- `usePaymentSubmission` - Refactored to use service layer (localStorage operations extracted)

---

**Last Updated:** 2026-06-05
**Architecture:** Feature Slice Design (FSD) + Atomic Design
**State Management:** React Hook Form + Zod
**Styling:** Tailwind CSS + Custom Theme System
