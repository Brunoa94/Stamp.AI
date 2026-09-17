"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Global Error Boundary wrapper for the application.
 *
 * This component wraps the entire application and catches
 * any unhandled React errors, preventing full app crashes
 * and providing a fallback UI.
 *
 * Must be a client component to use class-based Error Boundary.
 */
export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      componentName="App"
      onError={(error, errorInfo) => {
        // Log to console in development
        if (process.env.NODE_ENV === "development") {
          console.error("[GlobalErrorBoundary] Uncaught error:", error);
          console.error("[GlobalErrorBoundary] Component stack:", errorInfo.componentStack);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default GlobalErrorBoundary;
