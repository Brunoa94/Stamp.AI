/**
 * Error Capture Module
 *
 * Provides a unified interface for capturing and reporting errors
 * to observability services (Sentry, DataDog, etc.)
 *
 * This module acts as an abstraction layer, allowing easy integration
 * with any observability provider without changing application code.
 */

import { ErrorCodeT } from "@/shared-types";

/**
 * Context to attach to captured errors
 */
export interface ErrorContext {
  /** Error code from the application's error system */
  errorCode?: ErrorCodeT;
  /** Service/feature that generated the error */
  service?: string;
  /** Action being performed when error occurred */
  action?: string;
  /** Component name (for React errors) */
  componentName?: string;
  /** Component stack trace */
  componentStack?: string;
  /** Request ID for correlation */
  requestId?: string;
  /** User ID (if authenticated) */
  userId?: string;
  /** User email (if available) */
  userEmail?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * User context for error attribution
 */
export interface UserContext {
  id: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Severity levels for error reporting
 */
export type ErrorSeverity = "fatal" | "error" | "warning" | "info" | "debug";

/**
 * Error capture configuration
 */
interface CaptureConfig {
  /** Whether error capture is enabled */
  enabled: boolean;
  /** DSN/endpoint for the observability service */
  dsn?: string;
  /** Environment name (production, staging, development) */
  environment: string;
  /** App version for release tracking */
  release?: string;
  /** Sample rate for error capture (0.0 - 1.0) */
  sampleRate: number;
}

// Configuration (loaded from environment)
const config: CaptureConfig = {
  enabled: process.env.NEXT_PUBLIC_ERROR_CAPTURE_ENABLED === "true",
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  sampleRate: parseFloat(process.env.NEXT_PUBLIC_ERROR_SAMPLE_RATE || "1.0"),
};

// Current user context (set via setUser)
let currentUser: UserContext | null = null;

// Request ID for the current context
let currentRequestId: string | null = null;

/**
 * Generate a unique error ID for reference
 */
function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `err_${timestamp}_${random}`;
}

/**
 * Serialize error for logging/transmission
 */
function serializeError(error: Error): Record<string, unknown> {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error as Record<string, unknown>),
  };
}

/**
 * Send error to observability service
 * This is the integration point for Sentry/DataDog/etc.
 */
async function sendToService(
  error: Error,
  errorId: string,
  context: ErrorContext,
  severity: ErrorSeverity
): Promise<void> {
  // Check if capture is enabled and should sample
  if (!config.enabled || Math.random() > config.sampleRate) {
    return;
  }

  const payload = {
    errorId,
    error: serializeError(error),
    context: {
      ...context,
      requestId: context.requestId || currentRequestId,
      userId: context.userId || currentUser?.id,
      userEmail: context.userEmail || currentUser?.email,
    },
    severity,
    environment: config.environment,
    release: config.release,
    timestamp: new Date().toISOString(),
    user: currentUser,
  };

  // Log in development
  if (config.environment === "development") {
    console.group(`[ErrorCapture] ${severity.toUpperCase()}: ${error.message}`);
    console.log("Error ID:", errorId);
    console.log("Context:", context);
    console.log("Payload:", payload);
    console.groupEnd();
  }

  // TODO: Integrate with actual observability service
  // Example Sentry integration:
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.withScope((scope) => {
  //     scope.setTag("error_id", errorId);
  //     scope.setContext("error_context", context);
  //     scope.setLevel(severity);
  //     if (currentUser) scope.setUser(currentUser);
  //     Sentry.captureException(error);
  //   });
  // }

  // For now, log to console in production too (for debugging)
  if (config.environment === "production") {
    console.error(`[Error ${errorId}]`, error.message, context);
  }
}

/**
 * Capture an error and send to observability service
 *
 * @param error - The error to capture
 * @param context - Additional context for the error
 * @param severity - Severity level (default: "error")
 * @returns Error ID for reference
 *
 * @example
 * ```ts
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const errorId = captureError(error, {
 *     service: "DataService",
 *     action: "fetchData",
 *     errorCode: "DATA_FETCH_FAILED",
 *   });
 *   throw error; // Re-throw if needed
 * }
 * ```
 */
export function captureError(
  error: unknown,
  context: ErrorContext = {},
  severity: ErrorSeverity = "error"
): string {
  const errorId = generateErrorId();

  // Normalize error to Error instance
  const normalizedError =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : JSON.stringify(error));

  // Fire and forget - don't block on error capture
  sendToService(normalizedError, errorId, context, severity).catch((e) => {
    console.error("[ErrorCapture] Failed to send error:", e);
  });

  return errorId;
}

/**
 * Capture a message (non-error event) for logging
 *
 * @param message - Message to capture
 * @param context - Additional context
 * @param severity - Severity level (default: "info")
 * @returns Message ID for reference
 */
export function captureMessage(
  message: string,
  context: ErrorContext = {},
  severity: ErrorSeverity = "info"
): string {
  const errorId = generateErrorId();
  const syntheticError = new Error(message);
  syntheticError.name = "CapturedMessage";

  sendToService(syntheticError, errorId, context, severity).catch((e) => {
    console.error("[ErrorCapture] Failed to send message:", e);
  });

  return errorId;
}

/**
 * Set the current user context for error attribution
 *
 * @param user - User context or null to clear
 *
 * @example
 * ```ts
 * // On login
 * setUser({ id: user.id, email: user.email });
 *
 * // On logout
 * setUser(null);
 * ```
 */
export function setUser(user: UserContext | null): void {
  currentUser = user;

  // TODO: Also set in Sentry
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.setUser(user);
  // }
}

/**
 * Get the current user context
 */
export function getUser(): UserContext | null {
  return currentUser;
}

/**
 * Set the current request ID for correlation
 *
 * @param requestId - Request ID from middleware
 */
export function setRequestId(requestId: string | null): void {
  currentRequestId = requestId;
}

/**
 * Get the current request ID
 */
export function getRequestId(): string | null {
  return currentRequestId;
}

/**
 * Add a breadcrumb for debugging context
 *
 * @param message - Breadcrumb message
 * @param category - Category (e.g., "navigation", "http", "ui")
 * @param data - Additional data
 *
 * @example
 * ```ts
 * addBreadcrumb("User clicked checkout", "ui", { cartTotal: 99.99 });
 * ```
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  if (config.environment === "development") {
    console.log(`[Breadcrumb] [${category}] ${message}`, data || "");
  }

  // TODO: Add to Sentry
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.addBreadcrumb({ message, category, data, level: 'info' });
  // }
}

/**
 * Set a tag for filtering errors
 *
 * @param key - Tag key
 * @param value - Tag value
 */
export function setTag(key: string, value: string): void {
  // TODO: Set in Sentry
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.setTag(key, value);
  // }

  if (config.environment === "development") {
    console.log(`[Tag] ${key}: ${value}`);
  }
}

/**
 * Create a context wrapper for a specific service/feature
 *
 * @param service - Service name
 * @returns Object with capture methods pre-filled with service context
 *
 * @example
 * ```ts
 * const paymentCapture = createServiceCapture("PaymentService");
 * paymentCapture.error(error, { action: "processPayment" });
 * ```
 */
export function createServiceCapture(service: string) {
  return {
    error: (error: unknown, context: Omit<ErrorContext, "service"> = {}) =>
      captureError(error, { ...context, service }, "error"),
    warning: (error: unknown, context: Omit<ErrorContext, "service"> = {}) =>
      captureError(error, { ...context, service }, "warning"),
    message: (
      message: string,
      context: Omit<ErrorContext, "service"> = {},
      severity: ErrorSeverity = "info"
    ) => captureMessage(message, { ...context, service }, severity),
    breadcrumb: (
      message: string,
      category: string,
      data?: Record<string, unknown>
    ) => addBreadcrumb(`[${service}] ${message}`, category, data),
  };
}
