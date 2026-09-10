"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

/**
 * GlobalError
 *
 * Root error boundary for the entire application.
 * This catches errors that occur outside of the root layout.
 * Styled inline to match the Stamp luxury design system since
 * this component cannot import external styles.
 */
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
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#faf6f1",
          color: "#3d2817",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2rem",
              textAlign: "center",
              maxWidth: "32rem",
            }}
          >
            {/* Error icon */}
            <div
              style={{
                display: "flex",
                height: "5rem",
                width: "5rem",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(61, 40, 23, 0.08)",
                backgroundColor: "#fefefe",
                boxShadow: "6px 6px 0 rgba(61, 40, 23, 0.12)",
              }}
            >
              <AlertTriangle
                style={{ height: "2.5rem", width: "2.5rem", color: "#dc2626" }}
                strokeWidth={1.5}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 400,
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                Something went{" "}
                <span
                  style={{
                    color: "#c4a08a",
                    fontStyle: "italic",
                    fontFamily: "Georgia, serif",
                    textTransform: "lowercase",
                    fontWeight: 300,
                  }}
                >
                  wrong
                </span>
              </h1>

              <p
                style={{
                  fontSize: "1.125rem",
                  color: "#c4a08a",
                  fontWeight: 300,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                We encountered an unexpected error. Our team has been notified
                and is working to fix it.
              </p>
            </div>

            {/* Error digest for support reference */}
            {error.digest && (
              <div
                style={{
                  backgroundColor: "#fefefe",
                  padding: "0.75rem 1.5rem",
                  border: "1px solid rgba(61, 40, 23, 0.08)",
                  boxShadow: "6px 6px 0 rgba(61, 40, 23, 0.12)",
                }}
              >
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    color: "#c4a08a",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Reference: {error.digest}
                </p>
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={reset}
                style={{
                  backgroundColor: "#3d2817",
                  color: "#ffffff",
                  padding: "1rem 2rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#b9932f";
                  e.currentTarget.style.color = "#3d2817";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#3d2817";
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                style={{
                  backgroundColor: "transparent",
                  color: "#3d2817",
                  padding: "1rem 2rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  border: "1px solid #3d2817",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#3d2817";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#3d2817";
                }}
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
