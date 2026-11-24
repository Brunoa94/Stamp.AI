"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

/**
 * GlobalError
 *
 * Root error boundary for the entire application.
 * This catches errors that occur outside of the root layout, so it renders
 * its own <html> without the app's stylesheet or fonts. The Stamp look is
 * reproduced in the inline <style> below with the palette's literal values
 * (keep them in sync with src/app/globals-stamp.css): off-white page,
 * chocolate text, a white rounded-xl icon card, amber accent bar and
 * accent word, and rounded-lg uppercase buttons (chocolate → amber on
 * hover, chocolate outline) with a chocolate focus outline.
 */

const GLOBAL_ERROR_STYLES = `
  .ge-body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #fdfbf8; color: #342419; }
  .ge-shell { display: flex; min-height: 100vh; width: 100%; box-sizing: border-box; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; }
  .ge-stack { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; text-align: center; max-width: 32rem; }
  .ge-icon { display: flex; height: 5rem; width: 5rem; align-items: center; justify-content: center; border-radius: 0.75rem; border: 1px solid rgba(52, 36, 25, 0.1); background-color: #ffffff; box-shadow: 0 1px 3px rgba(52, 36, 25, 0.08); }
  .ge-bar { height: 0.375rem; width: 4rem; border-radius: 9999px; background-color: #d0842e; }
  .ge-title { margin: 0; font-family: Rockwell, "Roboto Slab", Georgia, serif; font-size: 2.25rem; font-weight: 400; line-height: 1.15; letter-spacing: -0.025em; }
  .ge-accent { color: #955415; font-family: "Comic Sans MS", "Segoe Print", cursive; font-style: italic; text-transform: lowercase; }
  .ge-text { margin: 0; font-size: 1.125rem; line-height: 1.6; color: #6c5749; }
  .ge-ref { margin: 0; border-radius: 0.5rem; border: 1px solid rgba(52, 36, 25, 0.1); background-color: #ffffff; padding: 0.75rem 1.5rem; font-family: monospace; font-size: 0.75rem; letter-spacing: 0.025em; text-transform: uppercase; color: #6c5749; }
  .ge-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }
  .ge-button { border-radius: 0.5rem; border: 2px solid #342419; padding: 0.875rem 1.5rem; font: inherit; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.025em; text-transform: uppercase; cursor: pointer; transition: background-color 0.3s, color 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s; }
  .ge-button:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 rgba(52, 36, 25, 0.14); }
  .ge-button:focus-visible { outline: 2px solid #342419; outline-offset: 2px; }
  .ge-primary { background-color: #342419; color: #ffffff; }
  .ge-primary:hover { background-color: #d0842e; border-color: #d0842e; color: #342419; }
  .ge-secondary { background-color: transparent; color: #342419; }
  .ge-secondary:hover { background-color: #342419; color: #ffffff; }
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <style>{GLOBAL_ERROR_STYLES}</style>
      </head>
      <body className="ge-body">
        <div className="ge-shell">
          <div className="ge-stack">
            {/* Error icon */}
            <div className="ge-icon">
              <AlertTriangle
                aria-hidden
                style={{ height: "2.5rem", width: "2.5rem", color: "#dc2626" }}
                strokeWidth={1.5}
              />
            </div>

            <div aria-hidden className="ge-bar" />

            <h1 className="ge-title">
              Something went <span className="ge-accent">wrong</span>
            </h1>

            <p className="ge-text">
              We encountered an unexpected error. Our team has been notified
              and is working to fix it.
            </p>

            {/* Error digest for support reference */}
            {error.digest && <p className="ge-ref">Reference: {error.digest}</p>}

            {/* Actions */}
            <div className="ge-actions">
              <button type="button" onClick={reset} className="ge-button ge-primary">
                Try Again
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="ge-button ge-secondary"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
