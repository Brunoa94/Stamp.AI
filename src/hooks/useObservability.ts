"use client";

import { useCallback, useEffect } from "react";
import {
  captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
  ErrorContext,
  ErrorSeverity,
} from "@/lib/observability/errorCapture";
import { useUser } from "@/queries/authQueries";

/**
 * Options for the useObservability hook
 */
export interface UseObservabilityOptions {
  /** Feature/component name for context */
  componentName?: string;
  /** Whether to automatically set user context */
  autoSetUser?: boolean;
}

/**
 * Return type for useObservability hook
 */
export interface UseObservabilityReturn {
  /** Capture an error with context */
  captureError: (
    error: unknown,
    context?: Omit<ErrorContext, "componentName">
  ) => string;
  /** Capture a message/event */
  captureMessage: (
    message: string,
    context?: Omit<ErrorContext, "componentName">,
    severity?: ErrorSeverity
  ) => string;
  /** Add a breadcrumb for debugging */
  addBreadcrumb: (
    message: string,
    category: string,
    data?: Record<string, unknown>
  ) => void;
  /** Track a user action */
  trackAction: (action: string, metadata?: Record<string, unknown>) => void;
}

/**
 * Hook for observability in React components
 *
 * Provides error capture, event tracking, and breadcrumb logging
 * with automatic user context integration.
 *
 * @param options - Hook configuration
 * @returns Observability methods
 *
 * @example
 * ```tsx
 * function PaymentForm() {
 *   const { captureError, trackAction } = useObservability({
 *     componentName: "PaymentForm",
 *   });
 *
 *   const handleSubmit = async (data: FormData) => {
 *     trackAction("payment_initiated", { amount: data.amount });
 *
 *     try {
 *       await processPayment(data);
 *       trackAction("payment_completed");
 *     } catch (error) {
 *       captureError(error, { action: "processPayment" });
 *       // Handle error in UI
 *     }
 *   };
 * }
 * ```
 */
export function useObservability(
  options: UseObservabilityOptions = {}
): UseObservabilityReturn {
  const { componentName, autoSetUser = true } = options;
  const { data: user } = useUser();

  // Automatically set user context when user changes
  useEffect(() => {
    if (autoSetUser) {
      if (user) {
        setUser({
          id: user.id,
          email: user.email || undefined,
        });
      } else {
        setUser(null);
      }
    }
  }, [user, autoSetUser]);

  // Capture error with component context
  const handleCaptureError = useCallback(
    (
      error: unknown,
      context: Omit<ErrorContext, "componentName"> = {}
    ): string => {
      return captureError(error, {
        ...context,
        componentName,
        userId: user?.id,
        userEmail: user?.email || undefined,
      });
    },
    [componentName, user]
  );

  // Capture message with component context
  const handleCaptureMessage = useCallback(
    (
      message: string,
      context: Omit<ErrorContext, "componentName"> = {},
      severity: ErrorSeverity = "info"
    ): string => {
      return captureMessage(
        message,
        {
          ...context,
          componentName,
          userId: user?.id,
          userEmail: user?.email || undefined,
        },
        severity
      );
    },
    [componentName, user]
  );

  // Add breadcrumb with component context
  const handleAddBreadcrumb = useCallback(
    (message: string, category: string, data?: Record<string, unknown>) => {
      const prefixedMessage = componentName
        ? `[${componentName}] ${message}`
        : message;
      addBreadcrumb(prefixedMessage, category, data);
    },
    [componentName]
  );

  // Track user action
  const trackAction = useCallback(
    (action: string, metadata?: Record<string, unknown>) => {
      handleAddBreadcrumb(action, "user_action", metadata);
    },
    [handleAddBreadcrumb]
  );

  return {
    captureError: handleCaptureError,
    captureMessage: handleCaptureMessage,
    addBreadcrumb: handleAddBreadcrumb,
    trackAction,
  };
}

export default useObservability;
