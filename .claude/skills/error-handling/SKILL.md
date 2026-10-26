---
name: error-handling
description: Error handling, recovery and logging in this app. Use when writing or changing code that can fail in ways users or money depend on — payments, checkout return pages, order fulfillment, refunds, AI image generation, calls to Printify/Stripe/PayPal/Mollie/Supabase — or when adding timeouts, retries, idempotency, user-facing error messages or logging.
---

# Error Handling

## Overview

Every failure has three audiences: the user (a clear message and a way forward), the system (a consistent state, money returned when an order can't be fulfilled), and whoever debugs it (a structured log with context). Handle all three at the boundary where the failure becomes meaningful, not at every call.

## Principles

- Catch errors at boundaries (route handlers, services that orchestrate a pipeline, page-level hooks), not around every call.
- Only messages wrapped in `UserFacingError` (`src/features/checkout/lib/errors/UserFacingError.ts`) reach the user verbatim. Everything else falls back to a generic translated message; technical messages (database, fetch, JSON) never reach an alert.
- Every error state gives the user a way forward: retry, another payment method, contact support (with the payment ID), or go back.
- Cleanup runs in `finally` blocks.

## Payment Return States

Payment return pages use `PaymentReturnStatusT` (`src/features/checkout/lib/types/paymentReturn.ts`):

| Status       | Meaning                                         | User sees                                 |
| ------------ | ----------------------------------------------- | ----------------------------------------- |
| `loading`    | Verifying the payment                           | Spinner                                   |
| `processing` | Payment captured, order being created           | Progress                                  |
| `pending`    | Provider hasn't settled yet (e.g. bank transfer) | "We'll email you when it's confirmed"     |
| `success`    | Order created                                   | Confirmation with order number            |
| `failed`     | Retryable (declined card, insufficient funds)   | Reason + "Try again" / other methods      |
| `cancelled`  | User cancelled at the provider                  | Back to checkout                          |
| `error`      | Non-retryable system error                      | Support contact with the payment ID       |

## Idempotency

The guarantee lives on the server. Client-side locks only prevent double work in one tab.

1. **Idempotency key per payment**: `${provider}_${paymentId}`. Before acting, look it up (`OrderService.getOrderByIdempotencyKey`) and return the existing result if the work is done. See `orderFulfillmentService.ts`.
2. **The database enforces it**: `orders.idempotency_key` has a unique index; payment capture, cancellation and refunds go through atomic RPCs (see `supabase/migrations/*atomic*`). A second concurrent request fails on the constraint instead of creating a duplicate.
3. **External calls tolerate repeats**: treat "already fulfilled" from Printify as success (`isAlreadyFulfilledError`); webhooks (`supabase/functions/*-webhook`) settle through the same rules as the return page (`_shared/orderFinalizationRules.ts`).
4. **Client guard (UX only)**: `PaymentFinalizationLockService` (sessionStorage) stops a refresh or a second mount from starting the pipeline again in the same tab. Never rely on it for correctness: other tabs, devices and webhooks don't see it.

When adding a new operation that moves money or creates an order: add the key, the unique constraint or atomic RPC, and a test that runs the operation twice and asserts one effect.

## Timeouts

Wrap long pipelines with `withTimeout` from `@/lib/promiseUtils` and a specific error class, then handle that class explicitly:

```ts
try {
  return await withTimeout(runPipeline(), PAYMENT_PIPELINE_TIMEOUT_MS, new PaymentPipelineTimeoutError(PAYMENT_PIPELINE_TIMEOUT_MS));
} catch (pipelineError) {
  if (pipelineError instanceof PaymentPipelineTimeoutError) {
    await refund(`${provider} checkout pipeline timed out`);
  }
  throw pipelineError;
}
```

The timeout error extends `UserFacingError`, so its message (refund initiated, when it arrives) is safe to show.

## Recovery

When a paid order can't be fulfilled, leave the system consistent and the user whole:

- Record the payment for recovery before creating the order (`recordPaymentRecoverySafely`), so a crash mid-pipeline can be reconciled.
- On failure after payment: mark the order failed, trigger a refund, and tell the user a refund was initiated.
- Recovery steps must not throw over the original error: catch, log, continue.

```ts
try {
  await createPrintifyOrder();
} catch (error) {
  await markOrderFailed(orderId); // catches and logs its own errors
  await refund("Printify fulfillment failed");
  throw new UserFacingError("Order fulfillment failed. A full refund has been initiated.");
}
```

## Validate Early

Check required data before starting work, and make the message actionable. If money has already moved, include the payment ID so support can find it:

```ts
if (!cartId) {
  throw new UserFacingError(
    `Your payment was captured but we couldn't find your cart. Please contact support with payment ID ${paymentId}.`,
  );
}
```

## Logging

Use the structured logger in `src/lib/observability/logger.ts`, never bare `console.log`:

```ts
import { createLogger, loggers } from "@/lib/observability/logger";

const logger = createLogger({ service: "OrderFulfillment" }); // or loggers.payment, loggers.order…

logger.error("Printify order failed", {
  action: "createPrintifyOrder",
  error,
  metadata: { orderId, provider, paymentId },
});
```

- `error` for failures, `warn` for recoverable or unexpected states, `info` for milestones, `debug` for tracing.
- Always include `action` and the IDs needed to find the record (order, payment, user). Never log card data, tokens or full addresses.
- The stamp feature has its own thin wrapper (`src/features/stamp/lib/helpers/stampLogger.ts`); use it inside that feature.

## Red Flags

- An `await` to a payment provider, Printify or Supabase with no error path
- A new money-moving operation without an idempotency key and a database constraint
- Idempotency that only exists in `sessionStorage` or React state
- `catch (e) {}` or a catch that logs and continues as if the operation succeeded
- `error.message` from a service shown directly to the user
- Recovery code (refund, mark failed) that can throw and hide the original error

## Verification

- [ ] Every failure path has a test: retryable, non-retryable, timeout
- [ ] Money-moving operations are tested for a repeat (same key twice → one effect)
- [ ] User-facing messages are `UserFacingError`s and tell the user what happens next
- [ ] Logs include `action` and the relevant IDs
