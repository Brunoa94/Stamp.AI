"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

interface ErrorFallbackProps {
  error: Error | null;
  errorId: string | null;
  onRetry?: () => void;
}

/**
 * ErrorFallback
 *
 * Fallback UI displayed when an error boundary catches an error, in the
 * Stamp look: a white rounded icon card, an amber accent bar, a slab-serif
 * title with a handwritten accent word, and the stamp button variants.
 */
export function ErrorFallback({ error, errorId, onRetry }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-(--color-stamp-off-white) px-4 py-20 sm:px-6 lg:px-12">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        {/* Error icon */}
        <div className="flex size-20 items-center justify-center rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) shadow-(--shadow-stamp-card)">
          <AlertTriangle
            aria-hidden
            className="size-10 text-(--color-stamp-error)"
            strokeWidth={1.5}
          />
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
          <Heading
            as="h1"
            variant="panelTitle"
            className="text-(--color-stamp-chocolate)"
          >
            Something went{" "}
            <Span variant="serif" className="text-(--color-stamp-gold-text)">
              wrong
            </Span>
          </Heading>

          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            We encountered an unexpected error. Our team has been notified and
            is working to fix it.
          </Paragraph>
        </div>

        {/* Error ID for support reference */}
        {errorId && (
          <div className="rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) px-6 py-3">
            <Paragraph variant="xs" className="font-mono text-sm tracking-wide text-(--color-stamp-taupe) uppercase">
              Reference: {errorId}
            </Paragraph>
          </div>
        )}

        {/* Development-only error details */}
        {isDev && error && (
          // eslint-disable-next-line no-restricted-syntax -- dev-only stack-trace panel, not a Disclosure card
          <details className="w-full overflow-hidden rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) text-left">
            {/* eslint-disable-next-line no-restricted-syntax -- dev-only stack-trace panel, not a Disclosure card */}
            <summary className="cursor-pointer rounded-xl px-6 py-4 text-sm font-bold tracking-wide text-(--color-stamp-taupe) uppercase transition-colors hover:text-(--color-stamp-chocolate) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)">
              Error Details (Dev Only)
            </summary>
            <div className="border-t border-(--color-stamp-divider) bg-(--color-stamp-chocolate) p-6 overflow-auto max-h-64">
              <pre className="text-xs text-(--color-stamp-error) font-mono">
                <strong>{error.name}:</strong> {error.message}
              </pre>
              {error.stack && (
                <pre className="mt-4 text-xs text-(--color-stamp-taupe-light) font-mono whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Try Again
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
