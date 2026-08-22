# Imaginary Builder AI - Documentation

This documentation defines the architectural patterns, coding standards, and best practices for the Imaginary Builder AI project.

## Table of Contents

- [Types & Interfaces](#types--interfaces)
- [Components](#components)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [General Guidelines](#general-guidelines)

---

## Types & Interfaces

### Type Definitions

- **All data must be typed** - Every piece of data flowing through the application requires explicit type definitions.
- **Always grant that the types derived from the database follow the schemas there implemented** - Types that have the same structure that in the database must infer the types generated from the database
- **Type organization**:
  - Feature-specific types: `src/features/[feature-name]/types/`
  - Shared types: `src/types/` or `src/shared/types/`
- **Naming convention**: All type names must include the `Type` suffix.
  - Example: `UserType`, `ProductType`, `ConfigType`

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
type UserType = {
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

- **Styling approach**:
  - Prefer component `variants` for styling.
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
src/features/homepage/ui/components/ProcessTimeline/
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
  ├── lib/             # Non-component code
  │   ├── helpers/     # Helper functions
  │   ├── constants/   # Constants and static data
  │   ├── types/       # Feature-specific types
  │   ├── hooks/       # Custom hooks
  │   ├── mappers/     # Data transformation functions
  │   ├── services/    # Business logic services
  │   └── utils/       # Utility functions
  └── index.ts         # Public API (optional)
  ```

### Separation of Concerns in Folders

**IMPORTANT**: Keep a strict separation between UI and non-UI code:

1. **`ui/` folder**: Contains ONLY React components (`.tsx` files)
   - Components organized in subfolders by purpose
   - No helper functions, constants, or types directly in component folders

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
src/features/homepage/ui/components/ProcessTimeline/
├── ProcessStickyCarousel.tsx
├── ProcessStepper.tsx
└── processAnimationHelpers.ts   # Wrong location!
```

#### Good Example

```
// ✅ GOOD: Helper in lib/helpers, components in ui/components
src/features/homepage/
├── ui/
│   └── components/
│       └── ProcessTimeline/
│           ├── ProcessStickyCarousel.tsx
│           └── ProcessStepper.tsx
└── lib/
    └── helpers/
        └── processAnimationHelpers.ts
```

### Core Architecture Layers

The project is organized into three primary layers:

1. **UI Layer** (`src/features/*/ui/`) - Presentational components
2. **Queries Layer** (`src/queries/`) - Data fetching and caching logic
3. **Services Layer** (`src/services/`) - Business logic and external integrations

### File Organization

- Keep features self-contained and decoupled.
- Share common utilities in `src/shared/`.
- Follow consistent naming conventions across features.
- **Never place helper functions, constants, or types inside `ui/` folders.**

---

## Performance Optimization

- **React hooks**: Use performance hooks (`useCallback`, `useMemo`, `React.memo`) only when:
  - Profiling shows measurable performance issues
  - Handling expensive computations
  - Preventing unnecessary re-renders in large lists
- **Avoid premature optimization** - Measure first, optimize second.

---

## Error Handling

### Core Principles

- All error handling must follow the project's **ErrorHandling** implementation.
- Errors should be caught at appropriate boundaries.
- User-facing errors must provide clear, actionable messages.
- Always provide recovery paths for users when errors occur.

### Error Handling Patterns

#### 1. **Payment & Transaction Errors**

For payment processing, implement comprehensive error states with recovery mechanisms:

**Required Error States:**
- `loading` - Initial state, verifying data
- `processing` - Payment being processed
- `success` - Transaction completed successfully
- `failed` - Retryable failure (declined card, insufficient funds)
- `error` - Non-retryable system error
- `cancelled` - User cancelled the transaction

**Example Pattern** (from payment return pages):

```typescript
type PageStatus = "loading" | "processing" | "success" | "failed" | "error" | "cancelled";

const [status, setStatus] = useState<PageStatus>("loading");
const [errorMessage, setErrorMessage] = useState<string | null>(null);

// Handle different error types
if (captureData.code === "INSTRUMENT_DECLINED" || captureData.isRetryable) {
  setStatus("failed"); // Retryable - show "Try Again" option
  setErrorMessage(captureData.error || "Your payment method was declined.");
} else {
  setStatus("error"); // Non-retryable - show support contact
  setErrorMessage("Failed to process payment. Please contact support.");
}
```

**User-Facing Error UI:**
- Display clear error reason
- Provide actionable next steps
- Show alternative payment methods for failed payments
- Include support contact information for system errors

#### 2. **Idempotency & Race Condition Prevention**

Always implement idempotency checks to prevent duplicate operations:

```typescript
// Check if operation already completed
const finalizationDoneKey = `operation_finalized_${uniqueId}`;
const finalizationLockKey = `operation_finalizing_${uniqueId}`;

if (sessionStorage.getItem(finalizationDoneKey) === "true") {
  setStatus("success");
  return;
}

if (sessionStorage.getItem(finalizationLockKey) === "true") {
  return; // Already processing
}

sessionStorage.setItem(finalizationLockKey, "true");

try {
  // Perform operation
  await processOperation();

  sessionStorage.setItem(finalizationDoneKey, "true");
  sessionStorage.removeItem(finalizationLockKey);
} catch (error) {
  sessionStorage.removeItem(finalizationLockKey);
  throw error;
}
```

#### 3. **Timeout Handling**

Implement timeouts for long-running operations with proper cleanup:

```typescript
class PipelineTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Operation timed out after ${Math.round(timeoutMs / 1000)} seconds. ` +
      `Please contact support if the issue persists.`
    );
    this.name = "PipelineTimeoutError";
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new PipelineTimeoutError(ms)),
      ms
    );
  });

  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timeoutId)
  );
}

// Usage
try {
  await withTimeout(longRunningOperation(), 120_000); // 2 minutes
} catch (error) {
  if (error instanceof PipelineTimeoutError) {
    // Handle timeout specifically
    await triggerCleanup();
  }
  throw error;
}
```

#### 4. **Graceful Degradation & Recovery**

When operations fail, implement recovery mechanisms:

```typescript
const triggerRefund = async (reason: string) => {
  try {
    await RefundService.processRefund({
      orderId: orderId || `temp_${transactionId}`,
      paymentProvider: "stripe",
      amount,
      reason,
    });
    console.log(`✅ Refund triggered`);
  } catch (refundError) {
    console.error("❌ Refund initiation failed:", refundError);
    // Log to failure tracking system
  }
};

const markOrderFailed = async (orderId: string, status: string) => {
  try {
    await updateOrderStatus({ orderId, status });
    console.log(`✅ Order marked as ${status}`);
  } catch (updateError) {
    console.error(`❌ Failed to update order:`, updateError);
  }
};

// Use in error scenarios
try {
  await createPrintifyOrder();
} catch (error) {
  await markOrderFailed(orderId, "unsuccessful_confirmation");
  await triggerRefund("Fulfillment failed");
  throw new Error("Order fulfillment failed. A full refund has been initiated.");
}
```

#### 5. **Data Validation Errors**

Validate critical data early and provide clear error messages:

```typescript
// Validate required data
if (!cartId) {
  setStatus("error");
  setErrorMessage(
    "Cart information not found. Your payment was captured but we couldn't create your order. " +
    "Please contact support with payment ID: " + paymentIntentId
  );
  return;
}

if (!user) {
  setStatus("error");
  setErrorMessage(
    "You must be logged in to complete your order. Please log in and try again."
  );
  return;
}
```

### Logging System Pattern

When implementing logging in features, follow this structured approach:

1. **Create feature-specific loggers** with consistent context prefixes
2. **Use three log levels**:
   - `logError()` - For exceptions and critical failures
   - `logWarning()` - For recoverable issues or unexpected states
   - `logInfo()` - For debugging and tracing execution flow
3. **Always include**:
   - Context (function/component name)
   - Relevant data for debugging
   - Structured additional info as objects

**Example** (from stamp-brutalist feature):

```typescript
// lib/helpers/logger.ts
export function logStampError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>,
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Stamp Flow - ${context}]`, {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalInfo,
  });
}

// Usage in components/hooks
logStampError("handleCreateProduct", error, {
  blueprintId: formData.blueprintId,
  userId: user?.id,
});
```

**Reference**: See [`src/features/stamp-brutalist/lib/helpers/logger.ts`](../src/features/stamp-brutalist/lib/helpers/logger.ts) for complete implementation.

### Error Handling Checklist

When implementing error handling, ensure:

- ✅ All possible error states are defined and handled
- ✅ User-facing errors provide clear, actionable messages
- ✅ Recovery mechanisms are in place (retry, refund, rollback)
- ✅ Idempotency is implemented for critical operations
- ✅ Timeouts are set for long-running operations
- ✅ Errors are logged with sufficient context for debugging
- ✅ Race conditions are prevented with proper locks
- ✅ Cleanup operations run in finally blocks
- ✅ Users have clear paths forward (retry, contact support, go back)

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
