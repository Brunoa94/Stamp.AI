/**
 * Unified API Response Utilities
 *
 * Provides consistent error and success response formats
 * for all API routes. Includes request ID correlation
 * and structured error details.
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ErrorCodeT } from "@/shared-types";
import { REQUEST_ID_HEADER } from "./requestId";
import { captureError, ErrorContext } from "./errorCapture";
import { createLogger } from "./logger";

const logger = createLogger({ service: "api" });

/**
 * Standardized error response structure
 */
export interface ApiErrorResponse {
  error: {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details (optional) */
    details?: Record<string, unknown>;
    /** Request ID for support/debugging */
    requestId?: string;
  };
}

/**
 * Standardized success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  /** Request ID for correlation */
  requestId?: string;
}

/**
 * Options for creating error responses
 */
export interface ErrorResponseOptions {
  /** Error code (from ErrorCodeT or custom) */
  code: ErrorCodeT | string;
  /** Human-readable message */
  message: string;
  /** HTTP status code */
  status: number;
  /** Additional details to include */
  details?: Record<string, unknown>;
  /** Original error (for logging/capture) */
  error?: unknown;
  /** Context for error capture */
  context?: Omit<ErrorContext, "requestId">;
  /** Whether to capture to observability service */
  capture?: boolean;
}

/**
 * Options for creating success responses
 */
export interface SuccessResponseOptions<T> {
  /** Response data */
  data: T;
  /** HTTP status code (default: 200) */
  status?: number;
  /** Additional headers */
  headers?: Record<string, string>;
}

/**
 * Get request ID from current request context
 */
async function getRequestId(): Promise<string | undefined> {
  try {
    const headersList = await headers();
    return headersList.get(REQUEST_ID_HEADER) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Create a standardized error response
 *
 * @param options - Error response options
 * @returns NextResponse with error body and appropriate status
 *
 * @example
 * ```ts
 * // In an API route
 * if (!user) {
 *   return createErrorResponse({
 *     code: "UNAUTHORIZED",
 *     message: "Authentication required",
 *     status: 401,
 *   });
 * }
 *
 * // With error capture
 * try {
 *   await processPayment();
 * } catch (error) {
 *   return createErrorResponse({
 *     code: "PAYMENT_FAILED",
 *     message: "Failed to process payment",
 *     status: 500,
 *     error,
 *     capture: true,
 *     context: { service: "PaymentService", action: "processPayment" },
 *   });
 * }
 * ```
 */
export async function createErrorResponse(
  options: ErrorResponseOptions
): Promise<NextResponse<ApiErrorResponse>> {
  const {
    code,
    message,
    status,
    details,
    error,
    context = {},
    capture = true,
  } = options;

  const requestId = await getRequestId();

  // Log the error
  logger.error(message, {
    action: context.action || "api_error",
    error,
    metadata: {
      code,
      status,
      details,
      ...context.metadata,
    },
  });

  // Capture to observability service
  if (capture && error) {
    captureError(error, {
      ...context,
      errorCode: code as ErrorCodeT,
      requestId,
    });
  }

  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      ...(details && { details }),
      ...(requestId && { requestId }),
    },
  };

  return NextResponse.json(body, {
    status,
    headers: requestId ? { [REQUEST_ID_HEADER]: requestId } : undefined,
  });
}

/**
 * Create a standardized success response
 *
 * @param options - Success response options
 * @returns NextResponse with success body
 *
 * @example
 * ```ts
 * const order = await createOrder(data);
 * return createSuccessResponse({
 *   data: { orderId: order.id, status: order.status },
 * });
 * ```
 */
export async function createSuccessResponse<T>(
  options: SuccessResponseOptions<T>
): Promise<NextResponse<ApiSuccessResponse<T>>> {
  const { data, status = 200, headers: customHeaders = {} } = options;

  const requestId = await getRequestId();

  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(requestId && { requestId }),
  };

  return NextResponse.json(body, {
    status,
    headers: {
      ...customHeaders,
      ...(requestId && { [REQUEST_ID_HEADER]: requestId }),
    },
  });
}

/**
 * Common error response helpers
 */
export const ApiErrors = {
  /** 400 Bad Request - Invalid input */
  badRequest: (message: string, details?: Record<string, unknown>) =>
    createErrorResponse({
      code: "BAD_REQUEST",
      message,
      status: 400,
      details,
      capture: false, // Don't capture validation errors
    }),

  /** 401 Unauthorized - Not authenticated */
  unauthorized: (message = "Authentication required") =>
    createErrorResponse({
      code: "UNAUTHORIZED",
      message,
      status: 401,
      capture: false,
    }),

  /** 403 Forbidden - Not authorized */
  forbidden: (message = "Access denied") =>
    createErrorResponse({
      code: "FORBIDDEN",
      message,
      status: 403,
      capture: false,
    }),

  /** 404 Not Found - Resource not found */
  notFound: (resource = "Resource") =>
    createErrorResponse({
      code: "NOT_FOUND",
      message: `${resource} not found`,
      status: 404,
      capture: false,
    }),

  /** 409 Conflict - Resource conflict */
  conflict: (message: string) =>
    createErrorResponse({
      code: "CONFLICT",
      message,
      status: 409,
      capture: false,
    }),

  /** 422 Unprocessable Entity - Business logic error */
  unprocessable: (code: string, message: string, details?: Record<string, unknown>) =>
    createErrorResponse({
      code,
      message,
      status: 422,
      details,
      capture: false,
    }),

  /** 429 Too Many Requests - Rate limited */
  rateLimited: (retryAfter?: number) =>
    createErrorResponse({
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later.",
      status: 429,
      details: retryAfter ? { retryAfter } : undefined,
      capture: false,
    }),

  /** 500 Internal Server Error - Unexpected error */
  internal: (error: unknown, context?: Omit<ErrorContext, "requestId">) =>
    createErrorResponse({
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      status: 500,
      error,
      context,
      capture: true,
    }),

  /** 502 Bad Gateway - External service error */
  externalService: (
    serviceName: string,
    error: unknown,
    context?: Omit<ErrorContext, "requestId">
  ) =>
    createErrorResponse({
      code: `${serviceName.toUpperCase()}_API_ERROR`,
      message: `${serviceName} service error`,
      status: 502,
      error,
      context: { ...context, service: serviceName },
      capture: true,
    }),

  /** 503 Service Unavailable - Service temporarily unavailable */
  unavailable: (message = "Service temporarily unavailable") =>
    createErrorResponse({
      code: "SERVICE_UNAVAILABLE",
      message,
      status: 503,
      capture: true,
    }),
};
