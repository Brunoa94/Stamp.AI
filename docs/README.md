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

- **Use the design system**: Always leverage existing UI components from the design system instead of creating custom HTML elements.
- **Use Next.js Image component**: Always use `next/image` for images instead of `<img>` tags for better performance and optimization.
  - Exception: Only use `<img>` for external/dynamic URLs that can't be optimized or when Image component causes issues.
- **Styling approach**:
  - Prefer component `variants` for styling.
  - Only add custom styles when absolutely necessary for specific use cases.
  - **Avoid inline styles** - use Tailwind classes instead. Only use inline `style` attributes for dynamic values that cannot be expressed with Tailwind (e.g., animation delays, dynamic widths from state).
- **Avoid premature optimization**: Only use `useCallback`, `useMemo`, or `React.memo` for heavy computations or proven performance bottlenecks.

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

- **Reference implementation**: See [`src/features/stamp-brutalist/`](../src/features/stamp-brutalist/) as a complete example.
- **Feature structure**:
  ```
  src/features/[feature-name]/
  ├── ui/              # UI components
  ├── model/           # State management, business logic
  ├── api/             # API calls, queries
  ├── types/           # Feature-specific types
  └── index.ts         # Public API
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
- **No usage of index.ts**: Don't use index.ts for the files exports.

---

## Contributing

When adding new features or modifying existing code:

1. Follow the established patterns in existing features.
2. Maintain consistency with the Feature-Sliced Design architecture.
3. Document significant architectural decisions.
4. Ensure all code is properly typed.

For questions or clarifications, refer to existing implementations or consult the team.
