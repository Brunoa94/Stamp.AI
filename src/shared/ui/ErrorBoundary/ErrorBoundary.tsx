"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";
import { captureError, ErrorContext } from "@/lib/observability/errorCapture";

interface Props {
  children: ReactNode;
  /** Optional fallback component to render on error */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Feature/component name for error context */
  componentName?: string;
  /** Whether to show the default fallback UI */
  showFallback?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

/**
 * React Error Boundary for catching and handling unhandled errors.
 *
 * Features:
 * - Catches React rendering errors
 * - Captures errors to observability service
 * - Shows user-friendly fallback UI
 * - Provides error recovery via retry
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary componentName="PaymentForm">
 *   <PaymentForm />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, componentName } = this.props;

    // Build error context
    const context: ErrorContext = {
      componentName: componentName || "Unknown",
      componentStack: errorInfo.componentStack || undefined,
      action: "render",
    };

    // Capture to observability service
    const errorId = captureError(error, context);

    // Update state with error ID for display
    this.setState({ errorId });

    // Call optional error callback
    onError?.(error, errorInfo);

    // Log for development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Caught error:", error);
      console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorId } = this.state;
    const { children, fallback, showFallback = true } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Show default fallback UI
      if (showFallback) {
        return (
          <ErrorFallback
            error={error}
            errorId={errorId}
            onRetry={this.handleRetry}
          />
        );
      }

      // Return null if no fallback desired
      return null;
    }

    return children;
  }
}

export default ErrorBoundary;
