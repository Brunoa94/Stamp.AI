# Payments, Orders and Refunds

Read this when the code moves money or creates, fulfills, cancels or refunds an order. The general rules in `../SKILL.md` still apply.

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

## Red Flags

- An `await` to a payment provider, Printify or Supabase with no error path
- A new money-moving operation without an idempotency key and a database constraint
- Idempotency that only exists in `sessionStorage` or React state
- Recovery code (refund, mark failed) that can throw and hide the original error

## Verification

- [ ] Every failure path has a test: retryable, non-retryable, timeout
- [ ] Money-moving operations are tested for a repeat (same key twice → one effect)
