"use client";

import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";

interface ErrorFallbackProps {
  error: Error | null;
  errorId: string | null;
  onRetry?: () => void;
}

/**
 * Fallback UI displayed when an error boundary catches an error.
 * Provides user-friendly error message and retry option.
 */
export function ErrorFallback({ error, errorId, onRetry }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-100 w-full flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Error icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <Heading variant="card" className="text-(--color-stamp-chocolate)">
          Something went wrong
        </Heading>

        <p className="max-w-md text-base text-(--color-stamp-taupe)">
          We encountered an unexpected error. Our team has been notified and is
          working to fix it.
        </p>

        {/* Error ID for support reference */}
        {errorId && (
          <div className="rounded-md bg-(--color-stamp-cream) px-3 py-2 border border-(--color-stamp-divider)">
            <p className="font-mono text-xs text-(--color-stamp-taupe)">
              Error ID: {errorId}
            </p>
          </div>
        )}

        {/* Development-only error details */}
        {isDev && error && (
          <details className="mt-4 w-full max-w-lg text-left">
            <summary className="cursor-pointer text-sm text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate)">
              Show error details (dev only)
            </summary>
            <div className="mt-2 overflow-auto rounded-md bg-gray-900 p-4">
              <pre className="text-xs text-red-400">
                <strong>{error.name}:</strong> {error.message}
              </pre>
              {error.stack && (
                <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onRetry && (
          <Button variant="primary-compact" onClick={onRetry}>
            Try Again
          </Button>
        )}
        <Button
          variant="secondary-compact"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}

export default ErrorFallback;
