---
name: error-handling
description: Error handling, user-facing error messages and logging in this app. Use when writing or changing anything that can fail — async actions in components (form submits, buttons that call an API, mutations, loading data and its error state), client hooks and queries, services, API routes and edge functions — and especially payments, checkout return pages, order fulfillment, refunds, AI image generation and calls to Printify/Stripe/PayPal/Mollie/Supabase. Also use when adding timeouts, retries, idempotency, error messages, error boundaries or logging.
---

# Error Handling

## Overview

Every failure has three audiences: the user (a clear message and a way forward), the system (a consistent state, money returned when an order can't be fulfilled), and whoever debugs it (a structured log with context). Handle all three at the boundary where the failure becomes meaningful, not at every call.

**Money or orders involved** (payments, checkout return pages, fulfillment, cancellation, refunds): also read [references/payments.md](references/payments.md) for return states, idempotency, timeouts and recovery.

## Principles

- Catch errors at boundaries (route handlers, services that orchestrate a pipeline, page-level hooks), not around every call.
- Only messages wrapped in `UserFacingError` (`src/shared/errors/UserFacingError.ts`) reach the user verbatim. Everything else falls back to a generic translated message; technical messages (database, fetch, JSON) never reach an alert.
- Every error state gives the user a way forward: retry, another option, contact support, or go back.
- Cleanup runs in `finally` blocks.

## Where Errors Go

Use the app's error plumbing instead of handling errors by hand:

| Where                                         | Use                                                    | It does                                                                                   |
| --------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Services (`lib/services/`, `src/shared/services/`) | `throw ErrorClient.handleError({ error, service, action })` (`src/shared/services/errorClient.ts`) | Reports to Sentry and rethrows an `AppError` carrying service/action context and the error code |
| Client hooks, queries, mutations              | `handleError(error)` from `useErrorHandler` (`src/shared/hooks/useErrorHandler.ts`) | Shows the translated message for a known `ErrorCodeT`, a `UserFacingError`'s message, or the generic message; toasts it and reports to Sentry |
| Render errors                                 | `<ErrorBoundary componentName="…">` (`src/shared/ui/ErrorBoundary/`) around risky subtrees | Reports and shows a retryable fallback; `GlobalErrorBoundary` already wraps the app in `src/app/layout.tsx` |
| API routes, edge boundaries                   | `captureError(error, { service, action })` (`src/lib/observability/errorCapture.ts`) | Reports to Sentry; the route then returns an error code the client can translate |

- A message for the user is either an `ErrorCodeT` (add it to `ERROR_CODES` and `errors.<CODE>` in the message catalog) or a `UserFacingError(t("…"))`. A plain `new Error(t("…"))` passed to `handleError` shows the generic message.
- Never call `toast.error` directly; `handleError` is the only error toast. Enforced by ESLint (`no-restricted-properties`).

## Async Actions in Components

The component stays presentational: the request, its error handling and the pending flag live in a hook (`lib/hooks/`, or a mutation in `src/shared/queries/`), and the component renders what the hook returns.

- **Failures go through `handleError`**: in the mutation's `onError`, or a `try/catch` around `mutateAsync`. Pass the error as it arrived so a known `ErrorCodeT` or `UserFacingError` message survives; rewrapping it in `new Error(…)` turns it into the generic message.
- **One place for the message**: a toast by default. For a form, show it in the form instead, and turn the toast off so it doesn't appear twice:

  ```ts
  const { handleError } = useErrorHandler({ showToast: false });
  // …
  } catch (error) {
    setError("root", { message: handleError(error).message });
  }
  ```

- **Pending state**: disable the trigger and show progress while the action runs. When a repeat would do harm (cancel, pay, submit), guard it with a ref set synchronously, because `isPending` only updates after a re-render (see `useCancelOrder`).
- **Loading data**: a query's `isError` renders an error state with a retry that calls `refetch`; how it looks is in the `frontend-ui-engineering` skill.
- **Render errors**: wrap a subtree that can throw while rendering (third-party widgets, parsing user or remote content) in `<ErrorBoundary componentName="…">`.

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

- `catch (e) {}` or a catch that logs and continues as if the operation succeeded
- `error.message` from a service shown directly to the user (`toast.error(error.message)`, `setError(error.message)`)
- `handleError(new Error(t("…")))`: use `new UserFacingError(t("…"))`, or the user sees the generic message
- An async action in a component with no pending state, or a button that stays clickable while its request runs
- The same error shown twice (toast and inline)
- `console.log` instead of the logger

## Verification

- [ ] Each failure path has a test (for a component's action: the hook test makes the request fail and asserts what the user sees)
- [ ] User-facing messages are `ErrorCodeT`s or `UserFacingError`s and tell the user what happens next
- [ ] Async actions show a pending state and can't run twice when a repeat would do harm
- [ ] Logs include `action` and the relevant IDs
- [ ] Money or orders involved: the checklist in [references/payments.md](references/payments.md)
