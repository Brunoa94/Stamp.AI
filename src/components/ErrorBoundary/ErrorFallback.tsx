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
 * Fallback UI displayed when an error boundary catches an error.
 * Styled to match the Stamp luxury design system.
 */
export function ErrorFallback({ error, errorId, onRetry }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-(--color-stamp-cream) p-8 md:p-12 lg:p-24">
      <div className="flex flex-col items-center gap-8 text-center max-w-xl">
        {/* Error icon */}
        <div className="flex h-20 w-20 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-off-white) shadow-(--shadow-stamp-card)">
          <AlertTriangle
            className="h-10 w-10 text-(--color-stamp-error)"
            strokeWidth={1.5}
          />
        </div>

        <div className="space-y-4">
          <Heading
            as="h1"
            variant="panelTitle"
            className="text-(--color-stamp-chocolate)"
          >
            Something went{" "}
            <Span variant="default" className="text-(--color-stamp-taupe) italic font-serif lowercase font-light">
              wrong
            </Span>
          </Heading>

          <Paragraph
            variant="lead"
            className="text-(--color-stamp-taupe) font-light"
          >
            We encountered an unexpected error. Our team has been notified and
            is working to fix it.
          </Paragraph>
        </div>

        {/* Error ID for support reference */}
        {errorId && (
          <div className="bg-(--color-stamp-off-white) px-6 py-3 border border-(--color-stamp-divider) shadow-(--shadow-stamp-card)">
            <Paragraph variant="micro" className="font-mono text-(--color-stamp-taupe) tracking-wider uppercase">
              Reference: {errorId}
            </Paragraph>
          </div>
        )}

        {/* Development-only error details */}
        {isDev && error && (
          <details className="w-full text-left border border-(--color-stamp-divider) bg-(--color-stamp-off-white)">
            <summary className="cursor-pointer px-6 py-4 text-sm text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) uppercase tracking-wider font-medium transition-colors">
              Error Details (Dev Only)
            </summary>
            <div className="border-t border-(--color-stamp-divider) bg-(--color-stamp-chocolate) p-6 overflow-auto max-h-64">
              <pre className="text-xs text-(--color-stamp-error) font-mono">
                <strong>{error.name}:</strong> {error.message}
              </pre>
              {error.stack && (
                <pre className="mt-4 text-xs text-(--color-stamp-taupe) font-mono whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase"
            >
              Try Again
            </Button>
          )}
          <Button
            variant="secondary-compact"
            onClick={() => {
              window.location.href = "/";
            }}
            className="border border-(--color-stamp-chocolate) text-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-white transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
