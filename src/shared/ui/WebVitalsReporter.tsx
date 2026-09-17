"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { handleNextWebVital } from "@/lib/observability/webVitals";

/**
 * Web Vitals Reporter Component
 *
 * This component captures Core Web Vitals metrics and reports them to Sentry.
 * It should be included once in the app, typically in the root layout.
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Perceived loading speed
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Overall responsiveness
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    handleNextWebVital(metric);
  });

  useEffect(() => {
    // Log in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("[WebVitals] Reporter initialized");
    }
  }, []);

  return null;
}
